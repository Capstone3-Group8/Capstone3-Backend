// routes/index.js — one place to collect all routers.
// Lets app.js grab them from here: const { userRouter } = require('./routes')

const userRouter = require('./user.routes');
const authRouter = require('./auth.routes');
const plaidRouter = require('./plaid.routes')

// Add a new resource? Import its router above and add one line here.
module.exports = {
  userRouter,
  authRouter,
  plaidRouter
};
