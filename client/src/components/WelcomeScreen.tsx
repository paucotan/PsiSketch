import { Button } from "@/components/ui/button";
import { useState } from "react";
import psiSketchLogo from "../assets/psisketch.png";

interface WelcomeScreenProps {
  onStartSession: () => void;
  onViewHistory: () => void;
}

export default function WelcomeScreen({ onStartSession, onViewHistory }: WelcomeScreenProps) {
  return (
    <div className="screen active flex flex-col items-center justify-start p-6 bg-black text-white animate-fade-in overflow-y-auto min-h-screen">
      <div className="max-w-md w-full flex flex-col items-center my-6">
        <img
          src={psiSketchLogo}
          alt="PsiSketch Logo"
          className="w-40 h-40 mb-6"
        />
        <h1 className="text-4xl font-bold mb-8 text-white text-center">PsiSketch</h1>
        
        <div className="text-xl md:text-2xl text-center mb-8 space-y-4 md:space-y-6 font-light">
          <p className="opacity-90">Close your eyes.</p>
          <p className="opacity-90">Clear your mind.</p>
          <p className="opacity-90">Something is waiting to be seen.</p>
          <p className="opacity-90">When you're ready—draw what you feel.</p>
        </div>
        
        <p className="text-lg text-center mb-8 opacity-80">
          Draw what your mind sees—before it's revealed.
        </p>
        
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <Button 
            onClick={onStartSession}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-lg py-6 text-white font-medium transition-all transform hover:scale-105"
            size="lg"
          >
            <span className="mr-2">👉</span> Start New Session
          </Button>
          <Button 
            onClick={onViewHistory}
            className="bg-muted hover:bg-opacity-90 rounded-lg py-5 text-white font-medium transition-all"
            variant="outline"
            size="lg"
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}
