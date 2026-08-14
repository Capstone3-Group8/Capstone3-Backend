const express = require("express");
// const { requireAuth } = require("../middleware/auth");
const {
  generateFinancialInsights,
} = require("../services/financialInsights");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const {
      dateRange,
      totalIncome,
      totalExpenses,
      currentBalance,
      averageTransaction,
      expensesByCategory,
    } = req.body;

    if (
      typeof totalIncome !== "number" ||
      typeof totalExpenses !== "number" ||
      typeof currentBalance !== "number" ||
      typeof averageTransaction !== "number" ||
      !Array.isArray(expensesByCategory)
    ) {
      return res.status(400).json({
        error: "Valid financial summary data is required",
      });
    }

    const safeFinancialData = {
      dateRange: {
        start: dateRange?.start || "all time",
        end: dateRange?.end || "today",
      },
      totalIncome,
      totalExpenses,
      currentBalance,
      averageTransaction,

      expensesByCategory: expensesByCategory
        .slice(0, 20)
        .map((category) => ({
          name: String(category.name || "Uncategorized").slice(0, 100),
          amount: Number(category.amount) || 0,
        })),
    };

    const insights =
      await generateFinancialInsights(safeFinancialData);

    return res.status(200).json(insights);
  } catch (error) {
    next(error);
  }
});

module.exports = router;