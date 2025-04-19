import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import * as fabricModule from "fabric";
const fabric = fabricModule.fabric;

interface DrawingCanvasProps {
  tool: string;
  color: string;
  onDrawingChange: (drawingData: string) => void;
}

const DrawingCanvas = forwardRef(({ tool, color, onDrawingChange }: DrawingCanvasProps, ref) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);

  // Initialize canvas on component mount
  useEffect(() => {
    if (!canvasElRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasElRef.current, {
      isDrawingMode: true,
      width: window.innerWidth,
      height: window.innerHeight - 100, // Adjust for header and tools
      backgroundColor: "black",
    });

    // Set up brush
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = 5;

    setCanvas(fabricCanvas);

    // Handle window resize
    const handleResize = () => {
      fabricCanvas.setWidth(window.innerWidth);
      fabricCanvas.setHeight(window.innerHeight - 100); // Adjust for header and tools
      fabricCanvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      fabricCanvas.dispose();
    };
  }, []);

  // Update brush when tool or color changes
  useEffect(() => {
    if (!canvas) return;

    if (tool === "pen-tool") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = 5;
    } else if (tool === "eraser-tool") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "black"; // Eraser is just black drawing on black background
      canvas.freeDrawingBrush.width = 20;
    }
  }, [canvas, tool, color]);

  // Expose canvas methods to parent component
  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (!canvas) return "";
      return canvas.toDataURL({
        format: "png",
        quality: 0.8,
      });
    },
    setTool: (toolId: string) => {
      // The tool is handled in useEffect
    },
    clearCanvas: () => {
      if (!canvas) return;
      canvas.clear();
      canvas.backgroundColor = "black";
      canvas.renderAll();
    },
  }));

  // Save drawing data whenever canvas changes
  useEffect(() => {
    if (!canvas) return;

    const saveDrawing = () => {
      const dataUrl = canvas.toDataURL({
        format: "png",
        quality: 0.8,
      });
      onDrawingChange(dataUrl);
    };

    canvas.on("mouse:up", saveDrawing);
    canvas.on("mouse:out", saveDrawing);
    canvas.on("touch:end", saveDrawing);

    return () => {
      canvas.off("mouse:up", saveDrawing);
      canvas.off("mouse:out", saveDrawing);
      canvas.off("touch:end", saveDrawing);
    };
  }, [canvas, onDrawingChange]);

  return (
    <canvas 
      ref={canvasElRef} 
      id="drawing-canvas" 
      className="canvas-container absolute inset-0 w-full h-full" 
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
