import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.slice(0, 5) + "..." : "undefined");

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
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
