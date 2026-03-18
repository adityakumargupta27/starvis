import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceBackground from "./SpaceBackground";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface Message {
  text: string;
  sender: "user" | "assistant";
}

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMessages([]);
      setInput("");
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || !GEMINI_API_KEY) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: currentInput }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessageText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that.";

      const assistantMessage: Message = {
        text: assistantMessageText,
        sender: "assistant",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      let errorDetails = "";
      if (typeof error === 'object' && error !== null) {
        errorDetails = JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
          2
        );
      } else {
        errorDetails = String(error);
      }
      const errorMessage: Message = {
        text: `Sorry, an error occurred. Details: ${errorDetails}`,
        sender: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={toggleAssistant}
          className="rounded-full w-16 h-16 bg-purple-600 hover:bg-purple-700 shadow-lg transition-transform transform hover:scale-110"
        >
          <img
            src="/anime-character.png"
            alt="Assistant"
            className="w-12 h-12 rounded-full"
          />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-8 w-[350px] h-[500px] bg-black/50 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20 z-40"
          >
            <SpaceBackground />
            <div className="relative z-10 h-full flex flex-col">
              <div className="p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm">
                <h3 className="font-bold text-white">STARVIS</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAssistant}
                  className="text-gray-300 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 p-6 text-white overflow-y-auto"
              >
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center flex flex-col justify-center h-full"
                  >
                    <h4 className="text-xl font-semibold mb-2">
                      Hello! How can I help you today?
                    </h4>
                    <p className="text-gray-300">
                      Ask me anything. I'm connected to the Gemini API.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <p
                          className={`p-3 rounded-lg max-w-xs ${
                            msg.sender === "user"
                              ? "bg-purple-600/70"
                              : "bg-gray-700/50"
                          }`}
                        >
                          {msg.text}
                        </p>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <p className="p-3 rounded-lg bg-gray-700/50">
                          Thinking...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-black/30 mt-auto backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    className="bg-transparent text-white border-purple-400/50 focus:ring-purple-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoading || !GEMINI_API_KEY}
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;