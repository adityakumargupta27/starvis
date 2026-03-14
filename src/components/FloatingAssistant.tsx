
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceBackground from "./SpaceBackground";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGreeting, setIsGreeting] = useState(true);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
        setIsGreeting(true)
    }
  };

  const handleInteraction = () => {
      setIsGreeting(false)
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={toggleAssistant}
          className="rounded-full w-16 h-16 bg-purple-600 hover:bg-purple-700 shadow-lg transition-transform transform hover:scale-110"
        >
          <img src="/anime-character.png" alt="Assistant" className="w-12 h-12 rounded-full"/>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-8 w-[350px] h-[500px] bg-transparent rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20 z-50"
          >
            <SpaceBackground />
            <div className="relative z-10 h-full flex flex-col">
                <div className="p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm">
                    <h3 className="font-bold text-white">AI Assistant</h3>
                    <Button variant="ghost" size="icon" onClick={toggleAssistant} className="text-gray-300 hover:text-white">
                        <X size={20}/>
                    </Button>
                </div>
                
                <div className="flex-1 p-6 text-white text-center flex flex-col justify-center">
                    {isGreeting ? (
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.2 }}
                        >
                            <h4 className="text-xl font-semibold mb-2">Hello! How can I help you today?</h4>
                            <p className="text-gray-300">Ask me anything about your schedule, assignments, or study progress.</p>
                        </motion.div>
                    ) : (
                        <div className="text-left space-y-4 overflow-y-auto h-full">
                            {/* Chat messages would go here */}
                            <p className="p-2 bg-purple-600/50 rounded-lg">What are my assignments for this week?</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-black/30 mt-auto backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                        <Input placeholder="Type your message..." className="bg-transparent text-white border-purple-400/50 focus:ring-purple-500" onFocus={handleInteraction} />
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                           <Send size={20}/>
                        </Button>
                        <Button variant="outline" className="border-purple-400/50 text-white hover:bg-purple-600/50">
                           <Mic size={20}/>
                        </Button>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;
