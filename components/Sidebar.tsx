
import React, { useEffect, useRef } from 'react';
import { ScreenConfig, TabType } from '../types';

interface SidebarProps {
  config: ScreenConfig;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  updateConfig: (newConfig: Partial<ScreenConfig>) => void;
  onExport: () => void;
  onReset: () => void;
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const MiniMapPreview: React.FC<{ config: ScreenConfig, activeTab: TabType, mainCanvasRef: React.RefObject<HTMLCanvasElement | null> }> = ({ config, activeTab, mainCanvasRef }) => {
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const updateMiniMap = () => {
      const mainCanvas = mainCanvasRef.current;
      const miniCanvas = miniCanvasRef.current;
      if (!mainCanvas || !miniCanvas) return;

      const miniCtx = miniCanvas.getContext('2d');
      if (!miniCtx) return;

      // Respeitar a proporção do canvas original
      const aspect = mainCanvas.width / mainCanvas.height;
      
      // Definir tamanho fixo na largura e ajustar altura baseada no aspecto
      miniCanvas.width = 320; 
      miniCanvas.height = 320 / aspect;

      miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
      
      // Tenta desenhar o conteúdo do canvas principal
      try {
        miniCtx.drawImage(mainCanvas, 0, 0, miniCanvas.width, miniCanvas.height);
      } catch (e) {
        // Se falhar (ex: canvas não pronto), tentaremos no próximo frame via rAF
      }
    };

    // Usar rAF para garantir que o desenho aconteça após o preview principal ser renderizado
    const handle = requestAnimationFrame(updateMiniMap);
    
    // Como os sub-componentes de preview (Preview, TechSheetPreview) desenham em useEffect,
    // um pequeno timeout garante que a cópia capture o estado final renderizado.
    const timeout = setTimeout(updateMiniMap, 50);

    return () => {
      cancelAnimationFrame(handle);
      clearTimeout(timeout);
    };
  }, [config, activeTab, mainCanvasRef]);

  return (
    <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-black p-2 flex items-center justify-center min-h-[120px] transition-all duration-500 hover:border-orange-500/30 shadow-inner">
       <canvas 
        ref={miniCanvasRef} 
        className="w-full h-auto max-h-[160px] object-contain"
        style={{ imageRendering: activeTab === TabType.FICHA_TECNICA ? 'auto' : 'pixelated' }}
      />
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ config, activeTab, setActiveTab, updateConfig, mainCanvasRef }) => {
  
  const presets = [
    { pxW: 128, pxH: 128, mmW: 500, mmH: 500, sub: '500x500' },
    { pxW: 168, pxH: 168, mmW: 500, mmH: 500, sub: '500x500' },
    { pxW: 192, pxH: 192, mmW: 500, mmH: 500, sub: '500x500' },
    { pxW: 128, pxH: 256, mmW: 500, mmH: 1000, sub: '500x1000' },
    { pxW: 168, pxH: 336, mmW: 500, mmH: 1000, sub: '500x1000' },
    { pxW: 256, pxH: 128, mmW: 1000, mmH: 500, sub: '1000x500' },
    { pxW: 336, pxH: 168, mmW: 1000, mmH: 500, sub: '1000x500' },
  ];

  const applyPreset = (pxW: number, pxH: number, mmW: number, mmH: number) => {
    const newMapWidth = Math.max(1, Math.round((config.targetWidthM * 1000) / mmW));
    const newMapHeight = Math.max(1, Math.round((config.targetHeightM * 1000) / mmH));
    const watts = (mmW === 1000 || mmH === 1000) ? 250 : 125;

    updateConfig({
      panelWidthPx: pxW,
      panelHeightPx: pxH,
      panelWidthMm: mmW,
      panelHeightMm: mmH,
      mapWidth: newMapWidth,
      mapHeight: newMapHeight,
      panelWatts: watts,
      targetWidthM: (newMapWidth * mmW) / 1000,
      targetHeightM: (newMapHeight * mmH) / 1000
    });
  };

  const handleRandomColors = () => {
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateConfig({ color1: randomHex(), color2: randomHex() });
  };

  const colorPresets = [
    { name: 'AZUL', c1: '#1e3a8a', c2: '#3b82f6' },
    { name: 'VERDE', c1: '#064e3b', c2: '#10b981' },
    { name: 'LARANJA', c1: '#7c2d12', c2: '#fb923c' },
    { name: 'VERMELHO', c1: '#7f1d1d', c2: '#ef4444' },
    { name: 'ROXO', c1: '#4c1d95', c2: '#8b5cf6' },
    { name: 'CIANO', c1: '#164e63', c2: '#06b6d4' },
    { name: 'CINZA', c1: '#111827', c2: '#374151' },
    { name: 'OURO', c1: '#713f12', c2: '#eab308' },
  ];

  const handlePlacaWidthChange = (n: number) => {
    const val = Math.max(0, n);
    updateConfig({ 
      mapWidth: val, 
      targetWidthM: (val * config.panelWidthMm) / 1000 
    });
  };

  const handlePlacaHeightChange = (n: number) => {
    const val = Math.max(0, n);
    updateConfig({ 
      mapHeight: val, 
      targetHeightM: (val * config.panelHeightMm) / 1000 
    });
  };

  const handleMetersWidthChange = (m: number) => {
    const valM = Math.max(0, m);
    const n = Math.ceil((valM * 1000) / config.panelWidthMm);
    updateConfig({ targetWidthM: valM, mapWidth: Math.max(0, n) });
  };

  const handleMetersHeightChange = (m: number) => {
    const valM = Math.max(0, m);
    const n = Math.ceil((valM * 1000) / config.panelHeightMm);
    updateConfig({ targetHeightM: valM, mapHeight: Math.max(0, n) });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateConfig({ logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isSerpentine = config.wiringPattern.includes('serpentine');
  const isVertical = config.wiringPattern.includes('col');

  const toggleSerpentine = () => {
    const newPattern = isSerpentine 
      ? config.wiringPattern.replace('serpentine', 'straight') 
      : config.wiringPattern.replace('straight', 'serpentine');
    updateConfig({ wiringPattern: newPattern as any });
  };

  const setOrientation = (corner: 'TL' | 'TR' | 'BL' | 'BR', vertical: boolean) => {
    const type = vertical ? 'col' : 'row';
    const variant = isSerpentine ? 'serpentine' : 'straight';
    updateConfig({ 
      wiringStartCorner: corner, 
      wiringPattern: `${type}-${variant}` as any 
    });
  };

  const orientationButtons = [
    { corner: 'TL', v: false, label: 'TL H' },
    { corner: 'TL', v: true, label: 'TL V' },
    { corner: 'TR', v: false, label: 'TR H' },
    { corner: 'TR', v: true, label: 'TR V' },
    { corner: 'BL', v: false, label: 'BL H' },
    { corner: 'BL', v: true, label: 'BL V' },
    { corner: 'BR', v: false, label: 'BR H' },
    { corner: 'BR', v: true, label: 'BR V' },
  ];

  const getIcon = (type: TabType) => {
    switch (type) {
      case TabType.TAMANHO:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>;
      case TabType.SOBREPOSICAO:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00 2 2h10a2 2 0 00 2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>;
      case TabType.COR:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17l.354-.354"></path></svg>;
      case TabType.CALCULO:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
      case TabType.CABEAMENTO:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
      case TabType.FICHA_TECNICA:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg>;
    }
  };

  const TabButton = ({ type }: { type: TabType }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all border ${
        activeTab === type 
          ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/20' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
      }`}
    >
      {getIcon(type)}
      <span className="text-[10px] font-black uppercase tracking-tight">{type}</span>
    </button>
  );

  const totalPanels = config.mapWidth * config.mapHeight;
  const totalWidthPx = config.mapWidth * config.panelWidthPx;
  const totalHeightPx = config.mapHeight * config.panelHeightPx;
  const totalPixels = totalWidthPx * totalHeightPx;
  const areaM2 = (config.mapWidth * config.panelWidthMm / 1000) * (config.mapHeight * config.panelHeightMm / 1000);
  const totalWatts = totalPanels * config.panelWatts;
  const totalAmps = (totalWatts / config.voltage).toFixed(2);
  const totalWeight = (totalPanels * config.panelWeightKg).toFixed(1);
  const totalKva = ((totalWatts / 1000) / 0.8).toFixed(2);
  const totalCables = Math.ceil(totalPixels / (config.pixelsPerPort || 655360));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2.5">
        <TabButton type={TabType.TAMANHO} />
        <TabButton type={TabType.SOBREPOSICAO} />
        <TabButton type={TabType.COR} />
        <TabButton type={TabType.CALCULO} />
        <TabButton type={TabType.CABEAMENTO} />
        <TabButton type={TabType.FICHA_TECNICA} />
      </div>

      <div className="space-y-6 pt-1">
        {activeTab === TabType.TAMANHO && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tamanho por Placa</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">Largura (N)</label>
                    <input type="number" inputMode="numeric" value={config.mapWidth} onChange={(e) => handlePlacaWidthChange(parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-base text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">Altura (N)</label>
                    <input type="number" inputMode="numeric" value={config.mapHeight} onChange={(e) => handlePlacaHeightChange(parseInt(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-base text-white focus:border-orange-500 outline-none font-black" />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tamanho por Metro</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">Largura (M)</label>
                    <input type="number" step="0.1" inputMode="decimal" value={config.targetWidthM} onChange={(e) => handleMetersWidthChange(parseFloat(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-base text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">Altura (M)</label>
                    <input type="number" step="0.1" inputMode="decimal" value={config.targetHeightM} onChange={(e) => handleMetersHeightChange(parseFloat(e.target.value) || 0)} className="w-full bg-black border border-zinc-800 rounded-xl p-3.5 text-base text-white focus:border-orange-500 outline-none font-black" />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Configuração do Painel</h3>
               <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">L (PX)</label>
                    <input type="number" inputMode="numeric" value={config.panelWidthPx} onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">A (PX)</label>
                    <input type="number" inputMode="numeric" value={config.panelHeightPx} onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">L (MM)</label>
                    <input type="number" inputMode="numeric" value={config.panelWidthMm} onChange={(e) => updateConfig({ panelWidthMm: parseInt(e.target.value) || 500 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">A (MM)</label>
                    <input type="number" inputMode="numeric" value={config.panelHeightMm} onChange={(e) => updateConfig({ panelHeightMm: parseInt(e.target.value) || 500 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">PESO (KG)</label>
                    <input type="number" step="0.1" inputMode="decimal" value={config.panelWeightKg} onChange={(e) => updateConfig({ panelWeightKg: parseFloat(e.target.value) || 0 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">WATTS (W)</label>
                    <input type="number" inputMode="numeric" value={config.panelWatts} onChange={(e) => updateConfig({ panelWatts: parseInt(e.target.value) || 0 })} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-orange-500 outline-none font-black" />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PRESETS PROFISSIONAIS</h3>
              <div className="grid grid-cols-2 gap-3">
                {presets.map((p, idx) => {
                  const isActive = config.panelWidthPx === p.pxW && config.panelHeightPx === p.pxH && config.panelHeightMm === p.mmH;
                  return (
                    <button
                      key={idx}
                      onClick={() => applyPreset(p.pxW, p.pxH, p.mmW, p.mmH)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-500/20' 
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-xs font-black tracking-tighter">{p.pxW}*{p.pxH}</span>
                      <span className={`text-[8px] uppercase font-black tracking-wider ${isActive ? 'text-blue-100' : 'text-zinc-600'}`}>{p.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.SOBREPOSICAO && (
          <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-5">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Elementos Visuais</h3>
              
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-black text-white uppercase tracking-wider">Mira e Escala</span>
                <button 
                  onClick={() => updateConfig({ showScaleOverlay: !config.showScaleOverlay })}
                  className={`w-14 h-7 rounded-full transition-all relative ${config.showScaleOverlay ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${config.showScaleOverlay ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-black text-white uppercase tracking-wider">Nome da Tela</span>
                <button 
                  onClick={() => updateConfig({ showUserName: !config.showUserName })}
                  className={`w-14 h-7 rounded-full transition-all relative ${config.showUserName ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${config.showUserName ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-black text-white uppercase tracking-wider">Especificações</span>
                <button 
                  onClick={() => updateConfig({ showSpecs: !config.showSpecs })}
                  className={`w-14 h-7 rounded-full transition-all relative ${config.showSpecs ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${config.showSpecs ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-black text-white uppercase tracking-wider">Coords / ID</span>
                <button 
                  onClick={() => updateConfig({ showCoords: !config.showCoords })}
                  className={`w-14 h-7 rounded-full transition-all relative ${config.showCoords ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${config.showCoords ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TEXTO PERSONALIZADO</label>
              <input 
                type="text" 
                value={config.screenName} 
                onChange={(e) => updateConfig({ screenName: e.target.value.toUpperCase() })}
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-base font-black text-white outline-none focus:border-blue-500 uppercase italic"
                placeholder="EX: TELA PALCO"
              />
            </div>
          </div>
        )}

        {activeTab === TabType.CALCULO && (
          <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/80 space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Resolução</h3>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Pixels Totais</span>
                  <span className="text-2xl font-black text-white italic">{totalPixels.toLocaleString()} px</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Aspecto Pixel</span>
                  <span className="text-base font-black text-zinc-300 italic">{totalWidthPx} x {totalHeightPx}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Estrutura</h3>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Placas</span>
                  <span className="text-xl font-black text-orange-500 italic">{totalPanels} un</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Métrica</span>
                  <span className="text-base font-black text-zinc-300 italic">{areaM2.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Carga Peso</span>
                  <span className="text-base font-black text-zinc-300 italic">{totalWeight} Kg</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Elétrica</h3>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Consumo Pico</span>
                  <span className="text-xl font-black text-blue-500 italic">{totalWatts} W</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[11px] text-zinc-500 font-black uppercase">Amperagem (@{config.voltage}V)</span>
                  <span className="text-base font-black text-zinc-300 italic">{totalAmps} Amperes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.COR && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cores do Mapa</h3>
              <button 
                onClick={handleRandomColors}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-[11px] font-black text-blue-400 hover:bg-blue-600/40 transition-all uppercase italic"
              >
                Sortear ✨
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">COR 1</label>
                <div className="flex items-center gap-3 p-1.5 bg-black border border-zinc-800 rounded-2xl">
                  <input type="color" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="w-14 h-14 bg-transparent border-none rounded-xl cursor-pointer" />
                  <input type="text" value={config.color1.toUpperCase()} onChange={(e) => updateConfig({ color1: e.target.value })} className="flex-1 bg-transparent border-none text-base font-black text-white outline-none px-2 uppercase italic" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">COR 2</label>
                <div className="flex items-center gap-3 p-1.5 bg-black border border-zinc-800 rounded-2xl">
                  <input type="color" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="w-14 h-14 bg-transparent border-none rounded-xl cursor-pointer" />
                  <input type="text" value={config.color2.toUpperCase()} onChange={(e) => updateConfig({ color2: e.target.value })} className="flex-1 bg-transparent border-none text-base font-black text-white outline-none px-2 uppercase italic" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {colorPresets.map((preset, idx) => (
                <button key={idx} onClick={() => updateConfig({ color1: preset.c1, color2: preset.c2 })} className="group flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-zinc-800 group-hover:border-zinc-500 transition-all flex shadow-lg">
                    <div className="flex-1 h-full" style={{ backgroundColor: preset.c1 }}></div>
                    <div className="flex-1 h-full" style={{ backgroundColor: preset.c2 }}></div>
                  </div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase group-hover:text-zinc-400">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === TabType.CABEAMENTO && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/80 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider">Ligar Cabeamento</span>
                <button onClick={() => updateConfig({ showWiring: !config.showWiring })} className={`w-14 h-7 rounded-full transition-all relative ${config.showWiring ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${config.showWiring ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Serpentina (Zig-Zag)</span>
                <button onClick={toggleSerpentine} className={`w-14 h-7 rounded-full transition-all relative ${isSerpentine ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isSerpentine ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {orientationButtons.map((btn, idx) => {
                const isActive = config.wiringStartCorner === btn.corner && isVertical === btn.v;
                return (
                  <button key={idx} onClick={() => setOrientation(btn.corner as any, btn.v)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all aspect-square ${isActive ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-xl shadow-blue-500/10 scale-105' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
                    <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{btn.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-950/30 p-5 rounded-3xl border border-blue-900/40 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Canais Necessários</span>
                <span className="text-xs text-blue-500 font-bold opacity-70">Bas: {config.pixelsPerPort.toLocaleString()} px/porta</span>
              </div>
              <span className="text-4xl font-black text-blue-400 italic leading-none">{totalCables}</span>
            </div>
          </div>
        )}

        {activeTab === TabType.FICHA_TECNICA && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
             <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800/80 space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identidade Visual</h3>
                
                <label className="block p-6 border-2 border-dashed border-zinc-800 rounded-2xl text-center cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900/50 transition-all group">
                  {config.logoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={config.logoUrl} className="max-h-16 object-contain rounded shadow-lg" />
                      <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest group-hover:text-orange-300 transition-colors">Substituir Logo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                       <svg className="w-8 h-8 text-zinc-700 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Carregar Logo do Projeto</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                {config.logoUrl && (
                  <div className="space-y-5 py-4 border-t border-zinc-800/50">
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase">
                        <span>Alinhamento Horizontal</span>
                        <span className="text-orange-500 italic">{config.logoPosX}px</span>
                      </div>
                      <input type="range" min="0" max="1200" step="1" value={config.logoPosX} onChange={(e) => updateConfig({ logoPosX: parseInt(e.target.value) })} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase">
                        <span>Alinhamento Vertical</span>
                        <span className="text-orange-500 italic">{config.logoPosY}px</span>
                      </div>
                      <input type="range" min="0" max="650" step="1" value={config.logoPosY} onChange={(e) => updateConfig({ logoPosY: parseInt(e.target.value) })} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase">
                        <span>Tamanho (Zoom)</span>
                        <span className="text-orange-500 italic">{(config.logoScale * 100).toFixed(0)}%</span>
                      </div>
                      <input type="range" min="0.1" max="5" step="0.05" value={config.logoScale} onChange={(e) => updateConfig({ logoScale: parseFloat(e.target.value) })} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2 border-t border-zinc-800/50">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">TÍTULO PRINCIPAL</label>
                     <input type="text" value={config.techSheetTitle} onChange={(e) => updateConfig({ techSheetTitle: e.target.value.toUpperCase() })} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-orange-500 font-black italic" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">SUB-TÍTULO LED</label>
                     <input type="text" value={config.techSheetStatsTitle} onChange={(e) => updateConfig({ techSheetStatsTitle: e.target.value.toUpperCase() })} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-orange-500 font-black italic" />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Sticky Mini Preview at the bottom of the scrollable area */}
        <div className="mt-8 pt-6 border-t border-zinc-900">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visualização Rápida</h3>
              <button 
                onClick={() => updateConfig({ showMiniMap: !config.showMiniMap })}
                className={`p-2 rounded-lg transition-all ${config.showMiniMap ? 'bg-orange-600/10 text-orange-500' : 'bg-zinc-900 text-zinc-600'}`}
              >
                {config.showMiniMap ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                )}
              </button>
           </div>
           {config.showMiniMap && <MiniMapPreview config={config} activeTab={activeTab} mainCanvasRef={mainCanvasRef} />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
