import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const userQuestion = req.body.question;

    if (!userQuestion) {
      return res.json({ reply: "Ask a DSA question." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are a DSA (Data Structures and Algorithms) instructor AI. Answer ONLY questions related to Data Structures and Algorithms. This includes topics like arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, dynamic programming, and algorithm analysis. If a question is not related to DSA, politely decline and ask the user to ask a DSA question instead."
            }]
          },
          contents: [
            {
              parts: [{ text: userQuestion }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini full response:", JSON.stringify(data, null, 2));
    console.log("Response status:", response.status);

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.json({ reply: `Error: ${data.error.message}` });
    }

    res.json({
      reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini gave no reply"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
