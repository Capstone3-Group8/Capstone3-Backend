const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction-models");
const Category = require("../models/category-models");
const { requireAuth } = require("../middleware/auth");
const { Op } = require("sequelize");

// GET /budgets/summary — monthly budget summary
router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const categories = await Category.findAll({
      where: { user_id: req.user.id, type: "expense" },
      order: [["id", "ASC"]],
    });

    const transactions = await Transaction.findAll({
      where: {
        user_id: req.user.id,
        type: "withdrawal",
        date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    });

    const summary = categories.map((cat) => {
      const spent = transactions
        .filter((tx) => tx.category_id === cat.id)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const budget = Number(cat.budget || 0);
      const remaining = budget - spent;
      const percent_used = budget > 0 ? (spent / budget) * 100 : 0;

      return {
        category_id: cat.id,
        category_name: cat.name,
        budget,
        spent,
        remaining,
        percent_used,
        over_budget: spent > budget,
      };
    });

    return res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
