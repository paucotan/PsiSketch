import { useEffect, useImperativeHandle, forwardRef, useRef, useState } from "react";

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
  const [canvasReady, setCanvasReady] = useState(false);
  
  // Initialize canvas on first render
  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // For high DPI displays
      const dpr = window.devicePixelRatio || 1;
      
      // Get display dimensions
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas dimensions with pixel ratio adjustment
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the context to ensure correct drawing
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      
      ctx.scale(dpr, dpr);
      
      // Configure context
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = color;
      contextRef.current = ctx;
      
      setCanvasReady(true);
    };
    
    // Initialize canvas and set up resize handler
    initCanvas();
    
    const handleResize = () => {
      // Delay canvas resize to avoid mobile keyboard issues
      setTimeout(initCanvas, 100);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
  
  // Set up all event handlers once canvas is ready
  useEffect(() => {
    if (!canvasReady) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Common drawing functions used by both mouse and touch
    const drawStart = (x: number, y: number) => {
      console.log("Drawing started at:", x, y);
      isDrawing.current = true;
      
      const rect = canvas.getBoundingClientRect();
      // Normalize coordinates
      const dpr = window.devicePixelRatio || 1;
      lastX.current = (x - rect.left);
      lastY.current = (y - rect.top);
      
      // Also draw a single point at start for better tap response
      if (contextRef.current) {
        const ctx = contextRef.current;
        ctx.beginPath();
        ctx.arc(lastX.current, lastY.current, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    const drawMove = (x: number, y: number) => {
      if (!isDrawing.current || !contextRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const currX = (x - rect.left);
      const currY = (y - rect.top);
      
      // Only draw if there's been some movement
      if (Math.abs(currX - lastX.current) + Math.abs(currY - lastY.current) > 0) {
        const ctx = contextRef.current;
        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        
        console.log("Drawing line from", lastX.current, lastY.current, "to", currX, currY);
        lastX.current = currX;
        lastY.current = currY;
      }
    };
    
    const drawEnd = () => {
      console.log("Drawing ended");
      isDrawing.current = false;
      saveDrawingData();
    };
    
    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      console.log("Mouse down:", e.clientX, e.clientY);
      drawStart(e.clientX, e.clientY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (isDrawing.current) {
        console.log("Mouse move with drawing active:", e.clientX, e.clientY);
        drawMove(e.clientX, e.clientY);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      drawEnd();
    };
    
    const handleMouseLeave = (e: MouseEvent) => {
      e.preventDefault();
      if (isDrawing.current) {
        drawEnd();
      }
    };
    
    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        console.log("Touch start:", e.touches[0].clientX, e.touches[0].clientY);
        drawStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isDrawing.current && e.touches.length > 0) {
        console.log("Touch move:", e.touches[0].clientX, e.touches[0].clientY);
        drawMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      drawEnd();
    };
    
    // Add all event listeners - use direct DOM API for consistent behavior
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Important: { passive: false } is required for preventing scrolling on touch devices
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasReady]); // Only re-run when canvas becomes ready
  
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
      try {
        return canvasRef.current.toDataURL("image/png");
      } catch (error) {
        console.error("Error getting image data:", error);
        return "";
      }
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
      style={{ 
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
