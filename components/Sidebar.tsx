
import React from 'react';
import { ScreenConfig, TabType } from '../types';

interface SidebarProps {
  config: ScreenConfig;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  updateConfig: (newConfig: Partial<ScreenConfig>) => void;
  onExport: () => void;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, activeTab, setActiveTab, updateConfig }) => {
  const TabButton = ({ type }: { type: TabType }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-2 py-3 text-[10px] font-bold rounded transition-all uppercase tracking-tighter border border-zinc-900 ${
        activeTab === type ? 'bg-zinc-800 text-blue-400 border-blue-500/50' : 'bg-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
      }`}
    >
      {type}
    </button>
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  const totalPanels = config.mapWidth * config.mapHeight;
  const totalWidthPx = config.mapWidth * config.panelWidthPx;
  const totalHeightPx = config.mapHeight * config.panelHeightPx;
  const totalPixels = totalWidthPx * totalHeightPx;
  const areaM2 = (config.mapWidth * config.panelWidthMm / 1000) * (config.mapHeight * config.panelHeightMm / 1000);
  
  const totalWatts = totalPanels * config.panelWatts;
  const totalKw = totalWatts / 1000;
  const totalKva = totalKw / 0.8; 
  const totalAmps = (totalWatts / config.voltage).toFixed(2);
  
  // Logic for Port Calculation (Must match Preview logic)
  const pixelsPerPanel = config.panelWidthPx * config.panelHeightPx;
  const totalPorts = (() => {
    // Basic logic: if flow is column based, calculate ports based on full columns
    // if row based, based on full rows. This matches the 'strip-based' logic in Preview.
    const isColFlow = config.wiringPattern.startsWith('col');
    const stripSize = isColFlow ? config.mapHeight : config.mapWidth;
    const pixelsPerStrip = stripSize * pixelsPerPanel;
    
    let ports = 1;
    let currentPortPixels = 0;
    const numStrips = isColFlow ? config.mapWidth : config.mapHeight;

    for (let i = 0; i < numStrips; i++) {
      if (currentPortPixels > 0 && currentPortPixels + pixelsPerStrip > config.pixelsPerPort) {
        ports++;
        currentPortPixels = 0;
      }
      currentPortPixels += pixelsPerStrip;
    }
    return ports;
  })();

  const totalWeight = (totalPanels * config.panelWeightKg).toFixed(1);
  const gcd = calculateGcd(totalWidthPx, totalHeightPx);
  const aspectRatio = gcd > 0 ? `${totalWidthPx / gcd}:${totalHeightPx / gcd}` : '0:0';

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const updateMapWidthFromMeters = (m: number) => {
    const panels = Math.max(1, Math.round((m * 1000) / config.panelWidthMm));
    updateConfig({ targetWidthM: m, mapWidth: panels });
  };

  const updateMapHeightFromMeters = (m: number) => {
    const panels = Math.max(1, Math.round((m * 1000) / config.panelHeightMm));
    updateConfig({ targetHeightM: m, mapHeight: panels });
  };

  const updateMapWidthFromPanels = (n: number) => {
    const meters = (n * config.panelWidthMm) / 1000;
    updateConfig({ mapWidth: n, targetWidthM: meters });
  };

  const updateMapHeightFromPanels = (n: number) => {
    const meters = (n * config.panelHeightMm) / 1000;
    updateConfig({ mapHeight: n, targetHeightM: meters });
  };

  const predefinedSizes = [
    { w: 128, h: 128, mmW: 500, mmH: 500 },
    { w: 168, h: 168, mmW: 500, mmH: 500 },
    { w: 192, h: 192, mmW: 500, mmH: 500 },
    { w: 128, h: 256, mmW: 500, mmH: 1000 },
    { w: 168, h: 336, mmW: 500, mmH: 1000 }
  ];

  const colorPresets = [
    { name: 'Azul', c1: '#1e3a8a', c2: '#1e40af' },
    { name: 'Verde', c1: '#064e3b', c2: '#065f46' },
    { name: 'Laranja', c1: '#7c2d12', c2: '#9a3412' },
    { name: 'Vermelho', c1: '#7f1d1d', c2: '#991b1b' },
    { name: 'Roxo', c1: '#4c1d95', c2: '#5b21b6' },
    { name: 'Ciano', c1: '#164e63', c2: '#155e75' },
    { name: 'Cinza', c1: '#18181b', c2: '#27272a' },
    { name: 'Ouro', c1: '#78350f', c2: '#92400e' },
  ];

  const wiringPatterns = [
    // TL - Top Left
    { id: 'row-serpentine', start: 'TL', icon: '⇄', label: 'TL H' },
    { id: 'col-serpentine', start: 'TL', icon: '⇅', label: 'TL V' },
    // TR - Top Right
    { id: 'row-serpentine', start: 'TR', icon: '⇄', label: 'TR H' },
    { id: 'col-serpentine', start: 'TR', icon: '⇅', label: 'TR V' },
    // BL - Bottom Left
    { id: 'row-serpentine', start: 'BL', icon: '⇄', label: 'BL H' },
    { id: 'col-serpentine', start: 'BL', icon: '⇅', label: 'BL V' },
    // BR - Bottom Right
    { id: 'row-serpentine', start: 'BR', icon: '⇄', label: 'BR H' },
    { id: 'col-serpentine', start: 'BR', icon: '⇅', label: 'BR V' },
  ];

  const handleSizePreset = (size: typeof predefinedSizes[0]) => {
    const newMapWidth = Math.max(1, Math.round((config.targetWidthM * 1000) / size.mmW));
    const newMapHeight = Math.max(1, Math.round((config.targetHeightM * 1000) / size.mmH));
    
    updateConfig({
      panelWidthPx: size.w,
      panelHeightPx: size.h,
      panelWidthMm: size.mmW,
      panelHeightMm: size.mmH,
      mapWidth: newMapWidth,
      mapHeight: newMapHeight
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-1">
        <TabButton type={TabType.TAMANHO} />
        <TabButton type={TabType.SOBREPOSICAO} />
        <TabButton type={TabType.COR} />
        <TabButton type={TabType.CALCULO} />
        <TabButton type={TabType.CABEAMENTO} />
        <TabButton type={TabType.FICHA_TECNICA} />
      </div>

      <div className="space-y-4">
        {activeTab === TabType.TAMANHO && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tamanho por Placa</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (N)</label>
                    <input 
                      type="number" 
                      value={config.mapWidth} 
                      onChange={(e) => updateMapWidthFromPanels(Math.max(1, parseInt(e.target.value) || 0))} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (N)</label>
                    <input 
                      type="number" 
                      value={config.mapHeight} 
                      onChange={(e) => updateMapHeightFromPanels(Math.max(1, parseInt(e.target.value) || 0))} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-bold" 
                    />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tamanho por Metro</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (M)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={config.targetWidthM} 
                      onChange={(e) => updateMapWidthFromMeters(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (M)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={config.targetHeightM} 
                      onChange={(e) => updateMapHeightFromMeters(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-bold" 
                    />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Configuração do Painel</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (PX)</label>
                  <input type="number" value={config.panelWidthPx} onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (PX)</label>
                  <input type="number" value={config.panelHeightPx} onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (MM)</label>
                  <input type="number" value={config.panelWidthMm} onChange={(e) => updateConfig({ panelWidthMm: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (MM)</label>
                  <input type="number" value={config.panelHeightMm} onChange={(e) => updateConfig({ panelHeightMm: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Peso p/ Placa (KG)</label>
                  <input type="number" step="0.1" value={config.panelWeightKg} onChange={(e) => updateConfig({ panelWeightKg: parseFloat(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Watts p/ Placa (W)</label>
                  <input type="number" value={config.panelWatts} onChange={(e) => updateConfig({ panelWatts: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tamanhos Pré-definidos</h3>
              <div className="grid grid-cols-3 gap-2">
                {predefinedSizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSizePreset(size)}
                    className={`p-2 text-[10px] font-bold rounded border transition-all ${
                      config.panelWidthPx === size.w && config.panelHeightPx === size.h
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {size.w}×{size.h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.CALCULO && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Análise de Dados</h2>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
              <h3 className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-2">Resumo de Cálculos</h3>
              <div className="space-y-2">
                {[
                  { label: 'Total de Cabos / Portas', value: totalPorts, unit: '' },
                  { label: 'Total de Placas', value: totalPanels, unit: '' },
                  { label: 'Resolução Total', value: `${totalWidthPx} x ${totalHeightPx}`, unit: 'PX' },
                  { label: 'Total de Pixels', value: formatNumber(totalPixels), unit: '' },
                  { label: 'Área Total (m²)', value: areaM2.toFixed(2), unit: 'M²' },
                  { label: 'Aspect Ratio', value: aspectRatio, unit: '' },
                  { label: 'Potência Real (KW)', value: totalKw.toFixed(2), unit: 'KW' },
                  { label: 'Potência Sugerida (KVA)', value: totalKva.toFixed(2), unit: 'KVA' },
                  { label: 'Consumo Total (220V)', value: totalAmps, unit: 'A' },
                  { label: 'Peso Total do Painel', value: totalWeight, unit: 'KG' },
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-950/50 border border-zinc-800/40 p-3 rounded-lg flex flex-col group hover:border-zinc-700 transition-all">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">{item.label}</span>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-white italic tracking-tight">{item.value}</span>
                      <span className="text-[8px] font-bold text-zinc-600 uppercase">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.COR && (
           <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paleta do Mapa</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                     <label className="block text-[9px] text-zinc-500 uppercase font-bold">Principal</label>
                     <div className="flex gap-2">
                      <input type="color" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer" />
                      <input type="text" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 text-[10px] font-mono text-white uppercase tracking-widest outline-none" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[9px] text-zinc-500 uppercase font-bold">Secundária</label>
                     <div className="flex gap-2">
                      <input type="color" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer" />
                      <input type="text" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 text-[10px] font-mono text-white uppercase tracking-widest outline-none" />
                     </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-800/50">
                    <label className="block text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Cores Pré-definidas</label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateConfig({ color1: preset.c1, color2: preset.c2 })}
                          className="group flex flex-col items-center gap-1.5"
                          title={preset.name}
                        >
                          <div className="w-full aspect-square rounded-lg border border-zinc-800 overflow-hidden flex transform group-hover:scale-105 transition-transform shadow-lg">
                             <div style={{ backgroundColor: preset.c1 }} className="w-1/2 h-full" />
                             <div style={{ backgroundColor: preset.c2 }} className="w-1/2 h-full" />
                          </div>
                          <span className="text-[7px] font-bold text-zinc-600 uppercase group-hover:text-zinc-400 transition-colors">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
           </div>
        )}

        {activeTab === TabType.CABEAMENTO && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Exibir Ligação Elétrica</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={config.showWiring} onChange={(e) => updateConfig({ showWiring: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CONEXÃO DE GABINETE</h3>
              <div className="grid grid-cols-4 gap-2">
                {wiringPatterns.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => updateConfig({ wiringPattern: p.id as any, wiringStartCorner: p.start as any })} 
                    className={`aspect-square flex flex-col items-center justify-center rounded border transition-all ${config.wiringPattern === p.id && config.wiringStartCorner === p.start ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300'}`}
                    title={p.label}
                  >
                    <span className="text-xl leading-none">{p.icon}</span>
                    <span className="text-[7px] font-black mt-1 uppercase opacity-60">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LIMITE POR PORTA</h3>
              <div className="flex gap-2">
                <div className="flex-grow relative">
                  <input type="number" value={config.pixelsPerPort} onChange={(e) => updateConfig({ pixelsPerPort: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono" />
                  <span className="absolute right-3 top-2.5 text-[10px] text-zinc-600 font-bold tracking-tighter">PX</span>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">TOTAL DE CABOS / PORTAS</span>
                <span className="text-2xl font-black text-blue-500 italic">{totalPorts}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.SOBREPOSICAO && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identidade Visual</h3>
               <div className="space-y-3">
                 <label className="block p-3 border-2 border-dashed border-zinc-800 rounded-lg text-center cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900 transition-all">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Upload de Logotipo</span>
                    <span className="text-[9px] text-zinc-600 block leading-tight">Arraste ou clique para carregar o logo BT</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                 </label>
               </div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ativos da Tela</h3>
              {[
                { label: 'Coordenadas (ID)', key: 'showCoords' },
                { label: 'Mira e Escala', key: 'showScaleOverlay' },
                { label: 'Info Bar (Estatísticas)', key: 'showSpecs' },
                { label: 'Nome no Preview', key: 'showUserName' }
              ].map(item => (
                <div key={item.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">{item.label}</span>
                    <input type="checkbox" checked={(config as any)[item.key]} onChange={(e) => updateConfig({ [item.key]: e.target.checked })} className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-blue-500" />
                  </div>
                  {item.key === 'showUserName' && config.showUserName && (
                    <input type="text" value={config.screenName} onChange={(e) => updateConfig({ screenName: e.target.value.toUpperCase() })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white uppercase focus:border-blue-500 outline-none" placeholder="NOME DO PAINEL" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === TabType.FICHA_TECNICA && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Personalizar Ficha</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Título Principal</label>
                    <input type="text" value={config.techSheetTitle} onChange={(e) => updateConfig({ techSheetTitle: e.target.value.toUpperCase() })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Título Stats</label>
                    <input type="text" value={config.techSheetStatsTitle} onChange={(e) => updateConfig({ techSheetStatsTitle: e.target.value.toUpperCase() })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white" />
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
