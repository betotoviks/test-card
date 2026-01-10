
import React, { useEffect, useRef } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  updateConfig?: (newConfig: Partial<ScreenConfig>) => void;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef }) => {
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const getWiringPath = (cfg: ScreenConfig) => {
    const path = [];
    const W = cfg.mapWidth;
    const H = cfg.mapHeight;

    if (cfg.wiringPattern.startsWith('row')) {
      const isSerpentine = cfg.wiringPattern.includes('serpentine');
      const startY = cfg.wiringStartCorner.includes('B') ? H - 1 : 0;
      const endY = cfg.wiringStartCorner.includes('B') ? 0 : H - 1;
      const stepY = cfg.wiringStartCorner.includes('B') ? -1 : 1;

      let rowCount = 0;
      for (let y = startY; (stepY > 0 ? y <= endY : y >= endY); y += stepY) {
        const isReversed = isSerpentine && rowCount % 2 !== 0;
        const rowStartX = cfg.wiringStartCorner.includes('R') ? W - 1 : 0;
        const rowEndX = cfg.wiringStartCorner.includes('R') ? 0 : W - 1;
        const stepX = cfg.wiringStartCorner.includes('R') ? -1 : 1;

        const actualStartX = isReversed ? rowEndX : rowStartX;
        const actualEndX = isReversed ? rowStartX : rowEndX;
        const actualStepX = isReversed ? -stepX : stepX;

        for (let x = actualStartX; (actualStepX > 0 ? x <= actualEndX : x >= actualEndX); x += actualStepX) {
          path.push({ x, y });
        }
        rowCount++;
      }
    } else {
      const isSerpentine = cfg.wiringPattern.includes('serpentine');
      const startX = cfg.wiringStartCorner.includes('R') ? W - 1 : 0;
      const endX = cfg.wiringStartCorner.includes('R') ? 0 : W - 1;
      const stepX = cfg.wiringStartCorner.includes('R') ? -1 : 1;

      let colCount = 0;
      for (let x = startX; (stepX > 0 ? x <= endX : x >= endX); x += stepX) {
        const isReversed = isSerpentine && colCount % 2 !== 0;
        const colStartY = cfg.wiringStartCorner.includes('B') ? H - 1 : 0;
        const colEndY = cfg.wiringStartCorner.includes('B') ? 0 : H - 1;
        const stepY = cfg.wiringStartCorner.includes('B') ? -1 : 1;

        const actualStartY = isReversed ? colEndY : colStartY;
        const actualEndY = isReversed ? colStartY : colEndY;
        const actualStepY = isReversed ? -stepY : stepY;

        for (let y = actualStartY; (actualStepY > 0 ? y <= actualEndY : y >= actualEndY); y += actualStepY) {
          path.push({ x, y });
        }
        colCount++;
      }
    }
    return path;
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, size: number) => {
    const headlen = size;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead at midpoint or end? Let's do midpoint for flow
    const midX = fromX + dx * 0.6;
    const midY = fromY + dy * 0.6;
    
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 6), midY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(midX - headlen * Math.cos(angle + Math.PI / 6), midY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const getTagMetrics = (totalW: number, totalH: number, ctx: CanvasRenderingContext2D) => {
    const fontSize = Math.max(20, totalH / 18);
    ctx.font = `900 italic ${fontSize}px 'Inter', sans-serif`;
    const metrics = ctx.measureText(config.screenName || '');
    const paddingH = fontSize * 0.8;
    const paddingV = fontSize * 0.4;
    const boxW = metrics.width + paddingH * 2;
    const boxH = fontSize + paddingV * 2;
    
    const cx = totalW / 2;
    const cy = (config.logoUrl && logoImageRef.current) 
      ? (totalH / 2 + (Math.min(totalW, totalH) * 0.15 + boxH)) 
      : totalH / 2;
    
    return { cx, cy, boxW, boxH, fontSize };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalW = Math.max(10, config.mapWidth * config.panelWidthPx);
    const totalH = Math.max(10, config.mapHeight * config.panelHeightPx);

    canvas.width = totalW;
    canvas.height = totalH;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, totalW, totalH);

    // 1. Grid
    for (let row = 0; row < config.mapHeight; row++) {
      for (let col = 0; col < config.mapWidth; col++) {
        const x = col * config.panelWidthPx;
        const y = row * config.panelHeightPx;

        ctx.fillStyle = (row + col) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(x, y, config.panelWidthPx, config.panelHeightPx);

        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, config.panelWidthPx, config.panelHeightPx);
      }
    }

    // Wiring and IDs
    const path = getWiringPath(config);
    const pixelsPerPanel = config.panelWidthPx * config.panelHeightPx;
    const portColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];
    
    let currentPixels = 0;
    let portIndex = 0;

    // Draw IDs based on wiring path if enabled
    if (config.showCoords) {
      path.forEach((p, i) => {
        const x = p.x * config.panelWidthPx;
        const y = p.y * config.panelHeightPx;
        const fontSize = Math.min(config.panelWidthPx, config.panelHeightPx) * 0.25;
        ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillText((i + 1).toString(), x + config.panelWidthPx / 2, y + config.panelHeightPx / 2);
      });
    }

    // 2. Wiring Flow
    if (config.showWiring) {
      currentPixels = 0;
      portIndex = 0;
      const lineWidth = Math.max(2, config.panelWidthPx / 40);
      const dotRadius = Math.max(3, config.panelWidthPx / 20);

      path.forEach((p, i) => {
        const next = path[i + 1];
        
        // Determine port color
        if (currentPixels + pixelsPerPanel > config.pixelsPerPort) {
          portIndex = (portIndex + 1) % portColors.length;
          currentPixels = 0;
        }
        currentPixels += pixelsPerPanel;

        const centerX = p.x * config.panelWidthPx + config.panelWidthPx / 2;
        const centerY = p.y * config.panelHeightPx + config.panelHeightPx / 2;
        
        ctx.strokeStyle = portColors[portIndex];
        ctx.fillStyle = portColors[portIndex];
        ctx.lineWidth = lineWidth;

        // Draw dot at panel center
        ctx.beginPath();
        ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Start/End Port Indicators
        if (currentPixels === pixelsPerPanel) {
           // Start of port: Triangle
           ctx.save();
           ctx.translate(centerX, centerY);
           const tSize = dotRadius * 1.8;
           ctx.beginPath();
           ctx.moveTo(0, -tSize);
           ctx.lineTo(tSize, tSize);
           ctx.lineTo(-tSize, tSize);
           ctx.closePath();
           ctx.stroke();
           ctx.restore();
        }

        if (next) {
          const nextCenterX = next.x * config.panelWidthPx + config.panelWidthPx / 2;
          const nextCenterY = next.y * config.panelHeightPx + config.panelHeightPx / 2;
          
          // Check if next panel belongs to same port
          if (currentPixels + pixelsPerPanel <= config.pixelsPerPort) {
            drawArrow(ctx, centerX, centerY, nextCenterX, nextCenterY, dotRadius * 1.5);
          } else {
            // Port End: Square
            ctx.strokeRect(centerX - dotRadius * 1.5, centerY - dotRadius * 1.5, dotRadius * 3, dotRadius * 3);
          }
        } else {
          // Final Panel: Square
          ctx.strokeRect(centerX - dotRadius * 1.5, centerY - dotRadius * 1.5, dotRadius * 3, dotRadius * 3);
        }
      });
    }

    // 3. Logo Overlay (Centro)
    if (config.logoUrl && logoImageRef.current) {
      const img = logoImageRef.current;
      const logoSize = Math.min(totalW, totalH) * 0.25;
      const aspect = img.width / img.height;
      let drawW = logoSize;
      let drawH = logoSize / aspect;
      
      if (drawH > logoSize) {
        drawH = logoSize;
        drawW = logoSize * aspect;
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 40;
      ctx.drawImage(img, totalW / 2 - drawW / 2, totalH / 2 - drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 4. Sobreposição de Escala
    if (config.showScaleOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(1, totalW / 800);

      // Linhas centrais
      ctx.beginPath();
      ctx.moveTo(totalW / 2, 0); ctx.lineTo(totalW / 2, totalH);
      ctx.moveTo(0, totalH / 2); ctx.lineTo(totalW, totalH / 2);
      ctx.stroke();

      // Diagonais e Círculo (tracejadas)
      ctx.beginPath();
      ctx.setLineDash([5, 10]);
      
      // Diagonais
      ctx.moveTo(0, 0); ctx.lineTo(totalW, totalH);
      ctx.moveTo(totalW, 0); ctx.lineTo(0, totalH);
      
      // Círculo central
      const radius = Math.min(totalW, totalH) * 0.45;
      ctx.moveTo(totalW / 2 + radius, totalH / 2);
      ctx.arc(totalW / 2, totalH / 2, radius, 0, Math.PI * 2);
      
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Identificação (Tag)
    if (config.showUserName && config.screenName) {
      const { cx, cy, boxW, boxH, fontSize } = getTagMetrics(totalW, totalH, ctx);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 8);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 italic ${fontSize}px 'Inter', sans-serif`;
      ctx.fillText(config.screenName.toUpperCase(), cx, cy);
    }

    // 6. Specs Bar
    if (config.showSpecs) {
      const gcd = calculateGcd(totalW, totalH);
      const ratio = `${totalW / gcd}:${totalH / gcd}`;
      const specText = `${totalW}x${totalH} PX | ASPECT ${ratio} | ${config.mapWidth * config.mapHeight} PLACAS`;
      
      const fontSize = Math.max(12, totalH / 30);
      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      
      const metrics = ctx.measureText(specText);
      const barH = fontSize * 2.2;
      const barY = totalH - barH - (totalH * 0.04);

      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.beginPath();
      const barW = metrics.width + 60;
      ctx.roundRect(totalW/2 - barW/2, barY, barW, barH, 6);
      ctx.fill();

      ctx.fillStyle = '#3b82f6'; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(specText, totalW / 2, barY + barH/2);
    }
  };

  useEffect(() => {
    if (config.logoUrl) {
      const img = new Image();
      img.src = config.logoUrl;
      img.onload = () => {
        logoImageRef.current = img;
        draw();
      };
    } else {
      logoImageRef.current = null;
      draw();
    }
  }, [config]);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-4 overflow-auto">
      <canvas 
        ref={canvasRef} 
        className="shadow-[0_40px_100px_rgba(0,0,0,0.9)] bg-black border border-zinc-800"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default Preview;
