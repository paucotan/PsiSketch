import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStartSession: () => void;
  onViewHistory: () => void;
}

export default function WelcomeScreen({ onStartSession, onViewHistory }: WelcomeScreenProps) {
  return (
    <div className="screen active flex flex-col items-center justify-center p-6 animate-fade-in">
      <h1 className="text-3xl font-medium mb-6 text-foreground text-center">Remote Viewing Practice</h1>
      <div className="text-lg text-muted-foreground text-center mb-12">
        <p>Draw what you sense before seeing the random image</p>
      </div>
      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Button 
          onClick={onStartSession}
          className="bg-primary hover:bg-opacity-90 rounded-lg py-6 text-primary-foreground font-medium transition-all transform hover:scale-105"
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
