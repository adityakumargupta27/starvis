import geminiService from "./services/geminiService.js";

async function run() {
  try {
    console.log("Testing geminiService.generateText...");
    const reply = await geminiService.generateText("Say hello in one word.");
    console.log("Result:", reply);

    console.log("Testing geminiService.generateFlashcards...");
    const cards = await geminiService.generateFlashcards("history of space flight");
    console.log("Flashcards generated:", cards.slice(0, 2));
  } catch (err) {
    console.error("Service test failed:", err);
  }
}

run();
