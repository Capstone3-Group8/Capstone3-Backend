const { GoogleGenAI, Type } = require("@google/genai");

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

async function categorizeTransactions(transactions, categories) {
  if (transactions.length === 0 || categories.length === 0) {
    return [];
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    contents: `
You categorize personal-finance transactions.

Rules:
- Return exactly one result for each transaction, in the same order.
- Choose only a category name from the supplied allowed categories.
- Match Deposit transactions to Income categories and Withdrawal transactions to Expense categories.
- Do not invent categories or rely on information not present in the transaction.
- If no category is a reasonable match, return null.

Allowed categories:
${JSON.stringify(categories)}

Transactions:
${JSON.stringify(transactions)}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            categoryName: {
              type: Type.STRING,
              nullable: true,
            },
          },
          required: ["categoryName"],
        },
      },
    },
  });

  const results = JSON.parse(response.text);
  if (!Array.isArray(results) || results.length !== transactions.length) {
    throw new Error("AI returned an invalid transaction categorization");
  }

  return results.map((result) => result.categoryName || null);
}

async function generateFinancialInsights(financialData) {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

    contents: `
You are an educational personal-budget coach.

Analyze only the financial data supplied below.

Rules:
- Do not invent transactions, categories, amounts, or trends.
- Do not provide investment, tax, legal, or credit advice.
- If there is insufficient data, clearly explain that.
- Write one short summary.
- Return no more than three trends.
- Return no more than three practical budgeting suggestions.
- Keep the language friendly and easy to understand.

Financial data:
${JSON.stringify(financialData)}
    `,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          summary: {
            type: Type.STRING,
          },

          trends: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },

          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },

          warning: {
            type: Type.STRING,
          },
        },

        required: ["summary", "trends", "suggestions", "warning"],
      },
    },
  });

  return JSON.parse(response.text);
}

async function answerFinancialQuestion(question, financialData) {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

    contents: `
You are a friendly educational personal-finance assistant.

Answer the user's question using ONLY the financial data provided below.

Rules:
- Do not invent transactions, categories, amounts, or facts.
- If the supplied data cannot answer the question, explain what data is missing.
- Do not provide investment, tax, legal, or credit advice.
- Keep the answer short, practical, and easy to understand.
- Mention relevant amounts when they are available.

User's question:
${question}

Financial data:
${JSON.stringify(financialData)}
    `,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          answer: {
            type: Type.STRING,
          },
        },

        required: ["answer"],
      },
    },
  });

  return JSON.parse(response.text);
}

module.exports = {
  categorizeTransactions,
  generateFinancialInsights,
  answerFinancialQuestion,
};
