import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScreenConfig, TabType } from './types';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import TechSheetPreview from './components/TechSheetPreview';

const App: React.FC = () => {
  const [config, setConfig] = useState<ScreenConfig>({
    mapWidth: 16,
    mapHeight: 9,
    panelWidthPx: 128,
    panelHeightPx: 128,
    panelWidthMm: 500,
    panelHeightMm: 500,
    panelType: 'P3',
    screenName: 'Screen 1',
    techSheetTitle: 'Pixel mapping',
    techSheetStatsTitle: 'LED',
    showScaleOverlay: false,
    showUserName: false,
    showSpecs: false,
    showCoords: false,
    showLogo: false,
    logoSize: 150,
    logoX: 1050,
    logoY: 70,
    color1: '#000350',
    color2: '#00f4ff',
    showBackground: false,
    showWiring: false,
    wiringPattern: 'row-serpentine',
    wiringStartCorner: 'TL',
    panelWatts: 105,
    panelAmps: 0.477,
    voltage: 220
  });

  const [activeTab, setActiveTab] = useState<TabType>(TabType.TAMANHO);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const techSheetRef = useRef<HTMLCanvasElement>(null);

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const updateConfig = (newConfig: Partial<ScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleExport = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${config.screenName || 'test-card'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleExportTechnicalSheet = () => {
    let targetCanvas: HTMLCanvasElement;
    if (activeTab === TabType.FICHA_TECNICA && techSheetRef.current) {
        targetCanvas = techSheetRef.current;
    } else {
        targetCanvas = document.createElement('canvas');
        targetCanvas.width = 1280;
        targetCanvas.height = 720;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) renderTechSheet(ctx, config, false);
    }
    const link = document.createElement('a');
    link.download = `Ficha_Tecnica_${config.screenName || 'LED'}.png`;
    link.href = targetCanvas.toDataURL('image/png');
    link.click();
  };

  const renderTechSheet = (ctx: CanvasRenderingContext2D, cfg: ScreenConfig, isPreview: boolean = false) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const screenWidth = cfg.mapWidth * cfg.panelWidthPx;
    const screenHeight = cfg.mapHeight * cfg.panelHeightPx;
    
    const previewAreaMaxW = 600;
    const previewAreaMaxH = 400;
    const statsBoxWidth = 400;
    const gap = 80;

    const previewScale = Math.min(previewAreaMaxW / screenWidth, previewAreaMaxH / screenHeight);
    const previewW = screenWidth * previewScale;
    const previewH = screenHeight * previewScale;
    
    const totalContentWidth = previewW + gap + statsBoxWidth;
    const contentStartX = (width - totalContentWidth) / 2;
    const statsStartY = (height - 500) / 2 + 50;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#bbbbbb';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(cfg.techSheetTitle || `Pixel mapping`, width / 2, statsStartY - 100);

    const totalPanels = cfg.mapWidth * cfg.mapHeight;
    const physicalWidthM = (cfg.mapWidth * cfg.panelWidthMm) / 1000;
    const physicalHeightM = (cfg.mapHeight * cfg.panelHeightMm) / 1000;
    const totalAreaM2 = physicalWidthM * physicalHeightM;
    const totalAmps = totalPanels * (cfg.panelAmps || 0);
    const totalPixels = screenWidth * screenHeight;

    const statsX = contentStartX + previewW + gap;
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(cfg.techSheetStatsTitle || 'LED', statsX, statsStartY);

    ctx.fillStyle = '#000000';
    ctx.font = '20px Inter';
    const stats = [
      `Medida: Largura ${physicalWidthM.toFixed(2)}mt x altura ${physicalHeightM.toFixed(2)}mt`,
      `Placa: ${cfg.panelWidthMm/10}cm x ${cfg.panelHeightMm/10}cm / ${cfg.panelWidthPx}x${cfg.panelHeightPx} Px`,
      `Resolução: ${screenWidth} x ${screenHeight}`,
      `Total de pixel: ${totalPixels.toLocaleString('pt-BR')}`,
      `Total de Placas: ${totalPanels}`,
      `Consumo: ${totalAmps.toFixed(2)} amperes`,
      `Área total: ${totalAreaM2.toFixed(2)}m²`
    ];
    stats.forEach((text, i) => ctx.fillText(text, statsX, statsStartY + 45 + (i * 35)));

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(statsX, statsStartY + 300, statsBoxWidth, 90);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Inter';
    ctx.fillText('Manual de conteúdo:', statsX + 15, statsStartY + 330);
    ctx.font = '18px Inter';
    ctx.fillText('Software de Video: RESOLUME', statsX + 15, statsStartY + 360);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(statsX, statsStartY + 410, statsBoxWidth, 140);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Inter';
    ctx.fillText('Especificações de Video:', statsX + 15, statsStartY + 440);
    ctx.font = '18px Inter';
    ctx.fillText('Arquivo de Video: QUICKTIME.MOV', statsX + 15, statsStartY + 470);
    ctx.fillText('Codec de vídeo: DXV3', statsX + 15, statsStartY + 500); 
    ctx.fillText('Taxa de quadros: 30 F', statsX + 15, statsStartY + 530);

    const previewX = contentStartX;
    const previewY = statsStartY + 20;
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 36px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.techSheetStatsTitle || 'LED', previewX + previewW/2, previewY - 35);

    for (let r = 0; r < cfg.mapHeight; r++) {
      for (let c = 0; c < cfg.mapWidth; c++) {
        const h = cfg.panelHeightPx;
        if (!cfg.showBackground || !cfg.backgroundUrl) {
          ctx.fillStyle = (r + c) % 2 === 0 ? cfg.color1 : cfg.color2;
          ctx.fillRect(previewX + c * cfg.panelWidthPx * previewScale, previewY + r * cfg.panelHeightPx * previewScale, cfg.panelWidthPx * previewScale, h * previewScale);
        }
        
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(previewX + c * cfg.panelWidthPx * previewScale, previewY + r * cfg.panelHeightPx * previewScale, cfg.panelWidthPx * previewScale, h * previewScale);
        
        if (cfg.showCoords) {
          const panelIdx = (r * cfg.mapWidth) + (c + 1);
          const fontSize = Math.max(10, 14 * previewScale * (screenWidth / 300)); 
          ctx.font = `bold ${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const text = `${panelIdx}`;
          const metrics = ctx.measureText(text);
          const padding = fontSize * 0.4;
          const bgW = metrics.width + padding;
          const bgH = fontSize + padding * 0.5;
          const posX = previewX + (c + 0.5) * cfg.panelWidthPx * previewScale;
          const posY = previewY + (r * cfg.panelHeightPx + h/2) * previewScale;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.roundRect(posX - bgW/2, posY - bgH/2, bgW, bgH, 2);
          ctx.fill();

          ctx.fillStyle = 'white';
          ctx.fillText(text, posX, posY);
        }
      }
    }

    if (cfg.showScaleOverlay) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3; 
      
      ctx.beginPath();
      ctx.moveTo(previewX, previewY);
      ctx.lineTo(previewX + previewW, previewY + previewH);
      ctx.moveTo(previewX + previewW, previewY);
      ctx.lineTo(previewX, previewY + previewH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(previewX + previewW / 2, previewY);
      ctx.lineTo(previewX + previewW / 2, previewY + previewH);
      ctx.moveTo(previewX, previewY + previewH / 2);
      ctx.lineTo(previewX + previewW, previewY + previewH / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(previewX + previewW / 2, previewY + previewH / 2, Math.min(previewW, previewH) * 0.4, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (cfg.showUserName && cfg.screenName) {
      const centerX = previewX + previewW / 2;
      const centerY = previewY + previewH / 2;
      const fontSize = Math.max(14, previewH / 12);
      
      ctx.font = `bold ${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const metrics = ctx.measureText(cfg.screenName);
      const boxW = metrics.width + fontSize * 1.5;
      const boxH = fontSize + fontSize * 0.8;
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(centerX - boxW/2, centerY - boxH/2, boxW, boxH, 6);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.fillText(cfg.screenName, centerX, centerY);
    }

    if (cfg.showSpecs) {
      const commonDivisor = calculateGcd(screenWidth, screenHeight);
      const aspectRatio = commonDivisor ? `${screenWidth / commonDivisor}:${screenHeight / commonDivisor}` : 'N/A';
      
      const fontSize = Math.max(8, previewH / 30);
      ctx.font = `${fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const specsText = `Panel Count: ${cfg.mapWidth} wide x ${cfg.mapHeight} high • ${totalPanels} panels total • Resolution: ${screenWidth} x ${screenHeight} px • Aspect Ratio: ${aspectRatio}`;
      const metrics = ctx.measureText(specsText);
      const paddingX = fontSize * 1.5;
      const paddingY = fontSize * 0.8;
      const boxW = metrics.width + paddingX;
      const boxH = fontSize + paddingY;
      
      const centerX = previewX + previewW / 2;
      const centerY = previewY + previewH - boxH/2 - 5;

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(centerX - boxW/2, centerY - boxH/2, boxW, boxH, boxH/2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = 'black';
      ctx.fillText(specsText, centerX, centerY);
    }

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(previewX, previewY, previewW, previewH);

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${screenWidth}px`, previewX + previewW / 2, previewY + previewH + 50);
    
    ctx.save();
    ctx.translate(previewX - 60, previewY + previewH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${screenHeight}px`, 0, 0);
    ctx.restore();

    if (cfg.showLogo && cfg.logoUrl) {
      const img = new Image();
      img.src = cfg.logoUrl;
      img.onload = () => {
        const logoSize = cfg.logoSize;
        const aspect = img.width / img.height;
        let dWidth = logoSize;
        let dHeight = logoSize / aspect;
        if (dHeight > logoSize) {
          dHeight = logoSize;
          dWidth = logoSize * aspect;
        }
        ctx.drawImage(img, cfg.logoX, cfg.logoY, dWidth, dHeight);
      };
    }
  };

  const resetProject = () => {
    if (confirm('Deseja reiniciar o projeto? Todas as alterações serão perdidas.')) window.location.reload();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-slate-800">
      <div className="w-full md:w-96 bg-zinc-950 shadow-xl flex-shrink-0 z-10 overflow-y-auto max-h-screen border-r border-zinc-800 text-zinc-100">
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center gap-4 transition-all hover:bg-zinc-800/80">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden border border-zinc-700">
             {config.logoUrl ? (
               <img src={config.logoUrl} className="w-full h-full object-contain" alt="Logo" />
             ) : (
               <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M4 10l8-6 8 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
                 <path d="M12 22v-9" strokeLinecap="round"/>
                 <path d="M9 13h6" strokeLinecap="round"/>
               </svg>
             )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-white tracking-tighter leading-none">BETO TOVIKS</h1>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">LED SOLUTIONS</span>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-sm font-bold mb-4 text-zinc-500 uppercase tracking-widest">Configurações de tela</h2>
          <Sidebar config={config} activeTab={activeTab} setActiveTab={setActiveTab} updateConfig={updateConfig} onExport={handleExport} onExportTechSheet={handleExportTechnicalSheet} onReset={resetProject} />
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-8 bg-gray-300 overflow-hidden relative transition-colors duration-200">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
           {config.logoUrl ? (
             <img src={config.logoUrl} className="max-w-[40vw] max-h-[40vh] object-contain grayscale transform -rotate-12" alt="Watermark" />
           ) : (
             <h1 className="text-[15vw] font-black tracking-tighter transform -rotate-12">BETO TOVIKS</h1>
           )}
        </div>
        
        <div className="absolute top-8 left-8 flex items-center gap-2 opacity-30 pointer-events-none">
           <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white overflow-hidden">
              {config.logoUrl ? (
                <img src={config.logoUrl} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <span className="text-xs font-bold">BT</span>
              )}
           </div>
           <span className="text-sm font-black text-zinc-900 uppercase tracking-widest">BETO TOVIKS</span>
        </div>

        <div className="relative w-full h-full flex items-center justify-center z-10">
            {activeTab === TabType.FICHA_TECNICA ? <TechSheetPreview config={config} canvasRef={techSheetRef} onRender={renderTechSheet} /> : <Preview config={config} canvasRef={canvasRef} />}
        </div>
        
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl text-[11px] font-bold text-zinc-800 border border-white/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            {config.mapWidth * config.panelWidthPx} x {config.mapHeight * config.panelHeightPx} PX
        </div>
      </div>
    </div>
  );
};

export default App;