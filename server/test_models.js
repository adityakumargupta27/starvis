import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.5-flash-002", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite-preview-02-05"];
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hello in one word.");
      console.log(`Result for ${m}:`, result.response.text());
    } catch (e) {
      console.error(`Error for ${m}:`, e.message);
    }
  }
}

test();
