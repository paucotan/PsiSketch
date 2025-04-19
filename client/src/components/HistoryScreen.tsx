import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LocalSession } from "@shared/schema";

interface HistoryScreenProps {
  sessions: LocalSession[];
  onBackToHome: () => void;
}

export default function HistoryScreen({ sessions, onBackToHome }: HistoryScreenProps) {
  // Function to get badge color based on rating
  const getBadgeColor = (rating: string) => {
    switch (rating) {
      case "hit":
        return "bg-[#4CAF50] bg-opacity-20 text-[#4CAF50]";
      case "miss":
        return "bg-[#F44336] bg-opacity-20 text-[#F44336]";
      case "maybe":
        return "bg-[#FF9800] bg-opacity-20 text-[#FF9800]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="screen flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-card">
        <div className="text-foreground font-medium">Your Practice History</div>
        <Button onClick={onBackToHome} variant="ghost" className="rounded-lg p-2">
          <span className="material-icons text-muted-foreground">close</span>
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <span className="material-icons text-5xl mb-2">history</span>
            <p>No practice sessions yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id} 
              className="history-item bg-card rounded-lg overflow-hidden shadow-lg animate-slide-up"
            >
              <div className="flex h-32 w-full">
                <div className="w-1/2 bg-black">
                  <img 
                    src={session.thumbnailImage} 
                    alt="Target image" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="w-1/2 bg-black border-l border-card">
                  <img 
                    src={session.drawing} 
                    alt="Your drawing" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(session.createdAt)}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${getBadgeColor(session.rating)}`}>
                    {session.rating.charAt(0).toUpperCase() + session.rating.slice(1)}
                  </div>
                </div>
                {session.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {session.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
