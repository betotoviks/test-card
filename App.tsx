
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ScreenConfig, TabType } from './types';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import TechSheetPreview from './components/TechSheetPreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.TAMANHO);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [config, setConfig] = useState<ScreenConfig>({
    mapWidth: 6,
    mapHeight: 2,
    panelWidthPx: 168,
    panelHeightPx: 336,
    panelWidthMm: 500,
    panelHeightMm: 1000,
    panelType: 'P3.91',
    screenName: 'TELA',
    logoUrl: null,
    techSheetTitle: 'MAPEAMENTO DE PIXEL',
    techSheetStatsTitle: 'LED',
    softwareVideo: 'RESOLUME',
    fileFormat: 'QUICKTIME.MOV',
    videoCodec: 'DXV3',
    videoFps: '30 F',
    logoPosX: 950,
    logoPosY: 40,
    logoScale: 1.0,
    showScaleOverlay: true,
    showUserName: false,
    showSpecs: false,
    showCoords: false,
    showMiniMap: true,
    color1: '#7c2d12',
    color2: '#fb923c',
    showBackground: false,
    showWiring: false,
    wiringPattern: 'col-serpentine',
    wiringStartCorner: 'TL',
    panelWatts: 250,
    voltage: 220,
    panelWeightKg: 8.5,
    pixelsPerPort: 655360,
    targetWidthM: 3.0,
    targetHeightM: 2.0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateConfig = (newConfig: Partial<ScreenConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.logoUrl !== undefined) {
        if (newConfig.logoUrl === null) {
          setLogoImg(null);
        } else {
          const img = new Image();
          img.src = newConfig.logoUrl;
          img.onload = () => {
            setLogoImg(img);
          };
        }
      }
      return updated;
    });
  };

  const drawPKBrandLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    const boxSize = size * 0.6;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(x, y, boxSize, boxSize, 4);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.6;
    const centerX = x + 10;
    const centerY = y + boxSize - 10;
    
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const angle = (i * Math.PI / 10) - (Math.PI / 4);
        ctx.lineTo(centerX + Math.cos(angle) * boxSize * 0.8, centerY + Math.sin(angle) * boxSize * 0.8);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#000000';
    ctx.font = `900 ${size * 0.8}px 'Inter', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('PK', x + boxSize + 12, y - 4);

    ctx.font = `900 ${size * 0.3}px 'Inter', sans-serif`;
    ctx.letterSpacing = "2.5px";
    ctx.fillText('LIGHTING', x + boxSize + 13, y + (size * 0.58));
    ctx.restore();
    ctx.letterSpacing = "0px";
  };

  const renderTechSheet = useCallback((ctx: CanvasRenderingContext2D, cfg: ScreenConfig) => {
    const W = 1280;
    const H = 720;
    const totalPanels = cfg.mapWidth * cfg.mapHeight;
    const totalWidthPx = cfg.mapWidth * cfg.panelWidthPx;
    const totalHeightPx = cfg.mapHeight * cfg.panelHeightPx;
    const totalPixels = totalWidthPx * totalHeightPx;
    const widthM = (cfg.mapWidth * cfg.panelWidthMm / 1000).toFixed(2);
    const heightM = (cfg.mapHeight * cfg.panelHeightMm / 1000).toFixed(2);
    const areaM2 = (cfg.mapWidth * cfg.panelWidthMm / 1000) * (cfg.mapHeight * cfg.panelHeightMm / 1000);
    const totalWatts = totalPanels * cfg.panelWatts;
    const totalAmps = cfg.voltage > 0 ? (totalWatts / cfg.voltage).toFixed(2) : '0';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = "900 42px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(cfg.techSheetTitle, W / 2, 85);
    drawPKBrandLogo(ctx, W - 280, 50, 55);

    if (logoImg) {
      const img = logoImg;
      const aspect = img.width / img.height;
      const baseHeight = 80;
      const baseWidth = baseHeight * aspect;
      const drawW = baseWidth * cfg.logoScale;
      const drawH = baseHeight * cfg.logoScale;
      ctx.save();
      ctx.drawImage(img, cfg.logoPosX, cfg.logoPosY, drawW, drawH);
      ctx.restore();
    }

    const gridAreaX = 120;
    const gridAreaY = 240;
    const gridAreaMaxW = 500;
    const gridAreaMaxH = 340;

    ctx.fillStyle = '#ea580c';
    ctx.font = "900 32px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(cfg.techSheetStatsTitle, gridAreaX + gridAreaMaxW / 2, gridAreaY - 50);
    
    ctx.fillStyle = '#ea580c';
    ctx.font = "900 32px 'Inter', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(cfg.techSheetStatsTitle, 800, gridAreaY - 50);

    const totalGridWidth = cfg.mapWidth * cfg.panelWidthPx;
    const totalGridHeight = cfg.mapHeight * cfg.panelHeightPx;
    const aspect = (totalGridWidth > 0 && totalGridHeight > 0) ? totalGridWidth / totalGridHeight : 1;
    
    let gridW = gridAreaMaxW;
    let gridH = gridAreaMaxW / aspect;
    if (gridH > gridAreaMaxH) {
      gridH = gridAreaMaxH;
      gridW = gridAreaMaxH * aspect;
    }

    const gridX = gridAreaX + (gridAreaMaxW - gridW) / 2;
    const gridY = gridAreaY + (gridAreaMaxH - gridH) / 2;
    const cellW = cfg.mapWidth > 0 ? gridW / cfg.mapWidth : 0;
    const cellH = cfg.mapHeight > 0 ? gridH / cfg.mapHeight : 0;

    if (cfg.mapWidth > 0 && cfg.mapHeight > 0) {
      for (let r = 0; r < cfg.mapHeight; r++) {
        for (let c = 0; c < cfg.mapWidth; c++) {
          const cellX = gridX + c * cellW;
          const cellY = gridY + r * cellH;
          ctx.fillStyle = (r + c) % 2 === 0 ? cfg.color1 : cfg.color2;
          ctx.fillRect(cellX, cellY, cellW, cellH);
          if (cfg.showCoords) {
            const panelNum = r * cfg.mapWidth + c + 1;
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            const fontSize = Math.min(cellW, cellH) * 0.35;
            ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(panelNum.toString(), cellX + cellW / 2, cellY + cellH / 2);
          }
        }
      }

      if (cfg.showScaleOverlay) {
          ctx.save();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gridX + gridW/2, gridY); ctx.lineTo(gridX + gridW/2, gridY + gridH);
          ctx.moveTo(gridX, gridY + gridH/2); ctx.lineTo(gridX + gridW, gridY + gridH/2);
          ctx.stroke();
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(gridX, gridY); ctx.lineTo(gridX + gridW, gridY + gridH);
          ctx.moveTo(gridX + gridW, gridY); ctx.lineTo(gridX, gridY + gridH);
          ctx.stroke();
          const radius = Math.min(gridW, gridH) * 0.4;
          ctx.beginPath();
          ctx.arc(gridX + gridW/2, gridY + gridH/2, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
      }

      if (cfg.showUserName && cfg.screenName) {
        const fontSize = Math.max(14, gridH / 12);
        ctx.font = `900 italic ${fontSize}px 'Inter', sans-serif`;
        const text = cfg.screenName.toUpperCase();
        const metrics = ctx.measureText(text);
        const padding = fontSize * 0.6;
        const boxW = metrics.width + padding * 2;
        const boxH = fontSize + padding * 0.8;
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(gridX + gridW/2 - boxW/2, gridY + gridH/2 - boxH/2, boxW, boxH, 4);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, gridX + gridW/2, gridY + gridH/2);
      }

      if (cfg.showSpecs) {
        const specText = `${totalWidthPx}×${totalHeightPx} PX | ${cfg.mapWidth * cfg.mapHeight} PLACAS`;
        const fontSize = Math.max(10, gridH / 25);
        ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
        const metrics = ctx.measureText(specText);
        const barW = metrics.width + 20;
        const barH = fontSize * 1.8;
        const barY = gridY + gridH - barH - 10;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(gridX + gridW/2 - barW/2, barY, barW, barH, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(specText, gridX + gridW/2, barY + barH/2);
      }
    }

    if (cfg.mapWidth > 0 && cfg.mapHeight > 0) {
      const dimColor = '#ea580c';
      ctx.strokeStyle = dimColor;
      ctx.lineWidth = 2;
      const hDimY = gridY + gridH + 35;
      ctx.beginPath();
      ctx.moveTo(gridX, hDimY); ctx.lineTo(gridX + gridW, hDimY);
      ctx.moveTo(gridX, hDimY - 10); ctx.lineTo(gridX, hDimY + 10);
      ctx.moveTo(gridX + gridW, hDimY - 10); ctx.lineTo(gridX + gridW, hDimY + 10);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = "900 24px 'Inter', sans-serif";
      ctx.fillText(`${totalWidthPx}px`, gridX + gridW/2, hDimY - 10);
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${widthM}mt`, gridX + gridW/2, hDimY + 25);
      const vDimX = gridX - 35;
      ctx.beginPath();
      ctx.moveTo(vDimX, gridY); ctx.lineTo(vDimX, gridY + gridH);
      ctx.moveTo(vDimX - 10, gridY); ctx.lineTo(vDimX + 10, gridY);
      ctx.moveTo(vDimX - 10, gridY + gridH); ctx.lineTo(vDimX + 10, gridY + gridH);
      ctx.stroke();
      ctx.save();
      ctx.translate(vDimX, gridY + gridH/2); ctx.rotate(-Math.PI/2);
      ctx.textAlign = 'center'; ctx.fillStyle = '#000000';
      ctx.font = "900 24px 'Inter', sans-serif"; ctx.fillText(`${totalHeightPx}px`, 0, -10);
      ctx.font = "bold 18px 'Inter', sans-serif"; ctx.fillStyle = '#64748b';
      ctx.fillText(`${heightM}mt`, 0, 25);
      ctx.restore();
    }

    const statsX = 800;
    let statsY = gridAreaY;
    const lineHeight = 34;
    const stats = [
      { label: "Medida:", value: `Largura ${widthM}mt x altura ${heightM}mt` },
      { label: "Placa:", value: `${cfg.panelWidthMm/10}cm x ${cfg.panelHeightMm/10}cm / ${cfg.panelWidthPx}×${cfg.panelHeightPx} Px` },
      { label: "Resolução:", value: `${totalWidthPx} x ${totalHeightPx}` },
      { label: "Total de pixel:", value: totalPixels.toLocaleString('pt-BR') },
      { label: "Total de Placas:", value: totalPanels.toString() },
      { label: "Consumo:", value: `${totalAmps} amperes` },
      { label: "Área Total:", value: `${areaM2.toFixed(2)} m²` },
    ];
    stats.forEach(stat => {
      ctx.textAlign = 'left'; ctx.fillStyle = '#334155'; ctx.font = "bold 21px 'Inter', sans-serif";
      const labelW = ctx.measureText(stat.label + " ").width;
      ctx.fillText(stat.label, statsX, statsY);
      ctx.fillStyle = '#475569'; ctx.font = "500 21px 'Inter', sans-serif";
      ctx.fillText(stat.value, statsX + labelW, statsY);
      statsY += lineHeight;
    });

    statsY += 15;
    const boxW = 380;
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(statsX, statsY, boxW, 55);
    ctx.fillStyle = '#1e293b'; ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("Manual de conteúdo:", statsX + 12, statsY + 22);
    ctx.fillStyle = '#64748b'; ctx.font = "500 15px 'Inter', sans-serif";
    ctx.fillText(`Software de Vídeo: ${cfg.softwareVideo}`, statsX + 12, statsY + 44);
    statsY += 65;
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(statsX, statsY, boxW, 95);
    ctx.fillStyle = '#1e293b'; ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("Especificações de Vídeo:", statsX + 12, statsY + 22);
    ctx.fillStyle = '#64748b'; ctx.font = "500 15px 'Inter', sans-serif";
    ctx.fillText(`Arquivo: ${cfg.fileFormat}`, statsX + 12, statsY + 42);
    ctx.fillText(`Codec: ${cfg.videoCodec}`, statsX + 12, statsY + 62);
    ctx.fillText(`Taxa: ${cfg.videoFps}`, statsX + 12, statsY + 82);
  }, [logoImg]);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    const prefix = activeTab === TabType.FICHA_TECNICA ? 'tech-sheet' : 'grid-led';
    link.download = `${prefix}-${config.screenName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    setIsSidebarOpen(false);
  }, [config.screenName, activeTab]);

  const handleReset = () => {
    if (confirm('Deseja resetar todas as configurações?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-white overflow-hidden font-inter select-none">
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-950 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black text-xs shadow-lg shadow-orange-900/40">PK</div>
          <h1 className="font-black text-sm uppercase italic tracking-tighter">PK LIGHT</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-orange-600 rounded-lg text-white shadow-lg shadow-orange-900/30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>

      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative top-0 left-0 w-[85vw] lg:w-80 h-full border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 transition-transform duration-300 ease-out z-40 lg:z-auto shadow-2xl lg:shadow-none
      `}>
        <div className="hidden lg:flex p-5 border-b border-zinc-900 items-center gap-3 bg-zinc-900/40 shrink-0">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center overflow-hidden border border-orange-400/30 shadow-lg shadow-orange-900/20">
            <span className="font-black text-[13px] text-white text-center leading-none uppercase">PK</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-lg leading-none tracking-tighter text-white uppercase italic">PK LIGHT</h1>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto hide-scrollbar p-5">
          <Sidebar 
            config={config} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            updateConfig={updateConfig}
            onExport={handleExport}
            onReset={handleReset}
            mainCanvasRef={canvasRef}
          />
        </div>

        <div className="p-5 border-t border-zinc-900 flex items-center justify-between gap-4 bg-zinc-950/95 backdrop-blur-md shrink-0">
          <button onClick={handleReset} className="px-4 py-3 text-[11px] font-black text-zinc-500 hover:text-white uppercase transition-colors tracking-widest">Reset</button>
          <button onClick={handleExport} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-orange-900/40 tracking-wider">Exportar PNG</button>
        </div>
      </aside>

      <main className="flex-grow relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden flex flex-col items-center justify-center p-4 lg:p-12">
        <div className="w-full h-full flex items-center justify-center max-h-full max-w-full">
          {activeTab === TabType.FICHA_TECNICA ? (
            <TechSheetPreview config={config} canvasRef={canvasRef} onRender={renderTechSheet} />
          ) : (
            <Preview config={config} canvasRef={canvasRef} logoImg={logoImg} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
