import { useEffect, useImperativeHandle, forwardRef, useRef } from "react";

interface DrawingCanvasProps {
  tool: string;
  color: string;
  onDrawingChange: (drawingData: string) => void;
}

const DrawingCanvas = forwardRef(({ tool, color, onDrawingChange }: DrawingCanvasProps, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  
  // Initialize canvas on mount
  useEffect(() => {
    console.log("Initializing canvas");
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100; // Adjust for header and tools
    
    // Get context
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = color;
      contextRef.current = ctx;
    }
    
    // Set up mouse events
    function handleMouseDown(e: MouseEvent) {
      console.log("Mouse down:", e.clientX, e.clientY);
      isDrawing.current = true;
      
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      lastX.current = e.clientX - rect.left;
      lastY.current = e.clientY - rect.top;
    }
    
    function handleMouseMove(e: MouseEvent) {
      if (!isDrawing.current) return;
      console.log("Mouse move:", e.clientX, e.clientY);
      
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = contextRef.current;
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX.current = x;
        lastY.current = y;
      }
    }
    
    function handleMouseUp() {
      console.log("Mouse up");
      isDrawing.current = false;
      saveDrawingData();
    }
    
    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    
    // Touch events - defined below with proper variable references for cleanup
    
    // Store touch handlers for cleanup
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      console.log("Touch start");
      isDrawing.current = true;
      
      const rect = canvas.getBoundingClientRect();
      lastX.current = e.touches[0].clientX - rect.left;
      lastY.current = e.touches[0].clientY - rect.top;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      console.log("Touch move");
      
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      
      const ctx = contextRef.current;
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX.current = x;
        lastY.current = y;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      console.log("Touch end");
      isDrawing.current = false;
      saveDrawingData();
    };
    
    // Add touch event listeners with passive: false option
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    
    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  
  // Update color and tool
  useEffect(() => {
    console.log("Updating color or tool:", color, tool);
    if (!contextRef.current) return;
    
    if (tool === "pen-tool") {
      contextRef.current.globalCompositeOperation = "source-over";
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = 5;
    } else if (tool === "eraser-tool") {
      contextRef.current.globalCompositeOperation = "destination-out";
      contextRef.current.lineWidth = 20;
    }
  }, [tool, color]);
  
  const saveDrawingData = () => {
    console.log("Saving drawing data");
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onDrawingChange(dataUrl);
    }
  };
  
  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    getImageData: () => {
      console.log("Getting image data");
      if (!canvasRef.current) return "";
      return canvasRef.current.toDataURL("image/png");
    },
    setTool: (toolId: string) => {
      console.log("Setting tool:", toolId);
      // This is handled by the tool state and useEffect
    },
    clearCanvas: () => {
      console.log("Clearing canvas");
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) return;
      
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveDrawingData();
    },
  }));

  return (
    <canvas 
      ref={canvasRef}
      id="drawing-canvas"
      className="canvas-container absolute inset-0 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
