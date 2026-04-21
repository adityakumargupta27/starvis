import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Reading API key inline to avoid HMR stale states

interface Message {
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Render markdown bold/italic/code inline — keeps stars from cluttering UI */
function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Split on **bold**, *italic*, and `code` patterns
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={key++} className="font-semibold text-white">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<em key={key++} className="italic text-purple-200">{match[2]}</em>);
    } else if (match[3] !== undefined) {
      parts.push(<code key={key++} className="bg-white/10 px-1 py-0.5 rounded text-[11px] font-mono">{match[3]}</code>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Render numbered and bullet lists, then inline markdown within each line */
function MessageContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+)\.\s(.*)/);
        const bullet = line.match(/^[-*]\s(.*)/);
        if (numbered) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="text-purple-400 font-semibold min-w-[16px]">{numbered[1]}.</span>
              <span>{renderMarkdown(numbered[2])}</span>
            </div>
          );
        }
        if (bullet) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="text-purple-400 mt-[3px]">•</span>
              <span>{renderMarkdown(bullet[1])}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <div key={i}>{renderMarkdown(line)}</div>;
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-purple-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

const STUDY_SYSTEM_PROMPT = `You are STARVIS, an AI study assistant embedded in a student productivity app. 
You help students with:
- Explaining academic concepts clearly and concisely
- Creating study plans and schedules
- Summarizing topics
- Motivating and encouraging students
- Helping with assignments and problem-solving
- Giving tips for productivity and learning

Keep responses concise and friendly. Use emojis occasionally to make the conversation engaging. 
When asked something off-topic, gently redirect to study-related help.`;

const QUICK_PROMPTS = [
  "📚 Create a study plan for me",
  "💡 Explain a concept simply",
  "🎯 Help me focus today",
  "📝 Suggest study techniques",
];

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleAssistant = () => {
    setIsOpen((v) => !v);
  };

  const sendMessage = async (text: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!text.trim() || !apiKey) return;

    const userMessage: Message = { text, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Build conversation history for context
    const history = messages.slice(-8).map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const MAX_RETRIES = 2;
    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: STUDY_SYSTEM_PROMPT }] },
              contents: [
                ...history,
                { role: "user", parts: [{ text }] },
              ],
            }),
          }
        );

        // Retry on 503 overload
        if (response.status === 503 && attempt < MAX_RETRIES) {
          attempt++;
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({})) as { error?: { code?: number; message?: string } };
          const isOverload = response.status === 503 ||
            errData?.error?.message?.toLowerCase().includes("overload") ||
            errData?.error?.message?.toLowerCase().includes("unavailable");
          if (isOverload) {
            throw new Error("__OVERLOAD__");
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const replyText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't process that. Try again!";

        setMessages((prev) => [
          ...prev,
          { text: replyText, sender: "assistant", timestamp: new Date() },
        ]);
        break; // success
      } catch (error) {
        const isOverload =
          error instanceof Error && error.message === "__OVERLOAD__";
        if (isOverload && attempt < MAX_RETRIES) {
          attempt++;
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        console.error("Gemini API Error:", error);
        const friendlyMsg = isOverload
          ? "🙏 The AI is a bit overloaded right now. Please try again in a moment!"
          : "Something went wrong. Please try again in a bit.";
        setMessages((prev) => [
          ...prev,
          { text: friendlyMsg, sender: "assistant", timestamp: new Date() },
        ]);
        break;
      }
    }
    setIsLoading(false);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed bottom-20 md:bottom-8 right-6 z-50"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={toggleAssistant}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 shadow-lg shadow-purple-900/40 flex items-center justify-center border border-purple-400/30"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Bot size={22} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pulse ring */}
          {!isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-purple-400/50"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            />
          )}
        </button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-36 md:bottom-28 right-6 w-[340px] h-[520px] rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30 z-40 flex flex-col"
            style={{ background: "linear-gradient(to bottom, #060918, #0a0e23)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-900/30 border-b border-purple-500/20 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">STARVIS AI</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Study Assistant</span>
                </div>
              </div>
              <button
                onClick={toggleAssistant}
                className="ml-auto text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col items-center justify-center h-full text-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles size={24} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Hey there! 👋</p>
                    <p className="text-gray-400 text-xs">I'm STARVIS, your AI study companion. Ask me anything!</p>
                  </div>
                  {/* Quick prompts */}
                  <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-[10px] text-left text-gray-300 px-2.5 py-2 rounded-lg border border-purple-500/20 bg-purple-900/20 hover:bg-purple-900/40 transition-colors leading-snug"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col gap-0.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-purple-600 text-white rounded-tr-sm"
                            : "bg-white/8 text-gray-100 border border-white/10 rounded-tl-sm"
                        }`}
                        style={msg.sender === "assistant" ? { background: "rgba(255,255,255,0.07)" } : {}}
                      >
                        {msg.sender === "assistant" ? (
                          <MessageContent text={msg.text} />
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 px-1">{formatTime(msg.timestamp)}</span>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start"
                    >
                      <div className="bg-white/7 border border-white/10 rounded-2xl rounded-tl-sm" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex-shrink-0 px-3 py-3 border-t border-white/10 bg-black/20"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask STARVIS..."
                  className="flex-1 bg-white/5 border-purple-400/30 text-white placeholder:text-gray-500 text-sm rounded-xl h-9"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 w-9 p-0 flex-shrink-0"
                  disabled={isLoading || !input.trim() || !import.meta.env.VITE_GEMINI_API_KEY}
                >
                  <Send size={14} />
                </Button>
              </div>
              {!import.meta.env.VITE_GEMINI_API_KEY && (
                <p className="text-[10px] text-red-400 mt-1 text-center">
                  Set VITE_GEMINI_API_KEY to enable AI
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;