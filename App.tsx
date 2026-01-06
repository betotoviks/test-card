
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
    showScaleOverlay: false,
    showUserName: false,
    showSpecs: false,
    showCoords: false,
    showLogo: false,
    logoSize: 200,
    logoX: 800,
    logoY: 450,
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
    
    const previewAreaSize = 450;
    const previewScale = Math.min(previewAreaSize / screenWidth, previewAreaSize / screenHeight);
    const previewW = screenWidth * previewScale;
    const previewH = screenHeight * previewScale;
    const statsBoxWidth = 400;
    const gap = 80;
    const totalContentWidth = previewAreaSize + gap + statsBoxWidth;
    const contentStartX = (width - totalContentWidth) / 2;
    const statsStartY = (height - 550) / 2 + 50;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Título da Ficha
    ctx.fillStyle = '#bbb';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(cfg.techSheetTitle || `Pixel mapping`, width / 2, statsStartY - 100);

    const totalPanels = cfg.mapWidth * cfg.mapHeight;
    const physicalWidthM = (cfg.mapWidth * cfg.panelWidthMm) / 1000;
    const physicalHeightM = (cfg.mapHeight * cfg.panelHeightMm) / 1000;
    const totalAmps = totalPanels * (cfg.panelAmps || 0);
    const totalPixels = screenWidth * screenHeight;

    const statsX = contentStartX + previewAreaSize + gap;
    
    // LED Label in stats
    ctx.fillStyle = 'red';
    ctx.font = 'bold 22px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('LED', statsX, statsStartY);

    // Linhas de estatísticas
    ctx.fillStyle = 'black';
    ctx.font = '20px Inter';
    const stats = [
      `Medida: Largura ${physicalWidthM.toFixed(2)}mt x altura ${physicalHeightM.toFixed(2)}mt`,
      `Placa: ${cfg.panelWidthMm/10}cm x ${cfg.panelHeightMm/10}cm / ${cfg.panelWidthPx}x${cfg.panelHeightPx} Px`,
      `Resolução: ${screenWidth} x ${screenHeight}`,
      `Total de pixel: ${totalPixels.toLocaleString('pt-BR')}`,
      `Total de Placas: ${totalPanels}`,
      `Consumo: ${totalAmps.toFixed(2)} amperes`
    ];
    stats.forEach((text, i) => ctx.fillText(text, statsX, statsStartY + 35 + (i * 35)));

    // Box de manual e especificações
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(statsX, statsStartY + 250, statsBoxWidth, 90);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Inter';
    ctx.fillText('Manual de conteúdo:', statsX + 10, statsStartY + 275);
    ctx.font = '18px Inter';
    ctx.fillText('Software de Video: RESOLUME', statsX + 10, statsStartY + 305);

    // Especificações de Video Box
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(statsX, statsStartY + 360, statsBoxWidth, 140);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Inter';
    ctx.fillText('Especificações de Video:', statsX + 10, statsStartY + 385);
    ctx.font = '18px Inter';
    ctx.fillText('Arquivo de Video: QUICKTIME.MOV', statsX + 10, statsStartY + 415);
    ctx.fillText('Codec de vídeo: DXV3', statsX + 10, statsStartY + 445); 
    ctx.fillText('Taxa de quadros: 30 F', statsX + 10, statsStartY + 475);

    // Mini Preview
    const previewX = contentStartX + (previewAreaSize - previewW) / 2;
    const previewY = statsStartY + 20;
    
    // LED acima do preview
    ctx.fillStyle = 'red';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('LED', previewX + previewW/2, previewY - 30);

    // Background Image se houver e estiver ativa
    if (cfg.showBackground && cfg.backgroundUrl) {
      const bgImg = new Image();
      bgImg.src = cfg.backgroundUrl;
      if (bgImg.complete) {
        ctx.drawImage(bgImg, previewX, previewY, previewW, previewH);
      }
    }

    // Desenha o mapa quadriculado
    for (let r = 0; r < cfg.mapHeight; r++) {
      for (let c = 0; c < cfg.mapWidth; c++) {
        const h = cfg.panelHeightPx;
        if (!cfg.showBackground || !cfg.backgroundUrl) {
          ctx.fillStyle = (r + c) % 2 === 0 ? cfg.color1 : cfg.color2;
          ctx.fillRect(previewX + c * cfg.panelWidthPx * previewScale, previewY + r * cfg.panelHeightPx * previewScale, cfg.panelWidthPx * previewScale, h * previewScale);
        }
        
        ctx.strokeStyle = cfg.showBackground ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(previewX + c * cfg.panelWidthPx * previewScale, previewY + r * cfg.panelHeightPx * previewScale, cfg.panelWidthPx * previewScale, h * previewScale);
        
        if (cfg.showCoords) {
          const panelIdx = (r * cfg.mapWidth) + (c + 1);
          const fontSize = Math.max(12, 16 * previewScale * (screenWidth / 400)); 
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

          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          const radius = 3;
          ctx.beginPath();
          ctx.roundRect(posX - bgW/2, posY - bgH/2, bgW, bgH, radius);
          ctx.fill();

          ctx.fillStyle = 'white';
          ctx.fillText(text, posX, posY);
        }
      }
    }

    // Círculo de sobreposição
    if (cfg.showScaleOverlay) {
      const miniCenterX = previewX + previewW / 2;
      const miniCenterY = previewY + previewH / 2;
      const miniRadius = Math.min(previewW, previewH) * 0.45;
      ctx.beginPath();
      ctx.arc(miniCenterX, miniCenterY, miniRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Borda do preview
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(previewX, previewY, previewW, previewH);

    // Dimensões em Vermelho
    ctx.fillStyle = 'red';
    ctx.font = 'bold 28px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${screenWidth}px`, previewX + previewW / 2, previewY + previewH + 45);
    
    ctx.save();
    ctx.translate(previewX - 60, previewY + previewH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${screenHeight}px`, 0, 0);
    ctx.restore();

    // Logotipo Customizado na Ficha
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
        {/* Branded Header with Dynamic Logo */}
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
        {/* Main Workspace Watermark with Logo Support */}
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
