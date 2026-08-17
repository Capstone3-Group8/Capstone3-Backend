const { GoogleGenAI, Type } = require("@google/genai");

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
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

        required: [
          "summary",
          "trends",
          "suggestions",
          "warning",
        ],
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
  generateFinancialInsights,
  answerFinancialQuestion,
};