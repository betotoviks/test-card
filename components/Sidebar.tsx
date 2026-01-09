
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

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;

  // Cálculos base
  const totalPanels = config.mapWidth * config.mapHeight;
  const totalWidthPx = config.mapWidth * config.panelWidthPx;
  const totalHeightPx = config.mapHeight * config.panelHeightPx;
  const totalPixels = totalWidthPx * totalHeightPx;
  const areaM2 = (config.mapWidth * config.panelWidthMm / 1000) * (config.mapHeight * config.panelHeightMm / 1000);
  const totalWatts = totalPanels * config.panelWatts;
  const totalAmps = (totalWatts / config.voltage).toFixed(2);

  const gcd = calculateGcd(totalWidthPx, totalHeightPx);
  const aspectRatio = gcd > 0 ? `${totalWidthPx / gcd}:${totalHeightPx / gcd}` : '0:0';

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
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Matriz de Painéis</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (n)</label>
                    <input 
                      type="number" 
                      value={config.mapWidth} 
                      onChange={(e) => updateConfig({ mapWidth: Math.max(1, parseInt(e.target.value) || 0) })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (n)</label>
                    <input 
                      type="number" 
                      value={config.mapHeight} 
                      onChange={(e) => updateConfig({ mapHeight: Math.max(1, parseInt(e.target.value) || 0) })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" 
                    />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resolução do Painel (Unitário)</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (px)</label>
                    <input 
                      type="number" 
                      value={config.panelWidthPx} 
                      onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (px)</label>
                    <input 
                      type="number" 
                      value={config.panelHeightPx} 
                      onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
               </div>
            </div>
            
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dimensões Físicas (mm)</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Largura (mm)</label>
                    <input 
                      type="number" 
                      value={config.panelWidthMm} 
                      onChange={(e) => updateConfig({ panelWidthMm: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1 uppercase font-bold">Altura (mm)</label>
                    <input 
                      type="number" 
                      value={config.panelHeightMm} 
                      onChange={(e) => updateConfig({ panelHeightMm: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                    />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === TabType.CALCULO && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest">Parâmetros Elétricos</h2>
            
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-zinc-500 uppercase">Voltagem (V)</label>
              <div className="grid grid-cols-3 gap-2">
                {[110, 220, 380].map(v => (
                  <button 
                    key={v}
                    onClick={() => updateConfig({ voltage: v })}
                    className={`py-2 text-xs font-bold rounded border transition-all ${config.voltage === v ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
                  >
                    {v}V
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
               {[
                 { label: 'Total de Placas', value: totalPanels, unit: 'UN' },
                 { label: 'Resolução Total', value: `${totalWidthPx}x${totalHeightPx}`, unit: 'PX' },
                 { label: 'Área Total', value: areaM2.toFixed(2), unit: 'm²' },
                 { label: 'Aspect Ratio', value: aspectRatio, unit: '' },
                 { label: 'Consumo Est. (' + config.voltage + 'V)', value: totalAmps, unit: 'A' },
               ].map((item, i) => (
                 <div key={i} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{item.label}</span>
                    <span className="text-sm font-mono font-bold text-white">{item.value} {item.unit}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === TabType.SOBREPOSICAO && (
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4 animate-in fade-in duration-300">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visibilidade</h3>
            {[
              { label: 'Coordenadas (ID)', key: 'showCoords' },
              { label: 'Mira e Escala', key: 'showScaleOverlay' },
              { label: 'Info Bar (Bottom)', key: 'showSpecs' },
              { label: 'Nome da Tela', key: 'showUserName' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
                <input 
                  type="checkbox" 
                  checked={(config as any)[item.key]} 
                  onChange={(e) => updateConfig({ [item.key]: e.target.checked })} 
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-blue-600 focus:ring-blue-500" 
                />
              </div>
            ))}
            
            {config.showUserName && (
              <div className="pt-2">
                <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1">Texto da Identificação</label>
                <input 
                  type="text" 
                  value={config.screenName} 
                  onChange={(e) => updateConfig({ screenName: e.target.value })} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500" 
                />
              </div>
            )}
          </div>
        )}

        {activeTab === TabType.COR && (
           <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                <div className="space-y-2">
                   <label className="block text-[10px] text-zinc-500 uppercase font-bold">Cor A</label>
                   <div className="flex gap-2">
                    <input type="color" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer" />
                    <input type="text" value={config.color1} onChange={(e) => updateConfig({ color1: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-2 text-xs font-mono text-white uppercase" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] text-zinc-500 uppercase font-bold">Cor B</label>
                   <div className="flex gap-2">
                    <input type="color" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="w-10 h-10 rounded bg-transparent border-none p-0 cursor-pointer" />
                    <input type="text" value={config.color2} onChange={(e) => updateConfig({ color2: e.target.value })} className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-2 text-xs font-mono text-white uppercase" />
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
