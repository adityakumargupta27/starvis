
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";

export default function VoiceAssistant() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader className="text-center">
            <CardTitle>Voice Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
            <p className="text-gray-300">
              Ask me anything about your schedule, assignments, or study progress.
            </p>
            <Button
              size="icon"
              className="w-28 h-28 rounded-full bg-purple-600/50 hover:bg-purple-600/70 text-white border-2 border-purple-400/50 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              <Mic className="w-16 h-16" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
