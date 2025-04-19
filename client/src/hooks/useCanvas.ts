import { useEffect, useRef } from 'react';

interface UseCanvasProps {
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
}

export const useCanvas = ({
  width = window.innerWidth,
  height = window.innerHeight - 100,
  color = '#FFFFFF',
  lineWidth = 5
}: UseCanvasProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const prevPointRef = useRef<{ x: number; y: number } | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const colorRef = useRef(color);
  const lineWidthRef = useRef(lineWidth);
  const toolRef = useRef<'pen' | 'eraser'>('pen');

  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Get context
    const context = canvas.getContext('2d');
    if (context) {
      // Initialize with black background
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing styles
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      
      // Store context
      contextRef.current = context;
    }
  };

  const startDrawing = (x: number, y: number) => {
    if (!contextRef.current) return;
    
    isDrawingRef.current = true;
    prevPointRef.current = { x, y };
  };

  const draw = (x: number, y: number) => {
    if (!isDrawingRef.current || !contextRef.current || !prevPointRef.current) return;
    
    const ctx = contextRef.current;
    
    if (toolRef.current === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorRef.current;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.beginPath();
    ctx.moveTo(prevPointRef.current.x, prevPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    prevPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    prevPointRef.current = null;
  };

  const setTool = (tool: 'pen' | 'eraser') => {
    toolRef.current = tool;
    
    if (!contextRef.current) return;
    
    if (tool === 'pen') {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.strokeStyle = colorRef.current;
      contextRef.current.lineWidth = lineWidthRef.current;
    } else {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineWidth = lineWidthRef.current * 4;
    }
  };

  const setColor = (newColor: string) => {
    colorRef.current = newColor;
    if (contextRef.current && toolRef.current === 'pen') {
      contextRef.current.strokeStyle = newColor;
    }
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    contextRef.current.fillStyle = 'black';
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const getCanvasImage = (): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL('image/png');
  };

  return {
    canvasRef,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    setTool,
    setColor,
    clearCanvas,
    getCanvasImage
  };
};