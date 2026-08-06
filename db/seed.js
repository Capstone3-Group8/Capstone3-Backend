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
    await User.bulkCreate([
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
    ]);
    console.log("🌱 Sample users created.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await db.close(); // close the connection so the script can exit
    console.log("🌱 Done. Connection closed.");
  }
};

seed();
