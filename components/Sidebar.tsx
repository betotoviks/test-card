
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

const Sidebar: React.FC<SidebarProps> = ({ config, activeTab, setActiveTab, updateConfig, onExport, onReset }) => {
  const totalPanels = config.mapWidth * config.mapHeight;
  const screenWidth = config.mapWidth * config.panelWidthPx;
  const screenHeight = config.halfHeightRow 
    ? (config.mapHeight - 0.5) * config.panelHeightPx 
    : config.mapHeight * config.panelHeightPx;
  const totalPixels = screenWidth * screenHeight;

  // physical area calculation
  const physicalWidthM = (config.mapWidth * config.panelWidthMm) / 1000;
  const physicalHeightM = config.halfHeightRow 
    ? ((config.mapHeight - 0.5) * config.panelHeightMm) / 1000
    : (config.mapHeight * config.panelHeightMm) / 1000;
  const totalAreaM2 = physicalWidthM * physicalHeightM;

  // Aspect Ratio calculation
  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;
  const commonDivisor = calculateGcd(screenWidth, screenHeight);
  const ratioW = screenWidth / commonDivisor;
  const ratioH = screenHeight / commonDivisor;
  const aspectRatio = `${ratioW}:${ratioH}`;

  const TabButton = ({ type, icon }: { type: TabType, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex flex-col items-center p-2 text-xs font-medium rounded-lg transition-all ${
        activeTab === type ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'text-zinc-500 hover:bg-zinc-900'
      }`}
    >
      {icon}
      <span className="mt-1">{type}</span>
    </button>
  );

  const getTabTitle = () => {
    switch(activeTab) {
        case TabType.TAMANHO: return 'Opções de tamanho';
        case TabType.COR: return 'Opções de cores';
        case TabType.SOBREPOSICAO: return 'Opções de sobreposição';
        case TabType.CALCULO: return 'Cálculos de Painel';
        case TabType.FIACAO: return 'Opções de fiação';
        default: return `Opções de ${activeTab.toLowerCase()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <TabButton 
          type={TabType.TAMANHO} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>} 
        />
        <TabButton 
          type={TabType.PROCESSADOR} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>} 
        />
        <TabButton 
          type={TabType.SOBREPOSICAO} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} 
        />
        <TabButton 
          type={TabType.COR} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} 
        />
        <TabButton 
          type={TabType.CALCULO} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} 
        />
        <TabButton 
          type={TabType.FIACAO} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 text-sm font-semibold text-zinc-200">
          {getTabTitle()}
        </div>
        
        <div className="p-4 space-y-4">
          {activeTab === TabType.TAMANHO && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Largura do mapa (n)</label>
                  <input
                    type="number"
                    value={config.mapWidth}
                    onChange={(e) => updateConfig({ mapWidth: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura do mapa (n)</label>
                  <input
                    type="number"
                    value={config.mapHeight}
                    onChange={(e) => updateConfig({ mapHeight: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Fileira de Meia Altura</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={config.halfHeightRow}
                    onChange={(e) => updateConfig({ halfHeightRow: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Largura do painel (px)</label>
                  <input
                    type="number"
                    value={config.panelWidthPx}
                    onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura do painel (px)</label>
                  <input
                    type="number"
                    value={config.panelHeightPx}
                    onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Largura física (mm)</label>
                  <input
                    type="number"
                    value={config.panelWidthMm}
                    onChange={(e) => updateConfig({ panelWidthMm: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura física (mm)</label>
                  <input
                    type="number"
                    value={config.panelHeightMm}
                    onChange={(e) => updateConfig({ panelHeightMm: parseInt(e.target.value) || 0 })}
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de painel</label>
                <input
                  type="text"
                  placeholder="Tipos de painéis de filtro..."
                  value={config.panelType}
                  onChange={(e) => updateConfig({ panelType: e.target.value })}
                  className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
                />
              </div>

              <div>
                <select 
                    className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-800 text-white"
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'hd') updateConfig({ panelWidthPx: 128, panelHeightPx: 128, panelWidthMm: 500, panelHeightMm: 500 });
                        if (val === 's168') updateConfig({ panelWidthPx: 168, panelHeightPx: 168, panelWidthMm: 500, panelHeightMm: 500 });
                        if (val === 'fhd') updateConfig({ panelWidthPx: 192, panelHeightPx: 192, panelWidthMm: 500, panelHeightMm: 500 });
                        if (val === '128x256') updateConfig({ panelWidthPx: 128, panelHeightPx: 256, panelWidthMm: 500, panelHeightMm: 1000 });
                        if (val === '168x336') updateConfig({ panelWidthPx: 168, panelHeightPx: 336, panelWidthMm: 500, panelHeightMm: 1000 });
                    }}
                >
                  <option value="custom">Tamanho personalizado</option>
                  <option value="hd">Padrão 128x128 (500mm)</option>
                  <option value="128x256">Padrão 128x256 (500x1000mm)</option>
                  <option value="s168">Padrão 168x168 (500mm)</option>
                  <option value="168x336">Padrão 168x336 (500x1000mm)</option>
                  <option value="fhd">Padrão 192x192 (500mm)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === TabType.CALCULO && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total de Painéis</p>
                  <p className="text-xl font-mono text-white">{totalPanels}</p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Resolução Total</p>
                  <p className="text-xl font-mono text-white">{screenWidth} × {screenHeight} <span className="text-sm text-zinc-400">px</span></p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total de Pixels</p>
                  <p className="text-xl font-mono text-white">{totalPixels.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Proporção (Aspect Ratio)</p>
                  <p className="text-xl font-mono text-white">{aspectRatio}</p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Tamanho Largura × Altura (m)</p>
                  <p className="text-xl font-mono text-white">
                    {physicalWidthM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {physicalHeightM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-zinc-400">m</span>
                  </p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 ring-2 ring-blue-500/20">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Tamanho em metros quadrados (m²)</p>
                  <p className="text-xl font-mono text-white">{totalAreaM2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-zinc-400">m²</span></p>
                  <p className="text-[10px] text-zinc-500 mt-1 italic">Dica: Ajuste as dimensões físicas em "Tamanho" para precisão.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === TabType.FIACAO && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300">Exibir fiação da tela</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={config.showWiring}
                    onChange={(e) => updateConfig({ showWiring: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Canto de Início</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'TL', label: 'Topo Esquerda' },
                    { id: 'TR', label: 'Topo Direita' },
                    { id: 'BL', label: 'Base Esquerda' },
                    { id: 'BR', label: 'Base Direita' }
                  ].map((corner) => (
                    <button
                      key={corner.id}
                      onClick={() => updateConfig({ wiringStartCorner: corner.id as any })}
                      className={`py-2 px-2 text-[10px] rounded border transition-all flex items-center justify-between ${
                        config.wiringStartCorner === corner.id 
                          ? 'border-blue-500 bg-blue-600/20 text-blue-400' 
                          : 'border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <span>{corner.label}</span>
                      <span className="font-bold">{corner.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Conexão de Gabinete (Cabinet Connection)</label>
                <div className="grid grid-cols-4 gap-2">
                  {/* Row Serpentine */}
                  <button 
                    onClick={() => updateConfig({ wiringPattern: 'row-serpentine' })}
                    title="Horizontal Serpentine"
                    className={`p-2 rounded border flex items-center justify-center transition-all ${config.wiringPattern === 'row-serpentine' ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                  >
                    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 10h20c2 0 2 6 0 6H6c-2 0-2 6 0 6h20" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 8l4 2-4 2M10 14l-4 2 4 2" fill="#f59e0b" stroke="none" />
                    </svg>
                  </button>

                  {/* Col Serpentine */}
                  <button 
                    onClick={() => updateConfig({ wiringPattern: 'col-serpentine' })}
                    title="Vertical Serpentine"
                    className={`p-2 rounded border flex items-center justify-center transition-all ${config.wiringPattern === 'col-serpentine' ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                  >
                    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10 6v20c0 2 6 2 6 0V6c0-2 6-2 6 0v20" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 22l2 4 2-4M14 10l2-4 2 4" fill="#f59e0b" stroke="none" />
                    </svg>
                  </button>

                  {/* Row Straight (Z-pattern) */}
                  <button 
                    onClick={() => updateConfig({ wiringPattern: 'row-straight' })}
                    title="Horizontal Straight (Z)"
                    className={`p-2 rounded border flex items-center justify-center transition-all ${config.wiringPattern === 'row-straight' ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                  >
                    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 10h20M6 16h20M6 22h20" strokeLinecap="round" />
                      <path d="M22 8l4 2-4 2M22 14l4 2-4 2M22 20l4 2-4 2" fill="#f59e0b" stroke="none" />
                      <path d="M26 10l-4 3M26 16l-4 3" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
                    </svg>
                  </button>

                  {/* Col Straight (N-pattern) */}
                  <button 
                    onClick={() => updateConfig({ wiringPattern: 'col-straight' })}
                    title="Vertical Straight (N)"
                    className={`p-2 rounded border flex items-center justify-center transition-all ${config.wiringPattern === 'col-straight' ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}`}
                  >
                    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10 6v20M16 6v20M22 6v20" strokeLinecap="round" />
                      <path d="M8 22l2 4 2-4M14 22l2 4 2-4M20 22l2 4 2-4" fill="#f59e0b" stroke="none" />
                      <path d="M10 26l3-4M16 26l3-4" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-lg">
                <p className="text-[10px] text-blue-400/80 uppercase font-bold mb-1">Nota Técnica</p>
                <p className="text-xs text-zinc-400 leading-relaxed">A fiação respeita o limite de <span className="text-blue-400 font-mono">655.360</span> pixels por porta/cabo. Se o limite for excedido, a fiação termina na coluna/linha anterior.</p>
              </div>
            </div>
          )}

          {activeTab === TabType.COR && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Cor Primária (A)</label>
                  <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.color1}
                        onChange={(e) => updateConfig({ color1: e.target.value })}
                        className="h-9 w-12 border border-zinc-700 rounded cursor-pointer bg-zinc-800"
                    />
                    <input
                        type="text"
                        value={config.color1.toUpperCase()}
                        onChange={(e) => updateConfig({ color1: e.target.value })}
                        className="flex-1 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 bg-zinc-800 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Cor Secundária (B)</label>
                  <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.color2}
                        onChange={(e) => updateConfig({ color2: e.target.value })}
                        className="h-9 w-12 border border-zinc-700 rounded cursor-pointer bg-zinc-800"
                    />
                    <input
                        type="text"
                        value={config.color2.toUpperCase()}
                        onChange={(e) => updateConfig({ color2: e.target.value })}
                        className="flex-1 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 bg-zinc-800 text-white"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => updateConfig({ color1: '#1c1c1c', color2: '#fcfcfc' })}
                className="w-full text-xs text-blue-400 hover:text-blue-300 font-medium py-1"
              >
                Resetar para cores padrão
              </button>
            </div>
          )}

          {activeTab === TabType.SOBREPOSICAO && (
            <div className="space-y-4">
              {[
                { label: 'Mostrar coordenadas do painel', key: 'showCoords' },
                { label: 'Exibir sobreposição de escala', key: 'showScaleOverlay' },
                { label: 'Exibir nome de usuário', key: 'showUserName' },
                { label: 'Mostrar especificações', key: 'showSpecs' },
                { label: 'Mostrar logotipo', key: 'showLogo' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(config as any)[item.key]}
                      onChange={(e) => updateConfig({ [item.key]: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Nome de Tela</label>
          <input
            type="text"
            value={config.screenName}
            onChange={(e) => updateConfig({ screenName: e.target.value })}
            className="w-full border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white"
            placeholder="Screen 1"
          />
        </div>

        <button 
          onClick={onExport}
          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar imagem da tela
        </button>

        <button 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar tela
        </button>

        <button 
          onClick={onReset}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reiniciar projeto
        </button>

        <button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
        >
          Tamanho real
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
