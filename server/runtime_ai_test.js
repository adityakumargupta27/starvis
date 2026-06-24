/**
 * RUNTIME AI VERIFICATION TEST
 * Exercises the exact same geminiService.js chat() function used by /api/v1/ai/chat
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import gemini from "./services/geminiService.js";

async function runTest() {
  console.log("=".repeat(60));
  console.log("STARVIS AI RUNTIME VERIFICATION");
  console.log("Timestamp:", new Date().toISOString());
  console.log("API Key present:", process.env.GEMINI_API_KEY ? "YES (key=" + process.env.GEMINI_API_KEY.slice(0,8) + "...)" : "NO");
  console.log("=".repeat(60));

  // Test 1: Simple chat
  console.log("\n[TEST 1] Chat API call...");
  try {
    const t1 = Date.now();
    const reply = await gemini.chat([], "What is 2+2? Reply in one sentence.");
    const elapsed = Date.now() - t1;
    console.log("  STATUS: SUCCESS");
    console.log("  LATENCY:", elapsed, "ms");
    console.log("  REPLY:", reply.trim());
  } catch (e) {
    console.log("  STATUS: FAIL");
    console.log("  ERROR:", e.message.substring(0, 150));
  }

  // Test 2: generateNotes
  console.log("\n[TEST 2] generateNotes API call...");
  try {
    const t2 = Date.now();
    const notes = await gemini.generateNotes("Python lists", "");
    const elapsed = Date.now() - t2;
    console.log("  STATUS: SUCCESS");
    console.log("  LATENCY:", elapsed, "ms");
    console.log("  PREVIEW:", notes.substring(0, 100).replace(/\n/g, " "));
  } catch (e) {
    console.log("  STATUS: FAIL");
    console.log("  ERROR:", e.message.substring(0, 150));
  }

  // Test 3: generateFlashcards
  console.log("\n[TEST 3] generateFlashcards API call...");
  try {
    const t3 = Date.now();
    const cards = await gemini.generateFlashcards("Basic algebra");
    const elapsed = Date.now() - t3;
    console.log("  STATUS: SUCCESS");
    console.log("  LATENCY:", elapsed, "ms");
    console.log("  CARD COUNT:", Array.isArray(cards) ? cards.length : "NOT_ARRAY");
    if (Array.isArray(cards) && cards.length > 0) {
      console.log("  SAMPLE CARD:", JSON.stringify(cards[0]));
    }
  } catch (e) {
    console.log("  STATUS: FAIL");
    console.log("  ERROR:", e.message.substring(0, 150));
  }

  console.log("\n" + "=".repeat(60));
  console.log("TEST COMPLETE:", new Date().toISOString());
  console.log("=".repeat(60));
}

runTest().catch(console.error);
