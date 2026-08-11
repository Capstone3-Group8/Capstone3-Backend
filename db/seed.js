// db/seed.js — reset the tables and fill them with sample data.  Run: npm run seed
// Gives you (and your teammates) the same predictable rows to build against.
require("dotenv").config();

const { db, User, Account, Transaction, Category } = require("../models");

const seed = async () => {
  try {
    // force: true DROPS every table and recreates it empty.
    // Perfect for a seed script — never do this to real user data.
    await db.sync({ force: true });
    console.log("🌱 Database reset.");
    console.log("🌱 Sample tasks created.");

    // Sample users. In real life these rows come from Auth0 logins (auth0Id is
    // the token's "sub"). Here we fake a couple so the users table isn't empty.
    const users = await User.bulkCreate(
      [
        {
          auth0Id: "auth0|seed-ada",
          username: "ada",
          email: "ada@example.com",
          name: "Ada Lovelace",
        },
        {
          auth0Id: "auth0|seed-alan",
          username: "alan",
          email: "alan@example.com",
          name: "Alan Turing",
        },
      ],
      { returning: true },
    );
    console.log("🌱 Sample users created.");

    // Sample Category
    const categories = await Category.bulkCreate(
      [
        {
          name: "Salary",
          type: "income",
          budget: 2000,
        },
        {
          name: "Groceries",
          type: "expense",
          budget: 500,
        },
        {
          name: "Rent",
          type: "expense",
          budget: 2200,
        },
      ],
      { returning: true },
    );
    console.log("🌱Seed Categories created.");

    //Sample Account
    const accounts = await Account.bulkCreate(
      [
        {
          user_id: users[0].id,
          name: "Checking Account",
          balance: 50000,
        },
        {
          user_id: users[1].id,
          name: "Savings Account",
          balance: 25000,
        },
      ],
      { returning: true },
    );
    console.log("Seed Accounts Created");

    await Transaction.bulkCreate([
      {
        user_id: users[0].id,
        account_id: accounts[0].id,
        category_id: categories[1].id,
        amount: 700,
        type: "withdrawal",
        date: new Date(),
        description: "Errands",
      },
      {
        user_id: users[0].id,
        account_id: accounts[0].id,
        category_id: categories[0].id,
        amount: 4000,
        type: "deposit",
        date: new Date(),
        description: "Paycheck",
      },
    ]);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await db.close(); // close the connection so the script can exit
    console.log("🌱 Done. Connection closed.");
  }
};

seed();
