
import React, { useState, useRef, useCallback } from 'react';
import { ScreenConfig, TabType } from './types';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import TechSheetPreview from './components/TechSheetPreview';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.TAMANHO);
  const [config, setConfig] = useState<ScreenConfig>({
    mapWidth: 6,
    mapHeight: 4,
    panelWidthPx: 128,
    panelHeightPx: 128,
    panelWidthMm: 500,
    panelHeightMm: 500,
    panelType: 'P3.91',
    screenName: 'TELA',
    logoUrl: null,
    techSheetTitle: 'MAPEAMENTO DE PIXEL',
    techSheetStatsTitle: 'LED',
    softwareVideo: 'RESOLUME',
    fileFormat: 'QUICKTIME.MOV',
    videoCodec: 'DXV3',
    videoFps: '30 F',
    showScaleOverlay: false,
    showUserName: false,
    showSpecs: false,
    showCoords: false,
    color1: '#1e3a8a',
    color2: '#1e40af',
    showBackground: false,
    showWiring: false,
    wiringPattern: 'col-serpentine',
    wiringStartCorner: 'TL',
    panelWatts: 110,
    voltage: 220,
    panelWeightKg: 8.5,
    pixelsPerPort: 655360,
    targetWidthM: 3,
    targetHeightM: 2
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateConfig = (newConfig: Partial<ScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const renderTechSheet = useCallback((ctx: CanvasRenderingContext2D, cfg: ScreenConfig) => {
    const W = 1280;
    const H = 720;
    const totalPanels = cfg.mapWidth * cfg.mapHeight;
    const totalWidthPx = cfg.mapWidth * cfg.panelWidthPx;
    const totalHeightPx = cfg.mapHeight * cfg.panelHeightPx;
    const totalPixels = totalWidthPx * totalHeightPx;
    const areaM2 = (cfg.mapWidth * cfg.panelWidthMm / 1000) * (cfg.mapHeight * cfg.panelHeightMm / 1000);
    const totalWatts = totalPanels * cfg.panelWatts;
    const totalKw = totalWatts / 1000;
    const totalKva = totalKw / 0.8;
    const totalAmps = (totalWatts / cfg.voltage).toFixed(2);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Header
    ctx.fillStyle = '#9CA3AF';
    ctx.font = "900 32px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(cfg.techSheetTitle, W / 2, 70);

    // Left Side - Grid Preview
    const gridAreaX = 100;
    const gridAreaY = 220;
    const gridAreaMaxW = 550;
    const gridAreaMaxH = 350;

    ctx.fillStyle = '#FF0000';
    ctx.font = "900 36px 'Inter', sans-serif";
    ctx.fillText(cfg.techSheetStatsTitle, gridAreaX + gridAreaMaxW / 2, gridAreaY - 50);

    // Mini Grid
    const aspect = totalWidthPx / totalHeightPx;
    let gridW = gridAreaMaxW;
    let gridH = gridAreaMaxW / aspect;
    if (gridH > gridAreaMaxH) {
      gridH = gridAreaMaxH;
      gridW = gridAreaMaxH * aspect;
    }

    const gridX = gridAreaX + (gridAreaMaxW - gridW) / 2;
    const gridY = gridAreaY + (gridAreaMaxH - gridH) / 2;
    
    const cellW = gridW / cfg.mapWidth;
    const cellH = gridH / cfg.mapHeight;

    for (let r = 0; r < cfg.mapHeight; r++) {
      for (let c = 0; c < cfg.mapWidth; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? cfg.color1 : cfg.color2;
        ctx.fillRect(gridX + c * cellW, gridY + r * cellH, cellW, cellH);
      }
    }

    // Grid Pixel Labels
    ctx.fillStyle = '#FF0000';
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    // Width label
    ctx.fillText(`${totalWidthPx}px`, gridX + gridW / 2, gridY + gridH + 40);
    // Height label (vertical)
    ctx.save();
    ctx.translate(gridX - 40, gridY + gridH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${totalHeightPx}px`, 0, 0);
    ctx.restore();

    // Right Side - Stats
    const statsX = 780;
    let statsY = 190; // Subido de 220
    const lineHeight = 30; // Reduzido de 35

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FF0000';
    ctx.font = "900 32px 'Inter', sans-serif";
    ctx.fillText(cfg.techSheetStatsTitle, statsX, statsY - 45);

    ctx.fillStyle = '#1F2937';
    ctx.font = "bold 20px 'Inter', sans-serif";
    
    const stats = [
      `Medida: Largura ${(cfg.mapWidth * cfg.panelWidthMm / 1000).toFixed(2)}mt x altura ${(cfg.mapHeight * cfg.panelHeightMm / 1000).toFixed(2)}mt`,
      `Placa: ${cfg.panelWidthMm/10}cm x ${cfg.panelHeightMm/10}cm / ${cfg.panelWidthPx}×${cfg.panelHeightPx} Px`,
      `Resolução: ${totalWidthPx} x ${totalHeightPx}`,
      `Total de pixel: ${totalPixels.toLocaleString('pt-BR')}`,
      `Total de Placas: ${totalPanels}`,
      `Potência: ${totalKw.toFixed(2)} kW / ${totalKva.toFixed(2)} kVA`,
      `Consumo: ${totalAmps} amperes`,
      `Área Total: ${areaM2.toFixed(2)} m²`,
    ];

    stats.forEach(line => {
      ctx.fillText(line, statsX, statsY);
      statsY += lineHeight;
    });

    // Bottom Right - Content Info Boxes
    statsY += 15; // Reduzido de 20
    
    // Box 1
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(statsX, statsY, 380, 70); // Reduzido altura de 80
    ctx.fillStyle = '#374151';
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("Manual de conteúdo:", statsX + 20, statsY + 25);
    ctx.fillStyle = '#6B7280';
    ctx.font = "500 16px 'Inter', sans-serif";
    ctx.fillText(`Software de Vídeo: ${cfg.softwareVideo}`, statsX + 20, statsY + 50);

    statsY += 85; // Reduzido de 100

    // Box 2
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(statsX, statsY, 380, 120); // Reduzido altura de 130
    ctx.fillStyle = '#374151';
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("Especificações de Vídeo:", statsX + 20, statsY + 25);
    ctx.fillStyle = '#6B7280';
    ctx.font = "500 16px 'Inter', sans-serif";
    ctx.fillText(`Arquivo de Vídeo: ${cfg.fileFormat}`, statsX + 20, statsY + 50);
    ctx.fillText(`Codec de vídeo: ${cfg.videoCodec}`, statsX + 20, statsY + 75);
    ctx.fillText(`Taxa de quadros: ${cfg.videoFps}`, statsX + 20, statsY + 100);

  }, []);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    const prefix = activeTab === TabType.FICHA_TECNICA ? 'tech-sheet' : 'grid-led';
    link.download = `${prefix}-${config.screenName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  }, [config.screenName, activeTab]);

  const handleReset = () => {
    if (confirm('Deseja resetar todas as configurações?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden font-inter">
      <aside className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-900 flex items-center gap-3 bg-zinc-900/20">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden border border-blue-400/30 shadow-lg shadow-blue-900/20">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="font-black text-[10px] text-white">BETO</span>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-lg leading-none tracking-tighter text-white uppercase italic">GRID LED</h1>
            <span className="text-[9px] text-blue-500 font-bold tracking-[0.2em] mt-0.5">PROFESSIONAL TOOL</span>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
          <Sidebar 
            config={config} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            updateConfig={updateConfig}
            onExport={handleExport}
            onReset={handleReset}
          />
        </div>

        <div className="p-4 border-t border-zinc-900 grid grid-cols-2 gap-2 bg-zinc-900/10">
          <button onClick={handleReset} className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase transition-colors">Resetar</button>
          <button onClick={handleExport} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase transition-all shadow-lg shadow-blue-900/20">Exportar PNG</button>
        </div>
      </aside>

      <main className="flex-grow relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden flex items-center justify-center p-8">
        {activeTab === TabType.FICHA_TECNICA ? (
          <TechSheetPreview config={config} canvasRef={canvasRef} onRender={renderTechSheet} />
        ) : (
          <Preview config={config} canvasRef={canvasRef} updateConfig={updateConfig} />
        )}
      </main>
    </div>
  );
};

export default App;
