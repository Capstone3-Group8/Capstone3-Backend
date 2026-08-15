const express = require("express");
const router = express.Router();
const { plaidClient } = require("../plaid");
const { requireAuth } = require('../middleware/auth');
const { PlaidItem } = require("../models");

router.post('/create-link-token', requireAuth, async(req,res,next) => {
    try {
        //linkTokenCreate() is a call over the network to Plaid's server so returns a promise
        const response = await plaidClient.linkTokenCreate({ 
            user: {
                client_user_id: req.user.id,
            }, 
            client_name: 'Capstone3', 
            products: process.env.PLAID_PRODUCTS.split(','),
            country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
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
        res.json({ success: true });


    } catch (error) {
        next(error);
    }
});

module.exports = router;