const express = require("express");
const router = express.Router();
const { plaidClient } = require("../plaid");
const { requireAuth } = require("../middleware/auth");
const { PlaidItem, PlaidAccount, PlaidTransaction, Category } = require("../models");
const { categorizeTransactions, suggestCategories } = require("../services/transactionCategorization");

// Plaid sometimes needs a moment to prepare transaction data right after a
// bank is linked — it responds with PRODUCT_NOT_READY during that window.
// Retry a few times with a short delay instead of failing immediately.
async function getTransactionsWithRetry(access_token, start_date, end_date, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await plaidClient.transactionsGet({ access_token, start_date, end_date });
    } catch (error) {
      const isNotReady = error.response?.data?.error_code === "PRODUCT_NOT_READY";
      if (isNotReady && i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds
        continue;
      }
      throw error;
    }
  }
}

router.post("/create-link-token", requireAuth, async (req, res, next) => {
  try {
    //linkTokenCreate() is a call over the network to Plaid's server so returns a promise
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.id,
      },
      client_name: "Capstone3",
      products: process.env.PLAID_PRODUCTS.split(","),
      country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
      language: "en",
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Plaid error:", error.response?.data || error.message);
    next(error);
  }
});

router.post("/exchange-public-token", requireAuth, async (req, res, next) => {
  try {
    const { public_token } = req.body;

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const { access_token, item_id } = response.data;

    await PlaidItem.create({
      user_id: req.user.id,
      item_id: item_id,
      access_token: access_token,
    });

    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

    //could not figure out how accounts data looks like, in account.balances I had blalance so it was returning undefined
    //console.log(JSON.stringify(accounts, null, 2));

    await Promise.all(
      accounts.map((account) =>
        PlaidAccount.create({
          user_id: req.user.id,
          item_id: item_id,
          account_id: account.account_id,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          current_balance: account.balances.current,
          available_balance: account.balances.available,
        }),
      ),
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/sync-transactions", requireAuth, async (req, res, next) => {
  try {
    const plaidItem = await PlaidItem.findOne({
      where: { user_id: req.user.id },
    });
    if (!plaidItem) {
      return res.status(404).json({ error: "No linked bank account found" });
    }

    const endDate = new Date().toISOString().split("T")[0]; // today, as YYYY-MM-DD
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]; // 30 days ago

    const transactionResponse = await getTransactionsWithRetry(
      plaidItem.access_token,
      startDate,
      endDate,
    );

    const transactions = transactionResponse.data.transactions;

    await Promise.all(
      transactions.map((transaction) =>
        PlaidTransaction.findOrCreate({
          where: { transaction_id: transaction.transaction_id },
          defaults: {
            user_id: req.user.id,
            account_id: transaction.account_id,
            transaction_id: transaction.transaction_id,
            amount: transaction.amount,
            date: transaction.date,
            name: transaction.name,
            merchant_name: transaction.merchant_name,
            // categories are arrays ofr something like["Food and Drink, Restaurants"] so
            // just turn these arrays into strings to avoid errors when creating them into postgres
            category: transaction.category
              ? transaction.category.join(", ")
              : null,
            pending: transaction.pending,
          },
        }),
      ),
    );

    // ---------- categorize the synced transactions using Gemini ----------
    const userCategories = await Category.findAll({
      where: { user_id: req.user.id },
    });

    const transactionsForAI = transactions.map((t) => ({
      transaction_id: t.transaction_id,
      name: t.name,
      merchant_name: t.merchant_name,
      category: t.category ? t.category.join(", ") : null,
      amount: t.amount,
      type: t.amount > 0 ? "withdrawal" : "deposit", // Plaid: positive = money out
    }));

    const matches = await categorizeTransactions(transactionsForAI, userCategories);

    await Promise.all(
      matches.map((match) => {
        if (!match.category_id) return null;
        return PlaidTransaction.update(
          { category_id: match.category_id },
          { where: { transaction_id: match.transaction_id } },
        );
      }),
    );

    res.json({ success: true, count: transactions.length });
  } catch (error) {
    console.error("Sync-transactions error:", error.response?.data || error.message);
    next(error);
  }
});

router.get("/accounts", requireAuth, async (req, res, next) => {
  try {
    const accounts = await PlaidAccount.findAll({
      where: { user_id: req.user.id },
    });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.get("/transactions", requireAuth, async (req, res, next) => {
  try {
    const transactions = await PlaidTransaction.findAll({
      where: { user_id: req.user.id },
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get("/suggested-categories", requireAuth, async (req, res, next) => {
  try {
    const uncategorized = await PlaidTransaction.findAll({
      where: { user_id: req.user.id, category_id: null },
    });

    if (uncategorized.length === 0) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await suggestCategories(uncategorized);
    res.json({ suggestions });
  } catch (error) {
    console.error("Suggested-categories error:", error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;