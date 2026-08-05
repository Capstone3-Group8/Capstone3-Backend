const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');



const config = new Configuration({
    //making a phone call to PLAID
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: { 
        headers: {
            //In the header we need to tell the person on the phone who is calling
            'PLAID-CLIENT-ID':process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET':process.env.PLAID_SECRET
        },
    },
});

// this is the phone connection
const plaidClient = new PlaidApi(config)

module.exports = { plaidClient }