
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

    if (width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    const rows = config.mapHeight;
    const cols = config.mapWidth;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isHalfRow = config.halfHeightRow && r === rows - 1;
        const pHeight = isHalfRow ? config.panelHeightPx / 2 : config.panelHeightPx;
        
        ctx.fillStyle = (r + c) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * config.panelWidthPx, r * config.panelHeightPx, config.panelWidthPx, pHeight);

        if (config.showCoords) {
           const panelIndex = (r * cols) + (c + 1);
           // Tamanho dinâmico baseado no tamanho do painel, mas maior que antes
           const fontSize = Math.floor(Math.min(config.panelWidthPx, pHeight) * 0.35);
           ctx.font = `bold ${fontSize}px Inter`;
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           
           const text = `${panelIndex}`;
           const metrics = ctx.measureText(text);
           const padding = fontSize * 0.4;
           const bgW = metrics.width + padding;
           const bgH = fontSize + padding * 0.5;
           
           // Desenhar fundo destacado
           ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
           roundRect(
             ctx, 
             c * config.panelWidthPx + config.panelWidthPx/2 - bgW/2, 
             r * config.panelHeightPx + pHeight/2 - bgH/2, 
             bgW, 
             bgH, 
             4, 
             true, 
             false
           );
           
           ctx.fillStyle = 'white';
           ctx.fillText(text, c * config.panelWidthPx + config.panelWidthPx/2, r * config.panelHeightPx + pHeight/2);
        }
      }
    }

    if (config.showWiring) {
      drawWiring(ctx, config, width, height);
    }

    if (config.showScaleOverlay) {
      ctx.beginPath();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.45;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

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
    const cableColors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#9ca3af'];
    
    interface PanelPoint {
        x: number;
        y: number;
        pixels: number;
        col: number;
        row: number;
    }

    const orderedPanels: PanelPoint[] = [];
    const W = cfg.mapWidth;
    const H = cfg.mapHeight;

    if (W <= 0 || H <= 0) return;

    // First generate the sequence of panels based on pattern
    for (let i = 0; i < W * H; i++) {
        let col = 0, row = 0;
        if (cfg.wiringPattern.startsWith('row')) {
            row = Math.floor(i / W);
            col = i % W;
            if (cfg.wiringPattern === 'row-serpentine' && row % 2 !== 0) col = (W - 1) - col;
        } else {
            col = Math.floor(i / H);
            row = i % H;
            if (cfg.wiringPattern === 'col-serpentine' && col % 2 !== 0) row = (H - 1) - row;
        }

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
            pixels: pPixels,
            col: finalCol,
            row: finalRow
        });
    }

    // Now group them into cables respecting boundaries (columns or rows)
    const unitSize = cfg.wiringPattern.startsWith('col') ? H : W;
    const cables: PanelPoint[][] = [];
    let currentCable: PanelPoint[] = [];
    let currentCablePixels = 0;

    for (let i = 0; i < orderedPanels.length; i += unitSize) {
        const unit = orderedPanels.slice(i, i + unitSize);
        const unitPixels = unit.reduce((sum, p) => sum + p.pixels, 0);

        // If this unit (whole col/row) fits in current cable
        if (currentCablePixels + unitPixels <= MAX_PIXELS_PER_PORT) {
            currentCable.push(...unit);
            currentCablePixels += unitPixels;
        } else {
            // It doesn't fit. Finish current cable if not empty.
            if (currentCable.length > 0) {
                cables.push(currentCable);
                currentCable = [];
                currentCablePixels = 0;
            }
            
            // Try to fit the unit into a new cable
            if (unitPixels <= MAX_PIXELS_PER_PORT) {
                currentCable.push(...unit);
                currentCablePixels = unitPixels;
            } else {
                // The unit is physically larger than one port budget.
                // We MUST split this unit at panel level.
                for (const p of unit) {
                    if (currentCablePixels + p.pixels > MAX_PIXELS_PER_PORT) {
                        if (currentCable.length > 0) cables.push(currentCable);
                        currentCable = [p];
                        currentCablePixels = p.pixels;
                    } else {
                        currentCable.push(p);
                        currentCablePixels += p.pixels;
                    }
                }
            }
        }
    }
    if (currentCable.length > 0) cables.push(currentCable);

    cables.forEach((cable, cableIndex) => {
        const color = cableColors[cableIndex % cableColors.length];
        
        // Draw the main path line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(cable[0].x, cable[0].y);
        for (let i = 1; i < cable.length; i++) ctx.lineTo(cable[i].x, cable[i].y);
        ctx.stroke();

        // Draw symbols and markers
        for (let i = 0; i < cable.length; i++) {
            const p = cable[i];
            
            // Draw node marker
            if (i === 0) {
                // Início da linha (Porta) - Triângulo
                ctx.fillStyle = 'white';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - 14);
                ctx.lineTo(p.x - 14, p.y + 12);
                ctx.lineTo(p.x + 14, p.y + 12);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (i === cable.length - 1) {
                // Fim da linha - Quadrado
                ctx.fillStyle = 'white';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.fillRect(p.x - 11, p.y - 11, 22, 22);
                ctx.strokeRect(p.x - 11, p.y - 11, 22, 22);
            } else {
                // Pontos intermediários - Círculo
                ctx.fillStyle = 'white';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // Draw directional arrow on the line segment
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
                ctx.moveTo(14, 0);
                ctx.lineTo(-10, -10);
                ctx.lineTo(-10, 10);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    });
  }

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
    const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;
    const commonDivisor = calculateGcd(numerator, denominator);
    return [numerator / commonDivisor, denominator / commonDivisor];
  }

  const isInvalidSize = (config.mapWidth <= 0 || config.mapHeight <= 0);

  return (
    <div ref={containerRef} className="max-w-full max-h-full flex items-center justify-center p-4">
      {!isInvalidSize ? (
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-[80vh] shadow-2xl bg-black rounded-sm border-4 border-white/10"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="text-zinc-400 font-medium italic">Defina as dimensões do mapa para visualizar</div>
      )}
    </div>
  );
};

export default Preview;
