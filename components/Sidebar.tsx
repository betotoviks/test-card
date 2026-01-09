
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
  const areaM2 = (config.mapWidth * config.panelWidthMm / 1000) * (config.mapHeight * config.panelHeightMm / 1000);
  
  // Power calculations
  const totalWatts = totalPanels * config.panelWatts;
  const totalKw = totalWatts / 1000;
  const totalKva = totalKw / 0.85; // Assuming 0.85 power factor for LED power supplies
  const totalAmps = (totalWatts / config.voltage).toFixed(2);
  
  const totalWeight = (totalPanels * config.panelWeightKg).toFixed(1);
  const gcd = calculateGcd(totalWidthPx, totalHeightPx);
  const aspectRatio = gcd > 0 ? `${totalWidthPx / gcd}:${totalHeightPx / gcd}` : '0:0';

  // Helpers de sincronização
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
    { w: 128, h: 128 },
    { w: 168, h: 168 },
    { w: 192, h: 192 },
    { w: 128, h: 256 },
    { w: 168, h: 336 },
  ];

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
            {/* Seção: Tamanho por Placa */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4 shadow-sm">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 Tamanho por Placa
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (N)</label>
                    <input 
                      type="number" 
                      value={config.mapWidth} 
                      onChange={(e) => updateMapWidthFromPanels(Math.max(1, parseInt(e.target.value) || 0))} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (N)</label>
                    <input 
                      type="number" 
                      value={config.mapHeight} 
                      onChange={(e) => updateMapHeightFromPanels(Math.max(1, parseInt(e.target.value) || 0))} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
               </div>
            </div>

            {/* Seção: Tamanho por Metro */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4 shadow-sm">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 Tamanho por Metro
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (M)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={config.targetWidthM} 
                      onChange={(e) => updateMapWidthFromMeters(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (M)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={config.targetHeightM} 
                      onChange={(e) => updateMapHeightFromMeters(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
               </div>
            </div>

            {/* Seção: Configuração do Painel */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 Configuração do Painel
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (PX)</label>
                    <input 
                      type="number" 
                      value={config.panelWidthPx} 
                      onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (PX)</label>
                    <input 
                      type="number" 
                      value={config.panelHeightPx} 
                      onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (MM)</label>
                    <input 
                      type="number" 
                      value={config.panelWidthMm} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateConfig({ panelWidthMm: val });
                        updateMapWidthFromPanels(config.mapWidth);
                      }} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (MM)</label>
                    <input 
                      type="number" 
                      value={config.panelHeightMm} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateConfig({ panelHeightMm: val });
                        updateMapHeightFromPanels(config.mapHeight);
                      }} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Peso por Placa (KG)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={config.panelWeightKg} 
                      onChange={(e) => updateConfig({ panelWeightKg: parseFloat(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
               </div>
            </div>

            {/* Seção: Tamanhos Pré-definidos */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tamanhos Pré-definidos</h3>
              <div className="grid grid-cols-3 gap-2">
                {predefinedSizes.map((size, idx) => {
                  const isActive = config.panelWidthPx === size.w && config.panelHeightPx === size.h;
                  return (
                    <button
                      key={idx}
                      onClick={() => updateConfig({ panelWidthPx: size.w, panelHeightPx: size.h })}
                      className={`py-2 text-[10px] font-bold rounded border transition-all ${
                        isActive 
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {size.w}×{size.h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === TabType.SOBREPOSICAO && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4 shadow-sm">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identidade Visual</h3>
               <div className="space-y-3">
                 <label className="block p-3 border-2 border-dashed border-zinc-800 rounded-lg text-center cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900 transition-all">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Upload de Logotipo</span>
                    <span className="text-[9px] text-zinc-600 block leading-tight">Arraste ou clique para carregar o logo BT</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                 </label>
                 {config.logoUrl && (
                   <button 
                     onClick={() => updateConfig({ logoUrl: null })}
                     className="w-full py-1 text-[9px] font-bold text-red-500 uppercase"
                   >
                     Remover Logo
                   </button>
                 )}
               </div>
               
               <div className="pt-2">
                <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Identificação do Painel</label>
                <input 
                  type="text" 
                  value={config.screenName} 
                  onChange={(e) => updateConfig({ screenName: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500 font-mono" 
                  placeholder="EX: PAINEL PALCO DIREITO"
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest tracking-widest">Ativos da Tela</h3>
              {[
                { label: 'Coordenadas (ID)', key: 'showCoords' },
                { label: 'Mira e Escala', key: 'showScaleOverlay' },
                { label: 'Info Bar (Estatísticas)', key: 'showSpecs' },
                { label: 'Nome no Preview', key: 'showUserName' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">{item.label}</span>
                  <input 
                    type="checkbox" 
                    checked={(config as any)[item.key]} 
                    onChange={(e) => updateConfig({ [item.key]: e.target.checked })} 
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-blue-500 transition-all" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === TabType.CALCULO && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest italic">Análise de Dados</h2>
            
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Tensão da Rede</label>
              <div className="grid grid-cols-3 gap-2">
                {[110, 220, 380].map(v => (
                  <button 
                    key={v}
                    onClick={() => updateConfig({ voltage: v })}
                    className={`py-2 text-[10px] font-bold rounded border transition-all ${config.voltage === v ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {v}V
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
               {[
                 { label: 'Total de Placas', value: totalPanels, unit: 'UN' },
                 { label: 'Total de Pixels', value: `${totalWidthPx}x${totalHeightPx}`, unit: 'PX' },
                 { label: 'Área Total', value: areaM2.toFixed(2), unit: 'm²' },
                 { label: 'Potência Real', value: totalKw.toFixed(2), unit: 'kW' },
                 { label: 'Consumo Total', value: totalKva.toFixed(2), unit: 'kVA' },
                 { label: 'Amperagem Total', value: totalAmps, unit: 'A' },
                 { label: 'Peso Estimado', value: totalWeight, unit: 'KG' },
                 { label: 'Aspect Ratio', value: aspectRatio, unit: '' },
               ].map((item, i) => (
                 <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg flex justify-between items-center group hover:border-zinc-700 transition-all">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-white tracking-widest">{item.value} {item.unit}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === TabType.COR && (
           <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paleta do Mapa</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                     <label className="block text-[9px] text-zinc-500 uppercase font-bold">Principal</label>
                     <div className="flex gap-2">
                      <input type="color" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer overflow-hidden shadow-inner" />
                      <input type="text" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 text-[10px] font-mono text-white uppercase tracking-widest outline-none focus:border-blue-500" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[9px] text-zinc-500 uppercase font-bold">Secundária</label>
                     <div className="flex gap-2">
                      <input type="color" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer overflow-hidden shadow-inner" />
                      <input type="text" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 text-[10px] font-mono text-white uppercase tracking-widest outline-none focus:border-blue-500" />
                     </div>
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
