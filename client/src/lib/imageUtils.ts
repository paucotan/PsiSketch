/**
 * Creates a side-by-side comparison image from drawing and target images
 * @param drawingUrl URL of the drawing image
 * @param targetUrl URL of the target image
 * @param title Optional title for the combined image
 * @returns Promise that resolves to the data URL of the combined image
 */
export async function createComparisonImage(
  drawingUrl: string, 
  targetUrl: string,
  title: string = 'PsiSketch Comparison'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Unable to get canvas context'));
      return;
    }
    
    // Set canvas dimensions - we'll adjust based on loaded images
    canvas.width = 1200;
    canvas.height = 600;
    
    // Load drawing image
    const drawingImg = new Image();
    drawingImg.crossOrigin = 'anonymous';
    drawingImg.onload = () => {
      // Load target image
      const targetImg = new Image();
      targetImg.crossOrigin = 'anonymous';
      targetImg.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        const MAX_HEIGHT = 500;
        const MAX_WIDTH = 550;
        
        // Calculate scaled dimensions while maintaining aspect ratio
        let drawingWidth = drawingImg.width;
        let drawingHeight = drawingImg.height;
        let targetWidth = targetImg.width;
        let targetHeight = targetImg.height;
        
        // Scale down drawing if needed
        if (drawingHeight > MAX_HEIGHT) {
          const ratio = MAX_HEIGHT / drawingHeight;
          drawingHeight = MAX_HEIGHT;
          drawingWidth *= ratio;
        }
        if (drawingWidth > MAX_WIDTH) {
          const ratio = MAX_WIDTH / drawingWidth;
          drawingWidth = MAX_WIDTH;
          drawingHeight *= ratio;
        }
        
        // Scale down target if needed
        if (targetHeight > MAX_HEIGHT) {
          const ratio = MAX_HEIGHT / targetHeight;
          targetHeight = MAX_HEIGHT;
          targetWidth *= ratio;
        }
        if (targetWidth > MAX_WIDTH) {
          const ratio = MAX_WIDTH / targetWidth;
          targetWidth = MAX_WIDTH;
          targetHeight *= ratio;
        }
        
        // Adjust canvas size
        const padding = 40;
        const titleHeight = 60;
        canvas.width = drawingWidth + targetWidth + padding * 3;
        canvas.height = Math.max(drawingHeight, targetHeight) + padding * 3 + titleHeight;
        
        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, padding + 30);
        
        // Draw drawing and its label
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Your Drawing', padding + drawingWidth / 2, padding + titleHeight + 30);
        ctx.drawImage(
          drawingImg, 
          padding, 
          padding + titleHeight + 40, 
          drawingWidth, 
          drawingHeight
        );
        
        // Draw target and its label
        ctx.fillText('Target Image', padding * 2 + drawingWidth + targetWidth / 2, padding + titleHeight + 30);
        ctx.drawImage(
          targetImg, 
          padding * 2 + drawingWidth, 
          padding + titleHeight + 40, 
          targetWidth, 
          targetHeight
        );
        
        // Convert to data URL and resolve
        resolve(canvas.toDataURL('image/png'));
      };
      
      targetImg.onerror = () => {
        reject(new Error('Failed to load target image'));
      };
      
      targetImg.src = targetUrl;
    };
    
    drawingImg.onerror = () => {
      reject(new Error('Failed to load drawing image'));
    };
    
    drawingImg.src = drawingUrl;
  });
}

/**
 * Downloads an image from a data URL
 * @param dataUrl The data URL of the image
 * @param filename The filename to use
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}