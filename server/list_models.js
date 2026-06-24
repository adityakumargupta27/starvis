import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or list models
    // Let's try listing models
    // Wait, the SDK has:
    // const models = await genAI.listModels();
    // But since the SDK format might differ, let's also try sending a simple curl request or using SDK listModels
    console.log("Listing models via SDK...");
    // Let's use standard fetch to query models list from Google API using the API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    } else {
      console.log("No models returned:", data);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

test();
