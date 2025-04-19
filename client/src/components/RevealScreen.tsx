import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GuidanceTip, { getRandomTip } from "@/components/GuidanceTips";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

interface RevealScreenProps {
  targetImage: string;
  drawing: string; // Add drawing prop
  rating: string;
  notes: string;
  onRatingChange: (rating: "hit" | "miss" | "maybe") => void;
  onNotesChange: (notes: string) => void;
  onSaveSession: () => void;
  onShareSession: () => void;
  onTryAgain: () => void;
}

export default function RevealScreen({
  targetImage,
  drawing,
  rating,
  notes,
  onRatingChange,
  onNotesChange,
  onSaveSession,
  onShareSession,
  onTryAgain,
}: RevealScreenProps) {
  const [guidanceTip, setGuidanceTip] = useState<string>("");
  
  // Set the guidance tip in useEffect to avoid state updates during render
  useEffect(() => {
    setGuidanceTip(getRandomTip("reveal"));
  }, []);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(e.target.value);
  };

  return (
    <div className="screen flex flex-col h-full">
      <div className="flex-grow relative overflow-hidden bg-black">
        <GuidanceTip tip={guidanceTip} screen="reveal" />
        
        {/* Side-by-side comparison */}
        <div className="w-full h-full flex flex-col md:flex-row">
          {/* Your Drawing */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-900 p-2 text-center text-sm text-gray-400">
              Your Drawing
            </div>
            <div className="flex-1 flex items-center justify-center p-2">
              <img
                src={drawing}
                alt="Your drawing"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          {/* Separator */}
          <div className="w-full h-[1px] md:w-[1px] md:h-full bg-gray-800"></div>
          
          {/* Target Image */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-900 p-2 text-center text-sm text-gray-400">
              Target Image
            </div>
            <div className="flex-1 flex items-center justify-center p-2">
              <img
                src={targetImage}
                alt="Target image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card">
        <h3 className="text-lg font-medium mb-4 text-foreground">How did you do?</h3>
        <div className="flex justify-between space-x-2 mb-6">
          <Button
            onClick={() => onRatingChange("miss")}
            className={`flex-1 py-2 rounded-lg border border-[#F44336] ${
              rating === "miss"
                ? "bg-[#F44336] bg-opacity-20 text-[#F44336]"
                : "text-[#F44336] hover:bg-[#F44336] hover:bg-opacity-20"
            } transition-colors`}
            variant="outline"
          >
            Miss
          </Button>
          <Button
            onClick={() => onRatingChange("maybe")}
            className={`flex-1 py-2 rounded-lg border border-[#FF9800] ${
              rating === "maybe"
                ? "bg-[#FF9800] bg-opacity-20 text-[#FF9800]"
                : "text-[#FF9800] hover:bg-[#FF9800] hover:bg-opacity-20"
            } transition-colors`}
            variant="outline"
          >
            Maybe
          </Button>
          <Button
            onClick={() => onRatingChange("hit")}
            className={`flex-1 py-2 rounded-lg border border-[#4CAF50] ${
              rating === "hit"
                ? "bg-[#4CAF50] bg-opacity-20 text-[#4CAF50]"
                : "text-[#4CAF50] hover:bg-[#4CAF50] hover:bg-opacity-20"
            } transition-colors`}
            variant="outline"
          >
            Hit
          </Button>
        </div>

        <Textarea
          id="feedback-notes"
          placeholder="Add notes about your experience (optional)"
          className="w-full p-3 rounded-lg bg-muted text-foreground placeholder-muted-foreground mb-4"
          value={notes}
          onChange={handleNotesChange}
        />

        <div className="flex space-x-2 mb-4">
          <Button
            onClick={onTryAgain}
            className="flex-1 bg-muted hover:bg-opacity-90 rounded-lg py-3 px-4 text-foreground font-medium"
            variant="outline"
          >
            <span className="material-icons mr-1 text-foreground">refresh</span>
            Try Again
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={onSaveSession}
            className="flex-1 bg-primary hover:bg-opacity-90 rounded-lg py-3 px-4 text-foreground font-medium"
            disabled={!rating}
          >
            Save Session
          </Button>
          <Button
            onClick={onShareSession}
            className="bg-muted hover:bg-opacity-90 rounded-lg py-3 px-4"
            variant="outline"
          >
            <span className="material-icons text-foreground">share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
