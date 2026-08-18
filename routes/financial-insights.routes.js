const express = require("express");
// const { requireAuth } = require("../middleware/auth");
const {
  generateFinancialInsights,
  answerFinancialQuestion,
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

router.post("/question", async (req, res, next) => {
  try {
    const { question, financialData } = req.body;

    if (
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        error: "A financial question is required",
      });
    }

    if (
      !financialData ||
      typeof financialData.totalIncome !== "number" ||
      typeof financialData.totalExpenses !== "number" ||
      typeof financialData.currentBalance !== "number" ||
      typeof financialData.averageTransaction !== "number" ||
      !Array.isArray(financialData.expensesByCategory)
    ) {
      return res.status(400).json({
        error: "Valid financial data is required",
      });
    }

    const safeFinancialData = {
      dateRange: {
        start: financialData.dateRange?.start || "all time",
        end: financialData.dateRange?.end || "today",
      },

      totalIncome: financialData.totalIncome,
      totalExpenses: financialData.totalExpenses,
      currentBalance: financialData.currentBalance,
      averageTransaction: financialData.averageTransaction,

      expensesByCategory: financialData.expensesByCategory
        .slice(0, 20)
        .map((category) => ({
          name: String(
            category.name || "Uncategorized",
          ).slice(0, 100),

          amount: Number(category.amount) || 0,
        })),
    };

    const result = await answerFinancialQuestion(
      question.trim().slice(0, 500),
      safeFinancialData,
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;