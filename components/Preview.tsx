
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

    // DRAW WIRING
    if (config.showWiring) {
      drawWiring(ctx, config, width, height);
    }

    if (config.showScaleOverlay) {
      // Big Circle - Thicker line
      ctx.beginPath();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.45;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Crosshairs (X) - Thicker line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      // Horizontal center line - Slightly thicker (Vertical line removed per request)
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2.5;
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

  function drawWiring(ctx: CanvasRenderingContext2D, cfg: ScreenConfig, width: number, height: number) {
    const MAX_PIXELS_PER_PORT = 655360;
    const cableColors = ['#f59e0b', '#10b981', '#3b82f6', '#9ca3af', '#ef4444', '#8b5cf6', '#ec4899'];
    
    interface PanelPoint {
        x: number;
        y: number;
        pixels: number;
    }

    const orderedPanels: PanelPoint[] = [];
    const W = cfg.mapWidth;
    const H = cfg.mapHeight;

    if (W <= 0 || H <= 0) return;

    // Generate the ordered sequence of panels based on pattern
    for (let i = 0; i < W * H; i++) {
        let col = 0, row = 0;
        
        if (cfg.wiringPattern.startsWith('row')) {
            row = Math.floor(i / W);
            col = i % W;
            if (cfg.wiringPattern === 'row-serpentine' && row % 2 !== 0) {
                col = (W - 1) - col;
            }
        } else {
            col = Math.floor(i / H);
            row = i % H;
            if (cfg.wiringPattern === 'col-serpentine' && col % 2 !== 0) {
                row = (H - 1) - row;
            }
        }

        // Apply Start Corner transformation
        let finalCol = col;
        let finalRow = row;
        if (cfg.wiringStartCorner === 'TR') finalCol = (W - 1) - col;
        if (cfg.wiringStartCorner === 'BL') finalRow = (H - 1) - row;
        if (cfg.wiringStartCorner === 'BR') {
            finalCol = (W - 1) - col;
            finalRow = (H - 1) - row;
        }

        const isHalfRow = cfg.halfHeightRow && finalRow === H - 1;
        const pHeight = isHalfRow ? cfg.panelHeightPx / 2 : cfg.panelHeightPx;
        const pPixels = cfg.panelWidthPx * pHeight;
        
        orderedPanels.push({
            x: finalCol * cfg.panelWidthPx + cfg.panelWidthPx / 2,
            y: finalRow * cfg.panelHeightPx + pHeight / 2,
            pixels: pPixels
        });
    }

    // New splitting logic: respect column/row boundaries
    const cables: PanelPoint[][] = [];
    let currentCable: PanelPoint[] = [];
    let currentCablePixels = 0;

    const isRowPattern = cfg.wiringPattern.startsWith('row');
    const unitSize = isRowPattern ? W : H;
    const safeUnitSize = Math.max(1, unitSize);

    // Group ordered panels into units (rows or columns)
    for (let i = 0; i < orderedPanels.length; i += safeUnitSize) {
        const unit = orderedPanels.slice(i, i + safeUnitSize);
        const unitPixels = unit.reduce((sum, p) => sum + p.pixels, 0);

        // Rule: "se estourar o limite de pixel terminar na coluna anterior"
        // If adding this WHOLE unit exceeds the limit, finalize current cable and start a new one.
        if (currentCablePixels + unitPixels > MAX_PIXELS_PER_PORT) {
            
            // If the current cable already has panels, close it.
            if (currentCable.length > 0) {
                cables.push(currentCable);
                currentCable = [];
                currentCablePixels = 0;
            }

            // Now, check if this unit alone is larger than the limit.
            // If it is, we are forced to split the unit panel by panel.
            if (unitPixels > MAX_PIXELS_PER_PORT) {
                for (const p of unit) {
                    if (currentCablePixels + p.pixels > MAX_PIXELS_PER_PORT && currentCable.length > 0) {
                        cables.push(currentCable);
                        currentCable = [];
                        currentCablePixels = 0;
                    }
                    currentCable.push(p);
                    currentCablePixels += p.pixels;
                }
            } else {
                // The unit fits in a fresh cable.
                currentCable = [...unit];
                currentCablePixels = unitPixels;
            }
        } else {
            // Unit fits entirely in current cable.
            currentCable.push(...unit);
            currentCablePixels += unitPixels;
        }
    }

    if (currentCable.length > 0) {
        cables.push(currentCable);
    }

    // Draw each cable path
    cables.forEach((cable, cableIndex) => {
        const color = cableColors[cableIndex % cableColors.length];
        
        // Draw main path line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(cable[0].x, cable[0].y);
        for (let i = 1; i < cable.length; i++) {
            ctx.lineTo(cable[i].x, cable[i].y);
        }
        ctx.stroke();

        // Draw markers for this specific cable
        for (let i = 0; i < cable.length; i++) {
            const p = cable[i];
            
            if (i === 0) {
                // Start - Triangle
                ctx.fillStyle = color;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - 10);
                ctx.lineTo(p.x - 10, p.y + 8);
                ctx.lineTo(p.x + 10, p.y + 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (i === cable.length - 1) {
                // End - Square
                ctx.fillStyle = '#bbb';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
                ctx.strokeRect(p.x - 8, p.y - 8, 16, 16);
            } else {
                // Node - Circle
                ctx.fillStyle = '#222';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // Arrow mid-way to next node
            if (i < cable.length - 1) {
                const next = cable[i+1];
                const midX = (p.x + next.x) / 2;
                const midY = (p.y + next.y) / 2;
                const angle = Math.atan2(next.y - p.y, next.x - p.x);
                
                ctx.save();
                ctx.translate(midX, midY);
                ctx.rotate(angle);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.lineTo(-6, -6);
                ctx.lineTo(-6, 6);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    });
  }

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
