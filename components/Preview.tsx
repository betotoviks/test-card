
import React, { useEffect } from 'react';
import { ScreenConfig } from '../types';

interface PreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Preview: React.FC<PreviewProps> = ({ config, canvasRef }) => {
  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões reais do painel baseado no mapa
    const totalW = Math.max(10, config.mapWidth * config.panelWidthPx);
    const totalH = Math.max(10, config.mapHeight * config.panelHeightPx);

    // Ajustar o tamanho interno do canvas
    canvas.width = totalW;
    canvas.height = totalH;

    // 1. Limpar fundo
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, totalW, totalH);

    // 2. Desenhar Grid de Painéis (Checkerboard)
    for (let row = 0; row < config.mapHeight; row++) {
      for (let col = 0; col < config.mapWidth; col++) {
        const x = col * config.panelWidthPx;
        const y = row * config.panelHeightPx;

        // Cor alternada
        ctx.fillStyle = (row + col) % 2 === 0 ? config.color1 : config.color2;
        ctx.fillRect(x, y, config.panelWidthPx, config.panelHeightPx);

        // Borda do Gabinete
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, config.panelWidthPx, config.panelHeightPx);

        // Coordenadas (ID)
        if (config.showCoords) {
          const id = (row * config.mapWidth) + (col + 1);
          const fontSize = Math.min(config.panelWidthPx, config.panelHeightPx) * 0.3;
          ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillText(id.toString(), x + config.panelWidthPx / 2, y + config.panelHeightPx / 2);
        }
      }
    }

    // 3. Sobreposição de Escala e Mira
    if (config.showScaleOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = Math.max(2, totalW / 500);

      // Linhas Cruzadas (Centro)
      ctx.beginPath();
      ctx.moveTo(totalW / 2, 0); ctx.lineTo(totalW / 2, totalH);
      ctx.moveTo(0, totalH / 2); ctx.lineTo(totalW, totalH / 2);
      ctx.stroke();

      // X de ponta a ponta
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(0, 0); ctx.lineTo(totalW, totalH);
      ctx.moveTo(totalW, 0); ctx.lineTo(0, totalH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Círculo central
      ctx.beginPath();
      ctx.arc(totalW / 2, totalH / 2, Math.min(totalW, totalH) * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Nome da Tela Centralizado
    if (config.showUserName && config.screenName) {
      const fontSize = Math.max(30, totalH / 12);
      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      
      const metrics = ctx.measureText(config.screenName);
      const padding = fontSize * 0.6;
      const boxW = metrics.width + padding * 2;
      const boxH = fontSize + padding;
      
      const cx = totalW / 2;
      const cy = totalH / 2;

      // Sombra/Caixa do texto
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - boxW/2, cy - boxH/2, boxW, boxH, fontSize/4);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.screenName.toUpperCase(), cx, cy + 5);
    }

    // 5. Barra de Especificações (Specs)
    if (config.showSpecs) {
      const gcd = calculateGcd(totalW, totalH);
      const ratio = `${totalW / gcd}:${totalH / gcd}`;
      const specText = `${totalW} x ${totalH} PX | ASPECT ${ratio} | ${config.mapWidth * config.mapHeight} GABINETES`;
      
      const fontSize = Math.max(14, totalH / 25);
      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      
      const metrics = ctx.measureText(specText);
      const barH = fontSize * 2;
      const barY = totalH - barH - (totalH * 0.05);

      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      const barW = metrics.width + 60;
      ctx.roundRect(totalW/2 - barW/2, barY, barW, barH, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(specText, totalW / 2, barY + barH/2);
    }
  };

  useEffect(() => {
    // Pequeno timeout para garantir que fontes ou recursos estejam prontos se necessário
    const timer = setTimeout(draw, 50);
    return () => clearTimeout(timer);
  }, [config]);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-4 overflow-auto">
      <canvas 
        ref={canvasRef} 
        className="shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-zinc-900 border border-zinc-800"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default Preview;
