const express = require("express");
const router = express.Router();
const { Account } = require("../models");
const { requireAuth } = require("../middleware/auth");

// GET /accounts — all accounts for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { user_id: req.user.id },
      order: [["id", "ASC"]],
    });

    return res.status(200).json(accounts);
  } catch (error) {
    console.log(error);
  }
});

// GET /accounts/:id — one account owned by the logged-in user
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const account = await Account.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    return res.status(200).json(account);
  } catch (error) {
    next(error);
  }
});

// POST /accounts — create a new account for the logged-in user
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, type, balance, bank_name } = req.body;

    if (!name || !type || balance === undefined) {
      return res.status(400).json({
        error: "name, type, and balance are required",
      });
    }

    const newAccount = await Account.create({
      user_id: req.user.id, // NEVER from frontend
      name,
      type,
      balance,
      bank_name: bank_name || null,
    });

    return res.status(201).json(newAccount);
  } catch (error) {
    next(error);
  }
});

// PATCH /accounts/:id — update only fields provided
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const account = await Account.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const updates = {};
    for (const key of ["name", "type", "balance", "bank_name"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await account.update(updates);

    return res.status(200).json(account);
  } catch (error) {
    next(error);
  }
});

// DELETE /accounts/:id — delete only accounts owned by the user
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const account = await Account.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    await account.destroy();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
