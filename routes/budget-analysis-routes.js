const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { requireAuth } = require("../middleware/auth");

const Transaction = require("../models/transaction-models");
const Category = require("../models/category-models");

// GET /api/budget-analysis/:months
router.get("/:months", requireAuth, async (req, res, next) => {
  try {
    const months = Number(req.params.months);

    if (!months || months <= 0) {
      return res.status(400).json({ error: "Invalid months value" });
    }

    console.log(req.user)
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months,
      1
    );

    // Get all expense categories for this user
    const categories = await Category.findAll({
      where: {
        user_id: req.user.id,
        type: "Expense",
      },
      order: [["id", "ASC"]],
    });

    console.log(categories)

    // Get all withdrawal transactions within the date range
    const transactions = await Transaction.findAll({
      where: {
        user_id: req.user.id,
        type: "withdrawal",
        date: { [Op.gte]: startDate },
      },
    });

    console.log(transactions)

    // Build analysis results
    const analysis = categories.map((cat) => {
      const spent = transactions
        .filter((tx) => tx.category_id === cat.id)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const monthlyBudget = Number(cat.budget || 0);
      const totalBudget = monthlyBudget * months;

      return {
        category_id: cat.id,
        category_name: cat.name,
        total_spent_for_period: spent,
        total_budget_for_period: totalBudget,
        stayed_within_budget: spent <= totalBudget,
      };
    });

    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
