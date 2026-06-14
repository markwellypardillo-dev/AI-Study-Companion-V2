import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { OfficeParser } from "officeparser";

dotenv.config({ override: true });

const app = express();
app.use(express.json({ limit: "50mb" }));

// Initialize Google GenAI on the server
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper function to extract text securely based on file format
async function extractTextFromBase64(fileName: string, base64Data: string): Promise<string> {
  const extension = fileName.split(".").pop()?.toLowerCase();
  
  // Strip light metadata headers (data:application/pdf;base64, etc.)
  let rawBase64 = base64Data;
  if (base64Data.includes(";base64,")) {
    rawBase64 = base64Data.split(";base64,")[1];
  }
  
  const buffer = Buffer.from(rawBase64, "base64");
  
  if (extension === "txt") {
    return buffer.toString("utf-8");
  } else if (["pdf", "docx", "pptx", "xlsx"].includes(extension || "")) {
    const ast = await OfficeParser.parseOffice(buffer);
    return ast.toText();
  }
  
  return buffer.toString("utf-8"); // Fallback to raw buffer stringification
}

// --- API Routes ---

  // Raw Text Extraction API Route
  app.post("/api/extract-text", async (req, res) => {
    try {
      const { fileName, fileBase64 } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ error: "File base64 data is required" });
      }

      console.log(`[Parser] Extracting text for: ${fileName}`);
      const extractedText = await extractTextFromBase64(fileName, fileBase64);
      
      // Post-process the extracted texts by normalizing newlines and formatting
      let cleanedText = extractedText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

      if (!cleanedText) {
        cleanedText = `Empty document details. Extracted file text layout is empty. File name: ${fileName}`;
      }

      console.log(`[Parser] Successfully extracted ${cleanedText.length} characters for: ${fileName}`);
      res.json({ text: cleanedText });
    } catch (e: any) {
      console.error("Text extraction failure:", e);
      res.status(500).json({ error: e.message || "Failed to parse document text" });
    }
  });

  // Generate Study Guide Mode
  app.post("/api/generate-study-guide", async (req, res) => {
    try {
      const { fileName, fileContent } = req.body;

      if (!fileContent) {
        return res.status(400).json({ error: "File content is required" });
      }

      const prompt = `
You are an expert EdTech tutor. Your job is to generate a comprehensive, highly engaging, and structured Study Guide based STRICTLY on the document content provided below. 
You are strictly forbidden from fabricating or using outside knowledge (no hallucinations). All facts, summaries, key terms, and definitions must be grounded in the source text.

Document Title: ${fileName || "Untitled Document"}
Document Text:
"""
${fileContent}
"""

Generate a complete, beautiful study guide structured precisely as follows in JSON output format.
Provide:
1. "summary": A high-level, clear, Gen-Z friendly summary of the text (2-3 paragraphs).
2. "chapters" / "sections": A structured list of main visual sections, with "title", "content" (bullet notes), and "relevance".
3. "keyConcepts": Key concepts extracted of size 4-8. Each concept must have a "concept" name, "explanation" (very comprehensive yet clear), and "importance".
4. "vocabulary": A glossary/mapping of important vocabulary containing 5-10 terms with "term" and "definition".
5. "flashcards": list of 6-12 interactive flashcard pairs containing "front" (question or concept to recall) and "back" (detailed direct recall answer/definition).

Return your response strictly as a JSON object matching this structural schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    relevance: { type: Type.STRING }
                  },
                  required: ["title", "content"]
                }
              },
              keyConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    importance: { type: Type.STRING }
                  },
                  required: ["concept", "explanation"]
                }
              },
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                }
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["summary", "sections", "keyConcepts", "vocabulary", "flashcards"]
          }
        }
      });

      const extractedText = response.text;
      if (!extractedText) {
        throw new Error("No response generated by the AI model.");
      }

      res.json(JSON.parse(extractedText.trim()));
    } catch (error: any) {
      console.error("Study guide generation failure:", error);
      res.status(500).json({ error: error.message || "Failed to generate study guide" });
    }
  });

  // Generate Quizzes in Assessment Mode (Basic, Medium, Hard)
  app.post("/api/generate-assessment", async (req, res) => {
    try {
      const { fileName, fileContent, difficulty } = req.body;

      if (!fileContent) {
        return res.status(400).json({ error: "File content is required" });
      }

      const diff = difficulty || "basic";

      let formatInstructions = "";
      let expectedSchemaProperties: any = {};
      let requiredFields: string[] = ["id", "type", "question", "explanation"];

      if (diff === "basic") {
        formatInstructions = `
Generate 5-8 questions of type "mcq" (Multiple Choice) or "tf" (True/False). 
Focus on direct recall, basic details, and clear facts from the text.
Each question must include a "question" field, "options" array, and a "correctAnswer" representing the exact correct string.
`;
        expectedSchemaProperties = {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "Must be 'mcq' or 'tf'" },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        };
        requiredFields = ["id", "type", "question", "options", "correctAnswer", "explanation"];
      } else if (diff === "medium") {
        formatInstructions = `
Generate 5-8 questions of type "fib" (Fill-in-the-blanks with blank as '__' or placeholder text) or "short" (Conceptual understanding).
Each question must include the "question" field, "correctAnswer" representing the correct blank word or direct brief answer, and any hint/context.
`;
        expectedSchemaProperties = {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "Must be 'fib' or 'short'" },
          question: { type: Type.STRING },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        };
        requiredFields = ["id", "type", "question", "correctAnswer", "explanation"];
      } else {
        // Hard
        formatInstructions = `
Generate 3-5 comprehensive questions of type "essay" (Critical reasoning) or "scenario" (Scenario-based application of parameters).
Include detail-rich scenario text.
Each question must include the "question" field, "sampleAnswer" (a model high-quality answer) and "gradingCriteria" (bulleted critical points required to get full credit).
`;
        expectedSchemaProperties = {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "Must be 'essay' or 'scenario'" },
          question: { type: Type.STRING },
          sampleAnswer: { type: Type.STRING },
          gradingCriteria: { type: Type.STRING },
          explanation: { type: Type.STRING }
        };
        requiredFields = ["id", "type", "question", "sampleAnswer", "gradingCriteria", "explanation"];
      }

      const prompt = `
You are an advanced academic evaluator. Your job is to generate high-quality assessment questions strictly grounded in the material provided below.
Do not evaluate external facts. Do not deviate from the core material definitions.

Document Title: ${fileName || "Untitled Document"}
Difficulty Tier Chosen: ${diff.toUpperCase()}
Document Text:
"""
${fileContent}
"""

Format Requirements:
${formatInstructions}

Return a list of strictly grounded questions in a JSON array.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: expectedSchemaProperties,
              required: requiredFields
            }
          }
        }
      });

      const extractedText = response.text;
      if (!extractedText) {
        throw new Error("No response generated by the AI evaluator.");
      }

      res.json(JSON.parse(extractedText.trim()));
    } catch (error: any) {
      console.error("Assessment generation failure:", error);
      res.status(500).json({ error: error.message || "Failed to generate assessment" });
    }
  });

  // --- Vite Asset Pipeline / Dev Server Static Setup ---

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
