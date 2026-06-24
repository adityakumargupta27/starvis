import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-flash-lite-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite"
  ];
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
