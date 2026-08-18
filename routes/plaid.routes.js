const express = require("express");
const router = express.Router();
const { plaidClient,  } = require("../plaid");
const { requireAuth } = require('../middleware/auth')

router.post('/create-link-token', requireAuth, async(req,res,next) => {
    try {
        //linkTokenCreate() is a call over the network to Plaid's server so returns a promise
        const response = await plaidClient.linkTokenCreate({ 
            client_user_id: req.user.id, 
            client_name: 'Capstone3', 
            products: process.env.PLAID_PRODUCTS.split(','),
            country_codes: process.env.PLAID_COUNTRY_CODES.split('s,'),
            language: 'en'
        });
        res.json({link_token: response.data.link_token})
    } catch (error) {
        next(error)
    }

});

router.post('/exchange-public-token', requireAuth, async(req, res, next) => {
    try{
        const {public_token} = req.body;
        const response = await plaidClient.itemPublicTokenExchange({
            public_token,
        });
        const access_token = response.data.access_token;
        const item_id = response.data.item_id;

        const item = await PlaidItem.create({
            user_id: req.user.id,
            item_id,
            access_token,
        });

        res.json({item});
    }catch(err){
        next(err);
    }
});

router.get("/accounts", requireAuth, async(req, res, next) => {
    try{
        const item = await PlaidItem.findOne({
            where: { user_id: req.user.id },
        });
        if(!item){
            return res.status(404).json({ error: "No Plaid Item Found!!!"});
        }
        const response = await plaidClient.accountsGet({
            access_token: item.access_token,
        });

        const accounts = await response.data.accounts;

        for( const acc of accounts) {
            await PlaidAccount.upsert({
                user_id: req.user.id,
                item_id: item.item_id,
                account_id: acc.account_id,
                name: acc.name,
                mask: acc.mask,
                type: acc.type,
                subtype: acc.subtype,
                current_balance: acc.balances.current,
                available_balance: acc.balances.available,
            });
        }

        res.json(accounts);
    }catch(error){
        next(error);
    }
});

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
    }
})

module.exports = router;