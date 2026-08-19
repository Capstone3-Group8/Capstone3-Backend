// db/seed.js — reset the tables and fill them with sample data.  Run: npm run seed
// Gives you (and your teammates) the same predictable rows to build against.
require("dotenv").config();
const { faker } = require("@faker-js/faker");
const { db, User, Account, Transaction, Category } = require("../models");

const seed = async () => {
  try {

    await db.sync({ force: true });
    console.log("Database reset.");


    const userData = Array.from({ length: 4 }, () => ({
      auth0Id: `auth0|seed-${faker.string.uuid()}`,
      username: faker.internet.username().slice(0,20), //model cap at 20 char
      email: faker.internet.email(),
    }))
    
    const users = await User.bulkCreate( userData, { returning: true});
    console.log("Sample users added")

    // Sample Category
    const categoryTemp = [
        {
          name: "Salary",
          type: "Income",
          budget: 2000,
        },
        {
          name: "Groceries",
          type: "Expense",
          budget: 500,
        },
        {
          name: "Rent",
          type: "Expense",
          budget: 2200,
        },
        {
          name: "Utilities",
          type: "Expense",
          budget: 250,
        },
        {
          name: "Entertainment",
          type: "Expense",
          budget: 200,
        },
        {
          name: "Freelance",
          type: "Income",
          budget: 800,
        }

      ];
      const categoryData = users.flatMap((user) => //flatMap makes
      categoryTemp.map((temp) => ({
        ...temp, user_id: user.id,
      })),
    );
    
    const categories = await Category.bulkCreate(categoryData, { returning: true})
    console.log('categories created')

    //Sample Account
    const accouuntData = users.flatMap((user) => {
      const numAccounts = faker.number.int({ min: 2, max: 8});
      return Array.from({ length: numAccounts }, () => ({
        user_id: user.id,
        name: faker.finance.accountName(),
        type: faker.helpers.arrayElement(["checking", "savings"]),
        balance: faker.finance.amount({min: 100, max: 60000, dec: 2}),
        bank_name: faker.company.name(),
      }))
    })
    
    
    const accounts = await Account.bulkCreate(accouuntData, { returning: true });
    console.log("Accounts Created");



    //transaction
    const transactionData = Array.from({ length: 40}, () => {
      const randomAccount = faker.helpers.arrayElement(accounts)
      const userCategories = categories.filter((cat) => cat.user_id === randomAccount.user_id, )
      const randomCategory = faker.helpers.arrayElement(userCategories)
      const isDeposit = randomCategory.type === "Income"

      return {
        user_id: randomAccount.user_id,
        account_id: randomAccount.id,
        category_id: randomCategory.id,
        amount: faker.finance.amount({ min: 5, max: 800, dec: 2}),
        type: isDeposit ? "Deposit" : "Withdrawal", 
        date: faker.date.recent({ days: 90 }),
        description: faker.finance.transactionDescription(),
      }
    })
    await Transaction.bulkCreate(transactionData)
    console.log("Transactions created")
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await db.close(); // close the connection so the script can exit
    console.log("Done. Connection closed.");
  }
};

seed();
