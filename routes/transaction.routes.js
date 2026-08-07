const express = require("express");
const router = express.Router();
const TransactionModel = require("../models/transaction-models");

//route for getting all the transactions
router.get("/", async (req, res, next) => {
    try {
        const transactions = await TransactionModel.findAll();
        return res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
});


//route for getting a transaction by its Id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const foundTransaction = await TransactionModel.findByPk(id);

    if (!foundTransaction) {
      return res.status(404).json({ msg: "Transaction not found." });
    }
    return res.status(200).json(foundTransaction);
  } catch (error) {
    next(error);
  }
});

//route for posting a transaction
router.post("/", async (req, res, next) => {
  try {
    const { user_id, account_id, category_id, amount, type, date, description } =
      req.body;

    if (!user_id || !account_id || !category_id || !amount || !type || !date || !description) {
      return res
        .status(400)
        .json({ msg: "user_id, account_id, category_id, amount, type, date, and description are needed!" });
    }
    const newTransaction = await TransactionModel.create({
      user_id,
      account_id,
      category_id,
      amount,
      type,
      date,
      description,
    });
    return res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
});

//route for updating the transaction
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundTransaction = await TransactionModel.findByPk(id);

    if (!foundTransaction) {
      return res.status(404).json({ msg: "Transaction not found." });
    }

    const updates = {};
    for (const key of ["account_id", "category_id", "amount", "type", "date", "description"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updatedTransaction = await foundTransaction.update(updates);
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

//route for deleting the cafe by its Id.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundTransaction = await TransactionModel.findByPk(id);

    if (!foundTransaction) {
      return res.status(404).json({ msg: "Transaction not found." });
    }
    await foundTransaction.destroy();
    return res.status(200).json({ msg: "Transaction deleted successfully." });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
