// models/index.js — one place to collect all models and their relationships.
// Lets the rest of the app grab them from here: const { Task } = require('./models')

const db = require("../db");
const Account = require("./acc-models");
const Category = require("./category-models");
const User = require("./user.model");
const Transaction = require("./transaction-models");
const PlaidItem = require("./PlaidItem");
const PlaidAccount = require("./PlaidAccount");
const PlaidTransaction = require("./PlaidTransaction")

// ---------- associations ----------
// Describe how tables relate here. When you're ready to tie tasks to their
// owner, uncomment these (it adds a userId column to tasks):
//   User.hasMany(Task)     // one user has many tasks
//   Task.belongsTo(User)   // each task belongs to one user (adds a userId column)

// User Relationships
User.hasMany(Account, { foreignKey: "user_id", onDelete: "CASCADE" });
Account.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Category, { foreignKey: "user_id", onDelete: "CASCADE" });
Category.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Transaction, { foreignKey: "user_id", onDelete: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(PlaidItem, { foreignKey: "user_id", onDelete: "CASCADE"});
PlaidItem.belongsTo(User, { foreignKey: "user_id"})


// Category and Transaction Relationship
Category.hasMany(Transaction, { foreignKey: "category_id" });
Transaction.belongsTo(Category, { foreignKey: "category_id" });

// Account and Transaction Relationship
Account.hasMany(Transaction, { foreignKey: "account_id" });
Transaction.belongsTo(Account, { foreignKey: "account_id" });

//Plaid Relations
PlaidItem.hasMany(PlaidAccount, { foreignKey: "item_id"})
PlaidAccount.belongsTo(PlaidItem, { foreignKey: "item_id"})

PlaidAccount.hasMany(PlaidTransaction, { foreignKey: "account_id"})
PlaidTransaction.belongsTo(PlaidAccount, {foreignKey: "account_id"})

module.exports = {
  db, // exported too so seed.js can sync from one place
  Account,
  Category,
  User,
  Transaction,
  PlaidItem,
  PlaidAccount,
  PlaidTransaction
};

// User has many Accounts, Categories, and Transactions
// Accounts, Cateogories and Transactions have One User
// Transaction has one Category
// Category has many Transactions
// Account has many Transactions
// Transaction has one Account
