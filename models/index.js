// models/index.js — one place to collect all models and their relationships.
// Lets the rest of the app grab them from here: const { Task } = require('./models')

const db = require("../db");
const Account = require("./acc-models");
const Category = require("./category-models");
const User = require("./user.model");

// ---------- associations ----------
// Describe how tables relate here. When you're ready to tie tasks to their
// owner, uncomment these (it adds a userId column to tasks):
//   User.hasMany(Task)     // one user has many tasks
//   Task.belongsTo(User)   // each task belongs to one user (adds a userId column)

module.exports = {
  db, // exported too so seed.js can sync from one place
  Account,
  Category,
  User,
};

// User has many Accounts, Categories, and Budgets
// Account has many Transactions
// Category has many Transactions and Budgets
