import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useCanvas } from '@/hooks/useCanvas';

interface DrawingCanvasProps {
  tool: string;
  color: string;
  onDrawingChange: (drawingData: string) => void;
}

const DrawingCanvas = forwardRef<
  { getImageData: () => string; setTool: (tool: string) => void; clearCanvas: () => void },
  DrawingCanvasProps
>(({ tool, color, onDrawingChange }, ref) => {
  const {
    canvasRef,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    setTool: setCanvasTool,
    setColor,
    clearCanvas,
    getCanvasImage
  } = useCanvas({ color });

  // Initialize canvas when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      console.log('Initializing canvas');
      initializeCanvas(canvasRef.current);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        initializeCanvas(canvasRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);
  
  // Update tool and color when props change
  useEffect(() => {
    console.log('Updating tool and color', tool, color);
    if (tool === 'pen-tool') {
      setCanvasTool('pen');
    } else if (tool === 'eraser-tool') {
      setCanvasTool('eraser');
    }
    
    setColor(color);
  }, [tool, color, setCanvasTool, setColor]);
  
  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse down', e.clientX, e.clientY);
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startDrawing(x, y);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    draw(x, y);
  };
  
  const handleMouseUp = () => {
    stopDrawing();
    const imageData = getCanvasImage();
    onDrawingChange(imageData);
  };
  
  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    console.log('Touch start');
    
    if (!canvasRef.current || !e.touches[0]) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    startDrawing(x, y);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!canvasRef.current || !e.touches[0]) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    draw(x, y);
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
    const imageData = getCanvasImage();
    onDrawingChange(imageData);
  };
  
  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getImageData: () => {
      return getCanvasImage();
    },
    setTool: (toolId: string) => {
      if (toolId === 'pen-tool') {
        setCanvasTool('pen');
      } else if (toolId === 'eraser-tool') {
        setCanvasTool('eraser');
      }
    },
    clearCanvas: () => {
      clearCanvas();
      onDrawingChange(getCanvasImage());
    }
  }));
  
  return (
    <canvas
      ref={canvasRef}
      id="drawing-canvas"
      width={window.innerWidth}
      height={window.innerHeight - 100}
      className="canvas-container absolute inset-0 w-full h-full"
      style={{ touchAction: 'none', userSelect: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
