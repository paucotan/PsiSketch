import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import BreathingScreen from "@/components/BreathingScreen";
import DrawingScreen from "@/components/DrawingScreen";
import RevealScreen from "@/components/RevealScreen";
import ShareModal from "@/components/ShareModal";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { LocalSession } from "@shared/schema";
import { useLocation } from "wouter";

type Screen = "welcome" | "breathing" | "drawing" | "reveal";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [drawing, setDrawing] = useState<string>("");
  const [targetImage, setTargetImage] = useState<string>("");
  const [thumbnailImage, setThumbnailImage] = useState<string>("");
  const [rating, setRating] = useState<"hit" | "miss" | "maybe" | "">("");
  const [notes, setNotes] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);
  const { savePracticeSession } = useSessionStorage();
  const [_, navigate] = useLocation();

  // Function to handle starting a new practice session
  const handleStartSession = () => {
    setScreen("breathing");
  };

  // Function to handle skipping breathing exercise
  const handleSkipBreathing = () => {
    setScreen("drawing");
  };

  // Function to save drawing data from canvas
  const saveDrawingData = (data: string) => {
    setDrawing(data);
  };

  // Function to handle revealing the target image
  const handleRevealImage = (imageUrl: string, thumbnailUrl: string) => {
    setTargetImage(imageUrl);
    setThumbnailImage(thumbnailUrl);
    setScreen("reveal");
  };

  // Function to handle saving a session
  const handleSaveSession = () => {
    if (!rating) return;

    const session: Omit<LocalSession, "id" | "createdAt"> = {
      drawing,
      targetImage,
      thumbnailImage,
      rating,
      notes,
    };

    savePracticeSession(session);
    setScreen("welcome");
    resetSession();
  };

  // Function to reset the session data
  const resetSession = () => {
    setDrawing("");
    setTargetImage("");
    setThumbnailImage("");
    setRating("");
    setNotes("");
  };
  
  // Function to handle the "Try Again" button click
  const handleTryAgain = () => {
    resetSession();
    setScreen("breathing");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen relative">
      {screen === "welcome" && (
        <WelcomeScreen 
          onStartSession={handleStartSession} 
          onViewHistory={() => navigate("/history")} 
        />
      )}
      
      {screen === "breathing" && (
        <BreathingScreen 
          onSkip={handleSkipBreathing} 
          onComplete={handleSkipBreathing} 
        />
      )}
      
      {screen === "drawing" && (
        <DrawingScreen 
          onDrawingChange={saveDrawingData} 
          onRevealImage={handleRevealImage} 
        />
      )}
      
      {screen === "reveal" && (
        <RevealScreen 
          targetImage={targetImage}
          drawing={drawing}
          onRatingChange={setRating}
          onNotesChange={setNotes}
          onSaveSession={handleSaveSession}
          onShareSession={() => setShowShareModal(true)}
          onTryAgain={handleTryAgain}
          rating={rating}
          notes={notes}
        />
      )}

      {showShareModal && (
        <ShareModal 
          drawing={drawing}
          targetImage={targetImage}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
