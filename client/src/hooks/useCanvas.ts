import { useState, useEffect, useRef } from 'react';

interface UseCanvasProps {
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
}

export const useCanvas = ({
  width = window.innerWidth,
  height = window.innerHeight,
  color = '#FFFFFF',
  lineWidth = 5,
}: UseCanvasProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');

  // Initialize canvas context
  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Set the canvas dimensions with pixel ratio for high-res screens
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Get context and configure
    const context = canvas.getContext('2d');
    if (context) {
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.fillStyle = 'black';
      context.fillRect(0, 0, width, height);
      
      contextRef.current = context;
    }
  };

  // Start drawing
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    
    // Get mouse/touch position
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  // Continue drawing
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    
    // Get mouse/touch position
    let clientX, clientY;
    
    if ('touches' in event) {
      // Prevent scrolling when drawing
      event.preventDefault();
      
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Change drawing tool
  const setTool = (tool: 'pen' | 'eraser') => {
    if (!contextRef.current) return;
    
    setCurrentTool(tool);
    
    if (tool === 'pen') {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    } else {
      contextRef.current.strokeStyle = 'black';
      contextRef.current.lineWidth = lineWidth * 4;
    }
  };

  // Change color
  const setColor = (newColor: string) => {
    if (!contextRef.current) return;
    
    if (currentTool === 'pen') {
      contextRef.current.strokeStyle = newColor;
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.fillStyle = 'black';
    contextRef.current.fillRect(0, 0, width, height);
  };

  // Get canvas image as data URL
  const getImageData = (): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !contextRef.current) return;
      
      // Save the current drawing
      const imageData = getImageData();
      
      // Resize canvas
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      initializeCanvas(canvasRef.current);
      
      // Restore drawing if needed
      if (imageData) {
        const img = new Image();
        img.onload = () => {
          contextRef.current?.drawImage(img, 0, 0, newWidth, newHeight);
        };
        img.src = imageData;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    setTool,
    setColor,
    clearCanvas,
    getImageData,
    isDrawing,
    currentTool,
  };
};
