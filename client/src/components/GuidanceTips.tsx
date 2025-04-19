import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface GuidanceTipProps {
  tip: string;
  screen: "breathing" | "drawing" | "reveal";
}

export default function GuidanceTip({ tip, screen }: GuidanceTipProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const getIconColor = () => {
    switch (screen) {
      case "breathing":
        return "text-blue-400";
      case "drawing":
        return "text-violet-400";
      case "reveal":
        return "text-green-400";
      default:
        return "text-primary";
    }
  };

  if (!isVisible) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-2 right-2 opacity-60 hover:opacity-100"
        onClick={() => setIsVisible(true)}
      >
        <Info className={`h-5 w-5 ${getIconColor()}`} />
      </Button>
    );
  }

  return (
    <Card className="absolute top-2 right-2 w-auto max-w-72 bg-background/80 backdrop-blur-sm border border-muted shadow-lg z-10 transition-all duration-200">
      <CardContent className="pt-4 px-4 pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Info className={`h-4 w-4 ${getIconColor()}`} />
            <span className="text-xs font-medium uppercase text-muted-foreground">Guidance</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
        <p className="text-sm text-foreground">{tip}</p>
      </CardContent>
    </Card>
  );
}

// Tips for different screens
export const breathingTips = [
  "Take 3 deep breaths to calm your mind before visualizing",
  "Focus on relaxing your entire body with each exhale",
  "Clear your thoughts and create mental space for impressions",
  "Imagine yourself as a receiver, open to subtle perceptions"
];

export const drawingTips = [
  "Don't analyze your thoughts, focus on sensory perceptions and intuition",
  "Draw what you feel, not what you think",
  "Pay attention to colors, shapes, textures, and emotions that arise",
  "Don't judge your impressions, just capture them on the canvas"
];

export const revealTips = [
  "When you get a hit, reflect on what sensations guided you",
  "Look for partial matches - even small details count",
  "Note which senses gave you the most accurate impressions",
  "With practice, you'll learn to distinguish imagination from perception"
];

// Helper function to get a random tip for a specific screen
export const getRandomTip = (screen: "breathing" | "drawing" | "reveal"): string => {
  let tips: string[] = [];
  
  switch (screen) {
    case "breathing":
      tips = breathingTips;
      break;
    case "drawing":
      tips = drawingTips;
      break;
    case "reveal":
      tips = revealTips;
      break;
  }
  
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
};