const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { plaidClient,  } = require("../plaid");
const { requireAuth } = require('../middleware/auth')
=======
const { plaidClient } = require("../plaid");
const { requireAuth } = require('../middleware/auth');
const { PlaidItem, PlaidAccount, PlaidTransaction } = require("../models");
>>>>>>> 7b65ddb832ea17bec0186bc5609c7f8f5dbbcc35

router.post('/create-link-token', requireAuth, async(req,res,next) => {
    try {
        //linkTokenCreate() is a call over the network to Plaid's server so returns a promise
        const response = await plaidClient.linkTokenCreate({ 
            user: {
                client_user_id: req.user.id,
            }, 
            client_name: 'Capstone3', 
            products: process.env.PLAID_PRODUCTS.split(','),
            country_codes: process.env.PLAID_COUNTRY_CODES.split('s,'),
            language: 'en'
        });
        res.json({link_token: response.data.link_token})
    } catch (error) {
        console.error('Plaid error:', error.response?.data || error.message )
        next(error)
    }

});

router.post('/exchange-public-token', requireAuth, async(req, res, next) => {
    try {
        const { public_token } = req.body;

        const response = await plaidClient.itemPublicTokenExchange({ public_token });
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
        
        await Promise.all( accounts.map((account) => 
            PlaidAccount.create({
                user_id: req.user.id,
                item_id: item_id,
                account_id: account.account_id,
                name: account.name,
                mask: account.mask,
                type: account.type,
                subtype: account.subtype,
                current_balance: account.balances.current,
                available_balance: account.balances.available
                })
            )
        )

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

<<<<<<< HEAD
router.get("/transactions", requireAuth, async(req, res, next) => {
    try{
        const item = await PlaidItem.findOne({
            where: { user_id: req.user.id },
        });

        if(!item){
            return res.status(404).json( {error: "No Plaid Item Found!!!"});
        }

        const start_date = "12/18/1983";
        const end_date = new Date().toISOString().split("T")[0];

        const response = await plaidClient.transactionsGet({
            access_token: item_.access_token,
            start_date,
            end_date,
        });

        const transactions =response.data.transactions;

        for(const tx of transactions){
            await PlaidTransaction.upsert({
                user_id: req.user.id,
                account_id: tx.account_id,
                transaction_id: tx.transaction_id,
                amount: tx.amount,
                date: tx.date,
                name: tx.name,
                merchant_name: tx.merchant_name,
                category: tx.category?.join(", ") || null,
                pending: tx.pending,
            });
        }

        res.json(transactions);
    }catch(err){
        next(err);    
=======
router.post('/sync-transactions', requireAuth, async(req, res, next) => {
    try {
        const plaidItem = await PlaidItem.findOne({ where: { user_id: req.user.id }})
        if (!plaidItem){
            return res.status(404).json({ error: 'No linked bank account found' })
        }
        
        const endDate = new Date().toISOString().split('T')[0]; // today, as YYYY-MM-DD
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

        const transactionResponse = await plaidClient.transactionsGet({ 
            access_token: plaidItem.access_token,
            start_date: startDate,
            end_date: endDate
        })

        const transactions = transactionResponse.data.transactions;

        await Promise.all(
            transactions.map((transaction) =>
            PlaidTransaction.create({
                user_id: req.user.id,
                account_id: transaction.account_id,
                transaction_id: transaction.transaction_id,
                amount: transaction.amount,
                date: transaction.date,
                name: transaction.name,
                merchant_name: transaction.merchant_name,
                // categories are arrays ofr something like["Food and Drink, Restaurants"] so
                // just turn these arrays into strings to avoid errors when creating them into postgres
                category: transaction.category ? transaction.category.join(', ') : null,
                pending: transaction.pending
            }))
        )

        res.json({ success: true, count: transactions.length });


    } catch (error) {
        next(error)
>>>>>>> 7b65ddb832ea17bec0186bc5609c7f8f5dbbcc35
    }
})

module.exports = router;