import React, { useEffect, useRef } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.mapWidth * config.panelWidthPx;
    const height = config.mapHeight * config.panelHeightPx;

    if (width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    const rows = config.mapHeight;
    const cols = config.mapWidth;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pHeight = config.panelHeightPx;
        
        ctx.fillStyle = (r + c) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        if (config.showCoords) {
           const panelIndex = (r * cols) + (c + 1);
           const fontSize = Math.floor(Math.min(config.panelWidthPx, pHeight) * 0.3);
           ctx.font = `bold ${fontSize}px Inter`;
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
           ctx.fillRect(c * config.panelWidthPx + config.panelWidthPx/2 - fontSize*0.8, r * config.panelHeightPx + pHeight/2 - fontSize*0.6, fontSize*1.6, fontSize*1.2);
           ctx.fillStyle = 'white';
           ctx.fillText(`${panelIndex}`, c * config.panelWidthPx + config.panelWidthPx/2, r * config.panelHeightPx + pHeight/2);
        }
      }
    }

    if (config.showWiring) {
      drawWiring(ctx, config, width, height);
    }

    if (config.showScaleOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = Math.max(4, width / 400);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.4, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (config.showUserName && config.screenName) {
      const fontSize = Math.max(16, height / 20);
      ctx.font = `bold ${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = config.screenName;
      const metrics = ctx.measureText(text);
      const paddingX = fontSize * 1.5;
      const paddingY = fontSize * 0.8;
      const boxW = metrics.width + paddingX;
      const boxH = fontSize + paddingY;
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(centerX - boxW/2, centerY - boxH/2, boxW, boxH, 8);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.fillText(text, centerX, centerY);
    }

    if (config.showSpecs) {
      const totalPanels = config.mapWidth * config.mapHeight;
      const commonDivisor = calculateGcd(width, height);
      const aspectRatio = commonDivisor ? `${width / commonDivisor}:${height / commonDivisor}` : 'N/A';
      
      const fontSize = Math.max(12, height / 40);
      ctx.font = `${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const specsText = `Panel Count: ${config.mapWidth} wide x ${config.mapHeight} high • ${totalPanels} panels total • Resolution: ${width} x ${height} px • Aspect Ratio: ${aspectRatio}`;
      const metrics = ctx.measureText(specsText);
      const paddingX = fontSize * 2;
      const paddingY = fontSize * 1;
      const boxW = metrics.width + paddingX;
      const boxH = fontSize + paddingY;
      
      const centerX = width / 2;
      const centerY = height - boxH - 20;

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(centerX - boxW/2, centerY - boxH/2, boxW, boxH, boxH/2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = 'black';
      ctx.fillText(specsText, centerX, centerY);
    }

  }, [config, canvasRef]);

  function drawWiring(ctx: CanvasRenderingContext2D, cfg: ScreenConfig, width: number, height: number) {
    const MAX_PIXELS_PER_PORT = 655360;
    const cableColors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#9ca3af'];
    
    interface PanelPoint {
        x: number;
        y: number;
        pixels: number;
    }

    const W = cfg.mapWidth;
    const H = cfg.mapHeight;
    const pPx = cfg.panelWidthPx * cfg.panelHeightPx;

    const units: PanelPoint[][] = [];
    const isRowPattern = cfg.wiringPattern.startsWith('row');
    const primaryLimit = isRowPattern ? H : W;
    const secondaryLimit = isRowPattern ? W : H;

    for (let i = 0; i < primaryLimit; i++) {
        const unit: PanelPoint[] = [];
        for (let j = 0; j < secondaryLimit; j++) {
            let col = isRowPattern ? j : i;
            let row = isRowPattern ? i : j;

            let fCol = col, fRow = row;
            if (cfg.wiringStartCorner === 'TR') fCol = (W - 1) - col;
            if (cfg.wiringStartCorner === 'BL') fRow = (H - 1) - row;
            if (cfg.wiringStartCorner === 'BR') { fCol = (W - 1) - col; fRow = (H - 1) - row; }

            unit.push({
                x: fCol * cfg.panelWidthPx + cfg.panelWidthPx / 2,
                y: fRow * cfg.panelHeightPx + cfg.panelHeightPx / 2,
                pixels: pPx
            });
        }
        units.push(unit);
    }

    const cables: PanelPoint[][] = [];
    let currentCable: PanelPoint[] = [];
    let currentCablePixels = 0;

    units.forEach((unit) => {
        const unitPixels = unit.length * pPx;
        if (currentCablePixels + unitPixels > MAX_PIXELS_PER_PORT && currentCable.length > 0) {
            cables.push(currentCable);
            currentCable = [];
            currentCablePixels = 0;
        }
        const localIdx = currentCable.length / unit.length;
        const orderedUnit = (cfg.wiringPattern.includes('serpentine') && localIdx % 2 !== 0) ? [...unit].reverse() : [...unit];
        currentCable.push(...orderedUnit);
        currentCablePixels += unitPixels;
    });
    if (currentCable.length > 0) cables.push(currentCable);

    cables.forEach((cable, idx) => {
        const color = cableColors[idx % cableColors.length];
        const start = cable[0];

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < cable.length; i++) ctx.lineTo(cable[i].x, cable[i].y);
        ctx.stroke();

        cable.forEach((p, i) => {
            if (i === 0) {
                ctx.fillStyle = 'white'; ctx.strokeStyle = color; ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - 18); 
                ctx.lineTo(p.x - 18, p.y + 16); 
                ctx.lineTo(p.x + 18, p.y + 16);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.font = 'bold 18px Inter'; ctx.fillStyle = 'black'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(`${idx + 1}`, p.x, p.y + 4);
            } else if (i === cable.length - 1) {
                ctx.fillStyle = 'white'; ctx.strokeStyle = color; ctx.lineWidth = 3;
                ctx.fillRect(p.x - 12, p.y - 12, 24, 24); ctx.strokeRect(p.x - 12, p.y - 12, 24, 24);
                
                const prev = cable[i-1];
                if (prev) {
                    const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(angle);
                    ctx.fillStyle = color;
                    ctx.translate(-28, 0); 
                    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-15, -12); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fill();
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = 'white'; ctx.strokeStyle = color; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }

            if (i < cable.length - 1) {
                const next = cable[i+1];
                const angle = Math.atan2(next.y - p.y, next.x - p.x);
                ctx.save();
                ctx.translate((p.x + next.x) / 2, (p.y + next.y) / 2);
                ctx.rotate(angle);
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-12, -10); ctx.lineTo(-12, 10); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        });
    });
  }

  return (
    <div ref={containerRef} className="max-w-full max-h-full flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="max-w-full max-h-[80vh] shadow-2xl bg-black rounded border-2 border-zinc-800" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
};

export default Preview;