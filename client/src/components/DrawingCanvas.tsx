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
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to fill the container
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // Adjust for header and tools
      
      // Set up canvas context
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
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  // Update drawing color and tool
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    
    if (tool === "pen-tool") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
    } else if (tool === "eraser-tool") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    }
  }, [tool, color]);
  
  // Touch event handling - must be outside to properly prevent default
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent default to avoid iOS selection behavior
      isDrawing.current = true;
      
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      lastX.current = (clientX - rect.left) * scaleX;
      lastY.current = (clientY - rect.top) * scaleY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent iOS scrolling
      if (!isDrawing.current || !contextRef.current) return;
      
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      const ctx = contextRef.current;
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      lastX.current = x;
      lastY.current = y;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDrawing.current = false;
      saveDrawingData();
    };
    
    // Add passive: false to properly prevent default behavior
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Drawing handlers for mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if ('touches' in e) return; // Now only handle mouse events here
    
    isDrawing.current = true;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Adjust for canvas position and scale
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Get the scale factor (in case canvas is styled with CSS)
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;
      
      // Calculate the correct position
      lastX.current = (clientX - rect.left) * scaleX;
      lastY.current = (clientY - rect.top) * scaleY;
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if ('touches' in e) return; // Now only handle mouse events here
    if (!isDrawing.current || !contextRef.current) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Adjust for canvas position and scale
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Get the scale factor (in case canvas is styled with CSS)
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;
      
      // Calculate the correct position
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      const ctx = contextRef.current;
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      lastX.current = x;
      lastY.current = y;
    }
  };
  
  const stopDrawing = () => {
    isDrawing.current = false;
    saveDrawingData();
  };
  
  const saveDrawingData = () => {
    if (canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        onDrawingChange(dataUrl);
      } catch (error) {
        console.error("Error saving canvas data:", error);
      }
    }
  };
  
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (!canvasRef.current) return "";
      return canvasRef.current.toDataURL("image/png");
    },
    setTool: (toolId: string) => {
      // This is handled by the tool state and useEffect
    },
    clearCanvas: () => {
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
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      // Touch events are handled via direct event listeners with { passive: false }
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
