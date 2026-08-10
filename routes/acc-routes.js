const express = require("express");
const router = express.Router();
const { Account } = require("../models");

//route for getting all the accounts
router.get("/", async (req, res, next) => {
  try {
    const accounts = await Account.findAll();
    return res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
});

//route for getting an account by its Id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const foundAccount = await Account.findByPk(id);

    if (!foundAccount) {
      return res.status(404).json({ msg: "Account not found." });
    }
    return res.status(200).json(foundAccount);
  } catch (error) {
    next(error);
  }
});

//route for posting an account
router.post("/", async (req, res, next) => {
  try {
    const { user_id, name, balance } = req.body;

    if (!user_id || !name) {
      return res
        .status(400)
        .json({ msg: "user_id and name are needed!" });
    }
    const newAccount = await Account.create({
      user_id,
      name,
      balance,
    });
    return res.status(201).json(newAccount);
  } catch (error) {
    next(error);
  }
});

//route for updating the account
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundAccount = await Account.findByPk(id);

    if (!foundAccount) {
      return res.status(404).json({ msg: "Account not found." });
    }

    const updates = {};
    for (const key of ["name", "balance"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updatedAccount = await foundAccount.update(updates);
    return res.status(200).json(updatedAccount);
  } catch (error) {
    next(error);
  }
});

//route for deleting the account by its Id.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundAccount = await Account.findByPk(id);

    if (!foundAccount) {
      return res.status(404).json({ msg: "Account not found." });
    }
    await foundAccount.destroy();
    return res.status(200).json({ msg: "Account deleted successfully." });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
