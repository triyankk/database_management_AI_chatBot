const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pgp = require("pg-promise")();
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const db = pgp({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Classifies user input as SQL or a command
async function classifyMessage(message) {
  const prompt = `Determine if the following message is a SQL query request or a usual command: "${message}"\nRespond with "SQL" or "COMMAND".`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);
  return response.response.candidates[0].content.parts[0].text.trim();
}

// Generates an SQL query based on user input
async function generateSQLQuery(message) {
  const prompt = `Convert the following user question into an SQL query without any formatting: "${message}"`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);

  let query = response.response.candidates[0].content.parts[0].text.trim();

  // Ensure the query ends with a semicolon
  if (!query.endsWith(";")) {
    query += ";";
  }

  console.log("Generated SQL Query:", query); // Log SQL query for debugging
  return query;
}

// Validates the SQL query
function validateSQLQuery(query) {
  const validSQLCommands = ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP"];
  const command = query.split(" ")[0].toUpperCase();
  return validSQLCommands.includes(command);
}

// Extracts the table name from the SQL query
function extractTableName(query) {
  const match = query.match(/(?:FROM|INTO|UPDATE|TABLE)\s+(\w+)/i);
  return match ? match[1] : null;
}

// Checks if the table exists
async function checkTableExists(tableName) {
  const query = `SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = '${tableName}'
  );`;
  const result = await db.one(query);
  return result.exists;
}

// Handles execution of SQL queries
async function executeSQLQuery(sqlQuery) {
  console.log("Executing SQL Query:", sqlQuery); // Log query before execution

  // if (!validateSQLQuery(sqlQuery)) {
  //   throw new Error("Invalid SQL Query.");
  // }

  // const tableName = extractTableName(sqlQuery);
  // if (!tableName) {
  //   throw new Error("Unable to extract table name from SQL query.");
  // }

  // const tableExists = await checkTableExists(tableName);
  // if (!tableExists) {
  //   throw new Error(`Table "${tableName}" does not exist.`);
  // }

  let responseMessage;
  if (/^(insert|update|delete|create|drop)/i.test(sqlQuery)) {
    await db.none(sqlQuery);
    responseMessage = "Table updated successfully.";

    const relatedCommand = await findRelatedCommand(sqlQuery);
    if (relatedCommand !== "NONE") {
      const relatedData = await executeSQLQuery(
        await generateSQLQuery(relatedCommand)
      );
      responseMessage += `\nAnalysis: ${await analyzeData(
        relatedCommand,
        relatedData
      )}`;
    }
  } else {
    try {
      const data = await db.any(sqlQuery.replace(/[{}]/g, ""));
      responseMessage = data.length
        ? JSON.stringify(data, null, 2)
        : "Query executed successfully.";
    } catch (error) {
      console.error("Database error:", error); // Log detailed error
      throw new Error("Invalid SQL Query.");
    }
  }
  return responseMessage;
}

// Finds related SQL commands after an update operation
async function findRelatedCommand(sqlQuery) {
  const prompt = `Identify if there is any related command to the following SQL query: "${sqlQuery}"\nRespond with the related command or "NONE"`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);
  return response.response.candidates[0].content.parts[0].text.trim();
}

// Analyzes query results based on a command
async function analyzeData(command, data) {
  const prompt = `Analyze the following data based on the command: "${command}". Data: ${JSON.stringify(
    data,
    null,
    2
  )}`;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(prompt);
  return response.response.candidates[0].content.parts[0].text.trim();
}

// Handles standard AI responses for non-SQL inputs
async function generateAIResponse(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const response = await model.generateContent(message);
  return response.response.candidates[0].content.parts[0].text.trim();
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const classification = await classifyMessage(message);
    let responseMessage;

    if (classification === "SQL") {
      const sqlQuery = await generateSQLQuery(message);
      responseMessage = await executeSQLQuery(sqlQuery);
    } else {
      responseMessage = await generateAIResponse(message);
    }

    res.json({
      choices: [{ message: { content: responseMessage, role: "assistant" } }],
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: error.message || "An unexpected error occurred." });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
