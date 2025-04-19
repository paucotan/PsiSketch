import { Button } from "@/components/ui/button";
import { useState } from "react";
import psiSketchLogo from "../assets/psisketch.png";

interface WelcomeScreenProps {
  onStartSession: () => void;
  onViewHistory: () => void;
}

export default function WelcomeScreen({ onStartSession, onViewHistory }: WelcomeScreenProps) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  if (showOnboarding) {
    return (
      <div className="screen active flex flex-col items-center justify-center p-6 bg-black text-white animate-fade-in">
        <div className="max-w-md w-full flex flex-col items-center">
          <img
            src={psiSketchLogo}
            alt="PsiSketch Logo"
            className="w-40 h-40 mb-6"
          />
          <h1 className="text-4xl font-bold mb-10 text-white text-center">PsiSketch</h1>
          
          <div className="text-2xl text-center mb-12 space-y-8 font-light">
            <p className="opacity-90">Close your eyes.</p>
            <p className="opacity-90">Clear your mind.</p>
            <p className="opacity-90">Something is waiting to be seen.</p>
            <p className="opacity-90">When you're ready—draw what you feel.</p>
          </div>
          
          <Button
            onClick={() => setShowOnboarding(false)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-lg py-6 px-10 text-white font-medium transition-all transform hover:scale-105 mt-4"
            size="lg"
          >
            <span className="mr-2">👉</span> Begin
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="screen active flex flex-col items-center justify-center p-6 animate-fade-in">
      <img
        src={psiSketchLogo}
        alt="PsiSketch Logo"
        className="w-20 h-20 mb-4"
      />
      <h1 className="text-3xl font-medium mb-2 text-foreground text-center">PsiSketch</h1>
      <div className="text-lg text-muted-foreground text-center mb-10">
        <p>Draw what your mind sees—before it's revealed.</p>
      </div>
      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Button 
          onClick={onStartSession}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-lg py-6 text-white font-medium transition-all transform hover:scale-105"
          size="lg"
        >
          Start New Session
        </Button>
        <Button 
          onClick={onViewHistory}
          className="bg-muted hover:bg-opacity-90 rounded-lg py-6 text-foreground font-medium transition-all"
          variant="outline"
          size="lg"
        >
          View History
        </Button>
      </div>
    </div>
  );
}
