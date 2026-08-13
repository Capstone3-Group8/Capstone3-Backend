const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction-models");
const Account = require("../models/acc-models");
const Category = require("../models/category-models");
const { requireAuth } = require("../middleware/auth");

// GET all transactions for logged-in user
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { user_id: req.user.id },
      order: [["id", "ASC"]],
    });

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
});

// GET a single transaction by ID
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const transaction = await Transaction.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
});

// CREATE a transaction
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      account_id,
      category_id,
      amount,
      type,
      date,
      description,
    } = req.body;

    // Validate required fields
    if (
      !account_id ||
      !category_id ||
      !amount ||
      !type ||
      !date ||
      !description
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify account belongs to user
    const account = await Account.findOne({
      where: { id: account_id, user_id: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found or not yours" });
    }

    // Verify category belongs to user
    const category = await Category.findOne({
      where: { id: category_id, user_id: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found or not yours" });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user_id: req.user.id,
      account_id,
      category_id,
      amount,
      type,
      date,
      description,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// UPDATE a transaction
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    const updates = {};
    for (const key of [
      "account_id",
      "category_id",
      "amount",
      "type",
      "date",
      "description",
    ]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await transaction.update(updates);
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE a transaction
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    await transaction.destroy();
    return res.status(200).json({ msg: "Transaction deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
