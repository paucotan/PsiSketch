import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import DrawingCanvas from "@/components/DrawingCanvas";
import { fetchRandomImage } from "@/lib/unsplash";
import { useToast } from "@/hooks/use-toast";
import GuidanceTip, { getRandomTip } from "@/components/GuidanceTips";
import { FaPencilAlt, FaEraser, FaTrash } from "react-icons/fa";

interface DrawingScreenProps {
  onDrawingChange: (drawingData: string) => void;
  onRevealImage: (imageUrl: string, thumbnailUrl: string) => void;
}

export default function DrawingScreen({ 
  onDrawingChange, 
  onRevealImage 
}: DrawingScreenProps) {
  const [activeToolId, setActiveToolId] = useState("pen-tool");
  const [color, setColor] = useState("#FFFFFF");
  const [guidanceTip, setGuidanceTip] = useState<string>("");
  const canvasRef = useRef<{ 
    getImageData: () => string;
    setTool: (tool: string) => void;
    clearCanvas: () => void; 
  }>(null);
  const { toast } = useToast();
  
  // Set the guidance tip in useEffect to avoid state updates during render
  useEffect(() => {
    setGuidanceTip(getRandomTip("drawing"));
  }, []);
  
  const handleToolChange = (toolId: string) => {
    setActiveToolId(toolId);
    if (canvasRef.current) {
      canvasRef.current.setTool(toolId);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleRevealImage = async () => {
    try {
      // Get the drawing data
      if (canvasRef.current) {
        const drawingData = canvasRef.current.getImageData();
        onDrawingChange(drawingData);
      }

      // Fetch random image from Unsplash
      const { fullImage, thumbnail } = await fetchRandomImage();
      onRevealImage(fullImage, thumbnail);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch random image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="screen flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-card">
        <div className="text-foreground font-medium">Draw Your Impression</div>
        <Button
          onClick={handleRevealImage}
          className="bg-primary hover:bg-opacity-90 rounded-lg py-2 px-4 text-foreground text-sm font-medium"
        >
          Reveal Image
        </Button>
      </div>

      <div className="flex-grow relative overflow-hidden">
        <GuidanceTip tip={guidanceTip} screen="drawing" />
        <DrawingCanvas 
          ref={canvasRef}
          tool={activeToolId}
          color={color}
          onDrawingChange={(data) => {
            console.log("Drawing data changed");
            onDrawingChange(data);
          }}
        />
      </div>

      <div className="drawing-tools flex justify-around items-center p-3 bg-card">
        <button
          onClick={() => handleToolChange("pen-tool")}
          className={`tool-button p-3 rounded-full ${
            activeToolId === "pen-tool" ? "bg-muted" : ""
          }`}
        >
          <FaPencilAlt className="text-foreground text-lg" />
        </button>
        <button
          onClick={() => handleToolChange("eraser-tool")}
          className={`tool-button p-3 rounded-full ${
            activeToolId === "eraser-tool" ? "bg-muted" : ""
          }`}
        >
          <FaEraser className="text-muted-foreground text-lg" />
        </button>
        <div className="flex justify-center items-center space-x-2">
          <input
            type="color"
            id="color-picker"
            value={color}
            onChange={handleColorChange}
            className="w-8 h-8 border-none rounded-full cursor-pointer overflow-hidden"
            style={{ background: "none" }}
          />
        </div>
        <button
          onClick={handleClearCanvas}
          className="tool-button p-3 rounded-full"
        >
          <FaTrash className="text-muted-foreground text-lg" />
        </button>
      </div>
    </div>
  );
}
