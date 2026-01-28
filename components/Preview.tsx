
import React, { useEffect } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  logoImg: HTMLImageElement | null;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef, logoImg }) => {
  
  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const getWiringPath = (cfg: ScreenConfig) => {
    const path: any[] = [];
    const W = cfg.mapWidth;
    const H = cfg.mapHeight;
    const pixelsPerPanel = cfg.panelWidthPx * cfg.panelHeightPx;
    const isSerpentine = cfg.wiringPattern.includes('serpentine');
    const isVertical = cfg.wiringPattern.startsWith('col');

    let currentPortPixels = 0;
    let portStripCount = 0;

    if (isVertical) {
      const startX = cfg.wiringStartCorner.includes('R') ? W - 1 : 0;
      const endX = cfg.wiringStartCorner.includes('R') ? 0 : W - 1;
      const stepX = cfg.wiringStartCorner.includes('R') ? -1 : 1;
      for (let x = startX; (stepX > 0 ? x <= endX : x >= endX); x += stepX) {
        const stripPixels = H * pixelsPerPanel;
        if (currentPortPixels > 0 && currentPortPixels + stripPixels > cfg.pixelsPerPort) {
          currentPortPixels = 0;
          portStripCount = 0;
        }
        const isReversed = isSerpentine && portStripCount % 2 !== 0;
        const colStartY = cfg.wiringStartCorner.includes('B') ? H - 1 : 0;
        const colEndY = cfg.wiringStartCorner.includes('B') ? 0 : H - 1;
        const stepY = cfg.wiringStartCorner.includes('B') ? -1 : 1;
        const actualStartY = isReversed ? colEndY : colStartY;
        const actualEndY = isReversed ? colStartY : colEndY;
        const actualStepY = isReversed ? -stepY : stepY;
        for (let y = actualStartY; (actualStepY > 0 ? y <= actualEndY : y >= actualEndY); y += actualStepY) {
          path.push({ x, y, stripId: x });
        }
        currentPortPixels += stripPixels;
        portStripCount++;
      }
    } else {
      const startY = cfg.wiringStartCorner.includes('B') ? H - 1 : 0;
      const endY = cfg.wiringStartCorner.includes('B') ? 0 : H - 1;
      const stepY = cfg.wiringStartCorner.includes('B') ? -1 : 1;
      for (let y = startY; (stepY > 0 ? y <= endY : y >= endY); y += stepY) {
        const stripPixels = W * pixelsPerPanel;
        if (currentPortPixels > 0 && currentPortPixels + stripPixels > cfg.pixelsPerPort) {
          currentPortPixels = 0;
          portStripCount = 0;
        }
        const isReversed = isSerpentine && portStripCount % 2 !== 0;
        const rowStartX = cfg.wiringStartCorner.includes('R') ? W - 1 : 0;
        const rowEndX = cfg.wiringStartCorner.includes('R') ? 0 : W - 1;
        const stepX = cfg.wiringStartCorner.includes('R') ? -1 : 1;
        const actualStartX = isReversed ? rowEndX : rowStartX;
        const actualEndX = isReversed ? rowStartX : rowEndX;
        const actualStepX = isReversed ? -stepX : stepX;
        for (let x = actualStartX; (actualStepX > 0 ? x <= actualEndX : x >= actualEndX); x += actualStepX) {
          path.push({ x, y, stripId: y });
        }
        currentPortPixels += stripPixels;
        portStripCount++;
      }
    }
    return path;
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, size: number) => {
    const headlen = size * 1.5;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    const midX = fromX + dx * 0.5;
    const midY = fromY + dy * 0.5;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 5), midY - headlen * Math.sin(angle - Math.PI / 5));
    ctx.lineTo(midX - headlen * Math.cos(angle + Math.PI / 5), midY - headlen * Math.sin(angle + Math.PI / 5));
    ctx.closePath();
    ctx.fill();
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

    for (let row = 0; row < config.mapHeight; row++) {
      for (let col = 0; col < config.mapWidth; col++) {
        const x = col * config.panelWidthPx;
        const y = row * config.panelHeightPx;
        ctx.fillStyle = (row + col) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(x, y, config.panelWidthPx, config.panelHeightPx);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, config.panelWidthPx, config.panelHeightPx);
      }
    }

    if (config.showCoords) {
      const path = getWiringPath(config);
      path.forEach((p, i) => {
        const x = p.x * config.panelWidthPx;
        const y = p.y * config.panelHeightPx;
        const fontSize = Math.min(config.panelWidthPx, config.panelHeightPx) * 0.45;
        ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText((i + 1).toString(), x + config.panelWidthPx / 2, y + config.panelHeightPx / 2);
      });
    }

    if (config.showWiring) {
      const path = getWiringPath(config);
      const pixelsPerPanel = config.panelWidthPx * config.panelHeightPx;
      const portColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#fbbf24', '#059669'];
      const portAssignments: number[] = [];
      let currentPortIndex = 0;
      let currentPortPixels = 0;
      
      const strips: any[][] = [];
      let currentStripId = -1;
      path.forEach(p => {
        if (p.stripId !== currentStripId) {
          strips.push([]);
          currentStripId = p.stripId;
        }
        strips[strips.length - 1].push(p);
      });

      strips.forEach(strip => {
        const stripPixels = strip.length * pixelsPerPanel;
        if (currentPortPixels > 0 && currentPortPixels + stripPixels > config.pixelsPerPort) {
          currentPortIndex++;
          currentPortPixels = 0;
        }
        strip.forEach(() => portAssignments.push(currentPortIndex));
        currentPortPixels += stripPixels;
      });

      const lineWidth = Math.max(3, config.panelWidthPx / 30);
      const dotRadius = Math.max(4, config.panelWidthPx / 20);
      path.forEach((p, i) => {
        const next = path[i + 1];
        const portIdx = portAssignments[i];
        const color = portColors[portIdx % portColors.length];
        const centerX = p.x * config.panelWidthPx + config.panelWidthPx / 2;
        const centerY = p.y * config.panelHeightPx + config.panelHeightPx / 2;
        
        ctx.strokeStyle = color; 
        ctx.fillStyle = color; 
        ctx.lineWidth = lineWidth;
        
        if (next && portAssignments[i+1] === portIdx) {
          const nextCenterX = next.x * config.panelWidthPx + config.panelWidthPx / 2;
          const nextCenterY = next.y * config.panelHeightPx + config.panelHeightPx / 2;
          drawArrow(ctx, centerX, centerY, nextCenterX, nextCenterY, dotRadius * 1.8);
        }
        
        const isPortStart = i === 0 || portAssignments[i-1] !== portIdx;
        const isPortEnd = i === path.length - 1 || portAssignments[i+1] !== portIdx;
        
        if (isPortStart) {
          ctx.save();
          const tSize = dotRadius * 2.5;
          const angle = next ? Math.atan2(next.y - p.y, next.x - p.x) : 0;
          ctx.translate(centerX, centerY); 
          ctx.rotate(angle);
          ctx.beginPath(); 
          ctx.moveTo(tSize, 0); ctx.lineTo(-tSize * 0.8, tSize * 0.8); ctx.lineTo(-tSize * 0.8, -tSize * 0.8); 
          ctx.closePath(); ctx.fill();
          ctx.restore();
        } else if (isPortEnd) {
          const sSize = dotRadius * 2.8; 
          ctx.fillRect(centerX - sSize/2, centerY - sSize/2, sSize, sSize);
        } else {
          ctx.beginPath(); ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2); ctx.fill();
        }
      });
    }

    if (logoImg) {
      const img = logoImg;
      const logoSize = Math.min(totalW, totalH) * 0.25;
      const aspect = img.width / img.height;
      let drawW = logoSize; let drawH = logoSize / aspect;
      if (drawH > logoSize) { drawH = logoSize; drawW = logoSize * aspect; }
      ctx.save(); 
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50;
      ctx.drawImage(img, totalW / 2 - drawW / 2, totalH / 2 - drawH / 2, drawW, drawH);
      ctx.restore();
    }

    if (config.showScaleOverlay) {
      ctx.strokeStyle = '#ffffff'; 
      ctx.lineWidth = Math.max(3, totalW / 300);
      const dashSize = Math.max(10, totalW / 100);
      ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(totalW / 2, 0); ctx.lineTo(totalW / 2, totalH); ctx.moveTo(0, totalH / 2); ctx.lineTo(totalW, totalH / 2); ctx.stroke();
      ctx.setLineDash([dashSize / 2, dashSize]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(totalW, totalH); ctx.moveTo(totalW, 0); ctx.lineTo(0, totalH);
      const radius = Math.min(totalW, totalH) * 0.45; ctx.moveTo(totalW / 2 + radius, totalH / 2); ctx.arc(totalW / 2, totalH / 2, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (config.showUserName && config.screenName) {
      const fontSize = Math.max(20, totalH / 18);
      ctx.font = `900 italic ${fontSize}px 'Inter', sans-serif`;
      const metrics = ctx.measureText(config.screenName);
      const paddingH = fontSize * 0.8;
      const paddingV = fontSize * 0.4;
      const boxW = metrics.width + paddingH * 2;
      const boxH = fontSize + paddingV * 2;
      const cx = totalW / 2;
      const cy = totalH / 2 + (logoImg ? (Math.min(totalW, totalH) * 0.15 + boxH) : 0);
      
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 20; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 8); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(config.screenName.toUpperCase(), cx, cy);
    }

    if (config.showSpecs) {
      const gcd = calculateGcd(totalW, totalH);
      const specText = `${totalW}×${totalH} PX | ASPECT ${totalW/gcd}:${totalH/gcd} | ${config.mapWidth * config.mapHeight} PLACAS`;
      const fontSize = Math.max(13, totalH / 32);
      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      const metrics = ctx.measureText(specText);
      const barH = fontSize * 2.3; const barY = totalH - barH - (totalH * 0.05); const barW = metrics.width + 60;
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.beginPath(); ctx.roundRect(totalW/2 - barW/2, barY, barW, barH, 8); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(specText, totalW / 2, barY + barH/2);
    }
  };

  useEffect(() => {
    draw();
  }, [config, logoImg]);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-4 overflow-auto">
      <canvas 
        ref={canvasRef} 
        className="shadow-[0_40px_100px_rgba(0,0,0,0.95)] bg-black border border-zinc-800"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default Preview;
