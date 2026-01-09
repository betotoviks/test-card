
import React, { useEffect, useRef } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef }) => {
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

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

        if (config.showCoords) {
          const id = (row * config.mapWidth) + (col + 1);
          const fontSize = Math.min(config.panelWidthPx, config.panelHeightPx) * 0.25;
          ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillText(id.toString(), x + config.panelWidthPx / 2, y + config.panelHeightPx / 2);
        }
      }
    }

    // 2. Logo Overlay (Centro)
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

    // 3. Sobreposição de Escala
    if (config.showScaleOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(1, totalW / 800);

      ctx.beginPath();
      ctx.moveTo(totalW / 2, 0); ctx.lineTo(totalW / 2, totalH);
      ctx.moveTo(0, totalH / 2); ctx.lineTo(totalW, totalH / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([5, 10]);
      ctx.moveTo(0, 0); ctx.lineTo(totalW, totalH);
      ctx.moveTo(totalW, 0); ctx.lineTo(0, totalH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Identificação (Tag)
    if (config.showUserName && config.screenName) {
      const fontSize = Math.max(20, totalH / 18);
      ctx.font = `black italic ${fontSize}px 'Inter', sans-serif`;
      
      const metrics = ctx.measureText(config.screenName);
      const paddingH = fontSize * 0.8;
      const paddingV = fontSize * 0.4;
      const boxW = metrics.width + paddingH * 2;
      const boxH = fontSize + paddingV * 2;
      
      const cx = totalW / 2;
      const cy = (config.logoUrl && logoImageRef.current) ? (totalH / 2 + (Math.min(totalW, totalH) * 0.15 + boxH)) : totalH / 2;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - boxW/2, cy - boxH/2, boxW, boxH, 8);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.screenName.toUpperCase(), cx, cy);
    }

    // 5. Specs Bar
    if (config.showSpecs) {
      const gcd = calculateGcd(totalW, totalH);
      const ratio = `${totalW / gcd}:${totalH / gcd}`;
      // Updated spec text: removed BETO GRID and changed GABINETES to PLACAS
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

      ctx.fillStyle = '#3b82f6'; // Azul Beto Grid
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
