import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GuidanceTip, { getRandomTip } from "@/components/GuidanceTips";

interface BreathingScreenProps {
  onSkip: () => void;
  onComplete: () => void;
  duration?: number;
}

export default function BreathingScreen({ 
  onSkip, 
  onComplete, 
  duration = 30 
}: BreathingScreenProps) {
  const [seconds, setSeconds] = useState(duration);
  const [guidanceTip, setGuidanceTip] = useState<string>("");

  // Set the guidance tip in useEffect to avoid state updates during render
  useEffect(() => {
    setGuidanceTip(getRandomTip("breathing"));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete, duration]);

  return (
    <div className="screen flex flex-col items-center justify-center p-6 text-center relative">
      <GuidanceTip tip={guidanceTip} screen="breathing" />
      
      <h2 className="text-xl font-medium mb-8 text-foreground">Take a moment to focus</h2>
      <div className="relative mb-8 flex flex-col items-center">
        {/* Sphere animation */}
        <div className="w-40 h-40 rounded-full bg-primary bg-opacity-20 animate-breath flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-primary bg-opacity-30 animate-breath"></div>
        </div>
        <div className="mt-8 text-muted-foreground text-base">
          <p className="font-medium mb-2">Close your eyes</p>
          <p>Breathe in... and out...</p>
        </div>
      </div>
      <div className="text-4xl font-light text-foreground mb-12">{seconds}</div>
      <Button 
        onClick={onSkip} 
        variant="ghost" 
        className="text-muted-foreground hover:text-foreground transition-colors text-sm underline"
      >
        Skip
      </Button>
    </div>
  );
}
