import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send } from "lucide-react";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");

  const rings = [1, 2, 3, 4];

  return (
    <div className="dark min-h-screen bg-background flex flex-col items-center pt-12 pb-24 px-5">
      <h1 className="font-display font-bold text-xl text-foreground mb-2">Voice Assistant</h1>
      <p className="text-sm text-muted-foreground mb-12">Ask me anything about your studies</p>

      {/* Waveform Visualization */}
      <div className="relative flex items-center justify-center mb-16">
        <AnimatePresence>
          {isListening &&
            rings.map((r) => (
              <motion.div
                key={r}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1 + r * 0.25, opacity: 0.15 - r * 0.03 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.2 + r * 0.3,
                  ease: "easeInOut",
                }}
                className="absolute h-28 w-28 rounded-full border-2 border-primary"
              />
            ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsListening(!isListening)}
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-colors ${
            isListening
              ? "bg-primary animate-pulse-glow"
              : "bg-card border border-border"
          }`}
        >
          {isListening ? (
            <MicOff size={32} className="text-primary-foreground" />
          ) : (
            <Mic size={32} className="text-primary" />
          )}
        </motion.button>
      </div>

      <p className="text-xs text-muted-foreground mb-8">
        {isListening ? "Listening… tap to stop" : "Tap to start speaking"}
      </p>

      {/* Chat bubbles area */}
      <div className="w-full max-w-md flex-1 space-y-3 mb-6">
        <div className="card-surface bg-card p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
          <p className="text-sm text-foreground">
            Hello! I can help you study. Try asking me to explain a topic or quiz you.
          </p>
        </div>
      </div>

      {/* Text Input */}
      <div className="w-full max-w-md flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a question..."
          className="flex-1 rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
