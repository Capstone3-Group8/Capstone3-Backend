const { GoogleGenAI, Type } = require("@google/genai");

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Takes the user's categories and a batch of Plaid transactions, asks Gemini
// to match each transaction to the best-fitting category (or null if none fit).
async function categorizeTransactions(transactions, categories) {
  if (transactions.length === 0 || categories.length === 0) {
    return [];
  }

  const ai = getGeminiClient();

  const categoryList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
  }));

  const transactionList = transactions.map((t) => ({
    transaction_id: t.transaction_id,
    name: t.name,
    merchant_name: t.merchant_name,
    plaid_category: t.category,
    amount: t.amount,
    type: t.type, // "deposit" or "withdrawal"
  }));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    contents: `
You are matching bank transactions to a user's budget categories.

Rules:
- Return exactly one result for each transaction, in the same order given.
- Only use category ids from the list provided. Never invent a category.
- Match "deposit" transactions to Income categories, and "withdrawal" transactions to Expense categories.
- Use the transaction's name, merchant, and Plaid's own category as clues.
- If nothing fits reasonably well, return null for that transaction's category_id.

Categories:
${JSON.stringify(categoryList)}

Transactions:
${JSON.stringify(transactionList)}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                transaction_id: { type: Type.STRING },
                category_id: { type: Type.INTEGER, nullable: true },
              },
              required: ["transaction_id", "category_id"],
            },
          },
        },
        required: ["matches"],
      },
    },
  });

  const results = JSON.parse(response.text).matches;

  if (!Array.isArray(results) || results.length !== transactions.length) {
    throw new Error("AI returned an invalid transaction categorization");
  }

  return results;
}

// Looks at transactions that didn't match any existing category and proposes
// new categories for genuine spending patterns. Suggestions only — nothing
// gets created here, the user has to approve each one.
async function suggestCategories(uncategorizedTransactions) {
  if (uncategorizedTransactions.length === 0) {
    return [];
  }

  const ai = getGeminiClient();

  const transactionList = uncategorizedTransactions.map((t) => ({
    transaction_id: t.transaction_id,
    name: t.name,
    merchant_name: t.merchant_name,
    plaid_category: t.category,
    amount: t.amount,
    type: t.amount > 0 ? "withdrawal" : "deposit",
  }));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    contents: `
You are proposing new budget categories for a personal finance app, based on
transactions that didn't fit any of the user's existing categories.

Rules:
- Only propose a category if at least 2 transactions clearly share a real pattern (e.g. several coffee shops, several rideshare trips, several electronics stores).
- Do not propose a category for a single one-off transaction.
- Each proposed category must list which transaction_ids it covers.
- "type" must be "Income" or "Expense", matching whether the transactions are deposits or withdrawals.
- Suggest a reasonable monthly "budget" number based on the amounts shown.
- Keep category names short and generic (e.g. "Coffee Shops", "Rideshare", "Electronics"), not merchant names.
- If nothing forms a real pattern, return an empty list.

Uncategorized transactions:
${JSON.stringify(transactionList)}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                budget: { type: Type.NUMBER },
                transaction_ids: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["name", "type", "budget", "transaction_ids"],
            },
          },
        },
        required: ["suggestions"],
      },
    },
  });

  return JSON.parse(response.text).suggestions;
}



module.exports = { categorizeTransactions, suggestCategories };