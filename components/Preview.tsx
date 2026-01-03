
import React, { useEffect, useRef } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.mapWidth * config.panelWidthPx;
    const height = config.halfHeightRow 
        ? (config.mapHeight - 0.5) * config.panelHeightPx 
        : config.mapHeight * config.panelHeightPx;

    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // Draw Checkerboard
    const rows = config.mapHeight;
    const cols = config.mapWidth;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isHalfRow = config.halfHeightRow && r === rows - 1;
        const pHeight = isHalfRow ? config.panelHeightPx / 2 : config.panelHeightPx;
        
        ctx.fillStyle = (r + c) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        // Coordinates
        if (config.showCoords) {
           ctx.fillStyle = 'rgba(255,255,255,0.7)';
           ctx.font = '10px Inter';
           ctx.textAlign = 'center';
           ctx.fillText(`${c+1},${r+1}`, c * config.panelWidthPx + config.panelWidthPx/2, r * config.panelHeightPx + pHeight/2 + 4);
        }
      }
    }

    if (config.showScaleOverlay) {
      // Big Circle
      ctx.beginPath();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.45;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Horizontal/Vertical center lines
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();
    }

    // Logo Placeholder
    if (config.showLogo) {
       ctx.fillStyle = 'white';
       ctx.fillRect(20, 20, 60, 60);
       ctx.fillStyle = 'black';
       ctx.font = 'bold 12px Inter';
       ctx.textAlign = 'center';
       ctx.fillText('LOGO', 50, 55);
    }

    // User Name / Screen Name
    if (config.showUserName) {
      const labelText = config.screenName || 'Screen 1';
      ctx.font = 'bold 24px Inter';
      const metrics = ctx.measureText(labelText);
      const textWidth = metrics.width;
      const paddingX = 30;
      const paddingY = 15;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = 40 + paddingY;

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      roundRect(ctx, (width - rectWidth) / 2, (height - rectHeight) / 2, rectWidth, rectHeight, 10, true, true);

      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, width / 2, height / 2);
    }

    // Specifications Bar
    if (config.showSpecs) {
      const totalPanels = config.mapWidth * config.mapHeight;
      const aspectRatio = reduce(width, height).join(':');
      const specText = `Panel Count: ${config.mapWidth} wide × ${config.mapHeight} high • ${totalPanels} panels total • Resolution: ${width} × ${height} px • Aspect Ratio: ${aspectRatio}`;
      
      ctx.font = '14px Inter';
      const specMetrics = ctx.measureText(specText);
      const barWidth = specMetrics.width + 40;
      const barHeight = 30;
      const barY = height - barHeight - 20;

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      roundRect(ctx, (width - barWidth) / 2, barY, barWidth, barHeight, 15, true, true);

      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(specText, width / 2, barY + barHeight / 2);
    }

  }, [config, canvasRef]);

  // Helper functions
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: boolean, stroke: boolean) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Fixed reduce function to avoid shadowing and type mismatch between the function and the resulting number
  function reduce(numerator: number, denominator: number) {
    const calculateGcd = (a: number, b: number): number => {
      return b ? calculateGcd(b, a % b) : a;
    };
    const commonDivisor = calculateGcd(numerator, denominator);
    return [numerator / commonDivisor, denominator / commonDivisor];
  }

  return (
    <div ref={containerRef} className="max-w-full max-h-full flex items-center justify-center p-4">
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-[80vh] shadow-2xl bg-black rounded-sm border-4 border-white/10"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default Preview;
