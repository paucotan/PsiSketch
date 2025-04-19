import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import { createComparisonImage, downloadImage } from "@/lib/imageUtils";

interface ShareModalProps {
  drawing: string;
  targetImage: string;
  onClose: () => void;
}

export default function ShareModal({ drawing, targetImage, onClose }: ShareModalProps) {
  const [shareLink, setShareLink] = useState<string>(`https://remote-view.app/s/${Math.random().toString(36).substring(2, 8)}`);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const comparisonTitle = "PsiSketch Session";
      const combinedImage = await createComparisonImage(drawing, targetImage, comparisonTitle);
      downloadImage(combinedImage, "psisketch-session.png");
      
      toast({
        title: "Success",
        description: "Combined image downloaded successfully",
      });
    } catch (error) {
      console.error('Failed to create comparison image:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Trying fallback method...",
        variant: "destructive",
      });
      
      // Fallback to the old method
      try {
        // Create a div to compose the images
        const compDiv = document.createElement("div");
        compDiv.style.display = "flex";
        compDiv.style.width = "800px";
        compDiv.style.height = "400px";
        compDiv.style.backgroundColor = "#000";
        
        // Add drawing image
        const drawingImg = document.createElement("img");
        drawingImg.src = drawing;
        drawingImg.style.width = "50%";
        drawingImg.style.height = "100%";
        drawingImg.style.objectFit = "contain";
        
        // Add target image
        const targetImg = document.createElement("img");
        targetImg.src = targetImage;
        targetImg.style.width = "50%";
        targetImg.style.height = "100%";
        targetImg.style.objectFit = "contain";
        
        compDiv.appendChild(drawingImg);
        compDiv.appendChild(targetImg);
        
        // Temporarily append to body (hidden)
        compDiv.style.position = "fixed";
        compDiv.style.left = "-9999px";
        document.body.appendChild(compDiv);
        
        // Use html2canvas to create a canvas from the div
        const canvas = await html2canvas(compDiv);
        
        // Create download link
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "psisketch-session.png";
        a.click();
        
        // Clean up
        document.body.removeChild(compDiv);
        
        toast({
          title: "Success",
          description: "Image downloaded with fallback method",
        });
      } catch (secondError) {
        toast({
          title: "Error",
          description: "All download methods failed",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleTwitterShare = async () => {
    try {
      // Create comparison image 
      const comparisonTitle = "PsiSketch Session";
      const combinedImage = await createComparisonImage(drawing, targetImage, comparisonTitle);
      
      // Create share text
      const text = "Check out my remote viewing practice session! #PsiSketch #RemoteViewing";
      
      // Download the image first
      downloadImage(combinedImage, "psisketch-session.png");
      
      // Then open Twitter intent with text
      setTimeout(() => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        
        // Show instruction toast
        toast({
          title: "Image Downloaded",
          description: "Please attach the downloaded image to your tweet for better sharing!",
        });
      }, 500);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to prepare image for sharing",
        variant: "destructive",
      });
      
      // Fallback to just sharing the link
      const text = "Check out my remote viewing practice session!";
      const url = shareLink;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };
  
  // Helper function to convert dataURI to Blob
  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-card rounded-lg max-w-sm w-full mx-4 p-5 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Share Your Session</h3>
          <Button onClick={onClose} variant="ghost" className="rounded-full p-1 hover:bg-muted">
            <span className="material-icons text-muted-foreground">close</span>
          </Button>
        </div>

        <div className="flex space-x-3 mb-4">
          <Button 
            onClick={handleDownload}
            className="flex-1 bg-muted hover:bg-opacity-90 rounded-lg py-3 flex justify-center items-center"
            variant="outline"
          >
            <span className="material-icons mr-2">download</span>
            <span>Download</span>
          </Button>
          <Button 
            onClick={handleTwitterShare}
            className="flex-1 bg-[#1DA1F2] hover:bg-opacity-90 rounded-lg py-3 flex justify-center items-center"
          >
            <span className="material-icons mr-2">share</span>
            <span>Twitter</span>
          </Button>
        </div>

        <div className="border border-muted rounded-lg overflow-hidden mb-4">
          <div className="p-3 bg-muted text-muted-foreground text-sm">Copy link</div>
          <div className="flex items-center">
            <Input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 p-3 bg-card text-foreground text-sm border-none outline-none"
            />
            <Button onClick={handleCopyLink} variant="ghost" className="p-3 bg-card">
              <span className="material-icons text-muted-foreground">content_copy</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
