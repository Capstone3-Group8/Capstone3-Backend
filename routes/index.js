// routes/index.js — one place to collect all routers.
// Lets app.js grab them from here: const { userRouter } = require('./routes')

const userRouter = require("./user.routes");
const authRouter = require("./auth.routes");
const plaidRouter = require("./plaid.routes");
const transactionRouter = require("./transaction.routes");
const categoryRouter = require("./category.routes");
const accountRouter = require("./acc-routes");
<<<<<<< HEAD
const budgetRouter = require("./budget-routes")
=======
const financialInsightsRouter = require("./financial-insights.routes");

>>>>>>> 7b65ddb832ea17bec0186bc5609c7f8f5dbbcc35
// Add a new resource? Import its router above and add one line here.
module.exports = {
  userRouter,
  authRouter,
  plaidRouter,
  transactionRouter,
  categoryRouter,
  accountRouter,
<<<<<<< HEAD
  budgetRouter
=======
  financialInsightsRouter,
>>>>>>> 7b65ddb832ea17bec0186bc5609c7f8f5dbbcc35
};
