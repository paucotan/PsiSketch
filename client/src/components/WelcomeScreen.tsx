import { Button } from "@/components/ui/button";
import { useState } from "react";
import psiSketchLogo from "../assets/psisketch.png";

interface WelcomeScreenProps {
  onStartSession: () => void;
  onViewHistory: () => void;
}

export default function WelcomeScreen({ onStartSession, onViewHistory }: WelcomeScreenProps) {
  return (
    <div className="screen active flex flex-col items-center justify-start pt-6 pb-20 px-6 bg-black text-white animate-fade-in overflow-auto">
      <div className="max-w-md w-full flex flex-col items-center my-auto">
        <img
          src={psiSketchLogo}
          alt="PsiSketch Logo"
          className="w-28 h-28 sm:w-40 sm:h-40 mb-4 sm:mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 text-white text-center">PsiSketch</h1>
        
        <div className="text-xl sm:text-2xl text-center mb-6 sm:mb-10 space-y-3 sm:space-y-6 font-light">
          <p className="opacity-90">Close your eyes.</p>
          <p className="opacity-90">Clear your mind.</p>
          <p className="opacity-90">Something is waiting to be seen.</p>
          <p className="opacity-90">When you're ready—draw what you feel.</p>
        </div>
        
        <p className="text-sm sm:text-lg text-center mb-4 sm:mb-8 opacity-80">
          Draw what your mind sees—before it's revealed.
        </p>
        
        <div className="flex flex-col space-y-3 sm:space-y-4 w-full max-w-xs">
          <Button 
            onClick={onStartSession}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-lg py-4 sm:py-6 text-white font-medium transition-all transform hover:scale-105"
            size="lg"
          >
            <span className="mr-2">👉</span> Start New Session
          </Button>
          <Button 
            onClick={onViewHistory}
            className="bg-muted hover:bg-opacity-90 rounded-lg py-3 sm:py-5 text-white font-medium transition-all"
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
