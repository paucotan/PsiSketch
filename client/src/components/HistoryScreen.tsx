import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { LocalSession } from "@shared/schema";
import { createComparisonImage, downloadImage } from "@/lib/imageUtils";

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
                  <div className="flex items-center">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </div>
                    <button 
                      className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Create the share modal for this session
                        const shareModal = document.createElement('div');
                        shareModal.innerHTML = `
                          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
                              <div class="flex flex-col space-y-4">
                                <h3 class="text-xl font-semibold">Share Session</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p class="text-sm font-medium mb-1">Your Drawing</p>
                                    <img src="${session.drawing}" alt="Your drawing" class="w-full h-auto border rounded" />
                                  </div>
                                  <div>
                                    <p class="text-sm font-medium mb-1">Target Image</p>
                                    <img src="${session.thumbnailImage}" alt="Target" class="w-full h-auto border rounded" />
                                  </div>
                                </div>
                                <div class="flex space-x-2 justify-end">
                                  <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" id="closeShareModal">
                                    Close
                                  </button>
                                  <button class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90" id="downloadShareImages">
                                    Download Images
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(shareModal);
                        
                        // Add event listeners
                        document.getElementById('closeShareModal')?.addEventListener('click', () => {
                          document.body.removeChild(shareModal);
                        });
                        
                        document.getElementById('downloadShareImages')?.addEventListener('click', async () => {
                          try {
                            // Show loading indicator
                            const downloadBtn = document.getElementById('downloadShareImages');
                            if (downloadBtn) {
                              downloadBtn.textContent = 'Creating image...';
                              downloadBtn.setAttribute('disabled', 'true');
                            }
                            
                            // Create and download combined image
                            const comparisonTitle = `PsiSketch - ${session.rating.charAt(0).toUpperCase() + session.rating.slice(1)}`;
                            const combinedImage = await createComparisonImage(
                              session.drawing, 
                              session.thumbnailImage,
                              comparisonTitle
                            );
                            
                            // Download the combined image
                            downloadImage(combinedImage, `psisketch-session-${session.id}.png`);
                            
                            // Restore button
                            if (downloadBtn) {
                              downloadBtn.textContent = 'Download Images';
                              downloadBtn.removeAttribute('disabled');
                            }
                          } catch (error) {
                            console.error('Failed to create comparison image:', error);
                            alert('Sorry, there was a problem creating the combined image. Please try again.');
                            
                            // Fallback to downloading separate images
                            const drawingLink = document.createElement('a');
                            drawingLink.href = session.drawing;
                            drawingLink.download = `drawing-${session.id}.png`;
                            drawingLink.click();
                            
                            setTimeout(() => {
                              const targetLink = document.createElement('a');
                              targetLink.href = session.thumbnailImage;
                              targetLink.download = `target-${session.id}.jpg`;
                              targetLink.click();
                            }, 100);
                          }
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                      </svg>
                    </button>
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
