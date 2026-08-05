const express = require("express");
const router = express.Router();
const { plaidClient } = require("../plaid");
const { requireAuth } = require('../middleware/auth')

router.post('/create-link-token', requireAuth, async(req,res,next) => {
    try {
        //linkTokenCreate() is a call over the network to Plaid's server so returns a promise
        const response = await plaidClient.linkTokenCreate({ 
            client_user_id: req.user.id, 
            client_name: 'Capstone3', 
            products: process.env.PLAID_PRODUCTS.split(','),
            country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
            language: 'en'
        });
        res.json({link_token: response.data.link_token})
    } catch (error) {
        next(error)
    }

});

module.exports = router;