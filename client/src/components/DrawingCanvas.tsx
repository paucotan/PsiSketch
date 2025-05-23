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
  
  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    
    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
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
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !contextRef.current) return;
    
    // Prevent scrolling when drawing on touch devices
    if ('touches' in e) {
      e.preventDefault();
    }
    
    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
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
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onDrawingChange(dataUrl);
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
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
