
import React, { useRef } from 'react';
import { ScreenConfig, TabType } from '../types';

interface SidebarProps {
  config: ScreenConfig;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  updateConfig: (newConfig: Partial<ScreenConfig>) => void;
  onExport: () => void;
  onExportTechSheet: () => void;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, activeTab, setActiveTab, updateConfig, onExport, onExportTechSheet, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalPanels = config.mapWidth * config.mapHeight;
  const screenWidth = config.mapWidth * config.panelWidthPx;
  const screenHeight = config.mapHeight * config.panelHeightPx;
  const totalPixels = screenWidth * screenHeight;

  const totalPowerWatts = totalPanels * (config.panelWatts || 0);
  const totalKva = (totalPowerWatts / 0.8) / 1000;
  const totalAmps = totalPanels * (config.panelAmps || 0);

  const handleWattsChange = (watts: number) => {
    const v = config.voltage || 220;
    updateConfig({
      panelWatts: watts,
      panelAmps: parseFloat((watts / v).toFixed(3))
    });
  };

  const handleVoltageChange = (newVoltage: number) => {
    const watts = config.panelWatts || 0;
    updateConfig({
      voltage: newVoltage,
      panelAmps: parseFloat((watts / newVoltage).toFixed(3))
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logoUrl: reader.result as string, showLogo: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateConfig({ logoUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveLogo = (dx: number, dy: number) => {
    updateConfig({
      logoX: Math.max(0, config.logoX + dx),
      logoY: Math.max(0, config.logoY + dy)
    });
  };

  const calculateGcd = (a: number, b: number): number => b ? calculateGcd(b, a % b) : a;
  
  function numeratorPx() { return config.mapWidth * config.panelWidthPx; }
  function denominatorPx() { 
    return config.mapHeight * config.panelHeightPx;
  }

  const commonDivisor = calculateGcd(numeratorPx(), denominatorPx());
  const aspectRatio = `${numeratorPx() / commonDivisor}:${denominatorPx() / commonDivisor}`;

  const getTabTitle = () => activeTab;

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

  const LogoSection = () => (
    <div className="pt-4 mt-4 border-t border-zinc-800">
      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 tracking-wider">Importar Logotipo</p>
      <div className="flex flex-col gap-3">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*" 
          onChange={handleLogoUpload} 
          className="hidden" 
          id="logo-upload"
        />
        <label 
          htmlFor="logo-upload"
          className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 border border-zinc-700 border-dashed rounded-lg cursor-pointer hover:bg-zinc-700 hover:border-blue-500 transition-all text-xs font-medium text-zinc-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" />
          </svg>
          Carregar imagem (.png, .jpg)
        </label>
        
        {config.logoUrl && (
          <>
            <div className="flex items-center gap-3 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
              <img src={config.logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-zinc-900 rounded border border-zinc-700" />
              <div className="flex-grow">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Logo Atual</p>
                <button 
                  onClick={removeLogo}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  Remover logotipo
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Posicionamento</label>
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-1">
                    <div />
                    <button onClick={() => moveLogo(0, -10)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <div />
                    <button onClick={() => moveLogo(-10, 0)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => updateConfig({ logoX: 640 - config.logoSize/2, logoY: 360 - config.logoSize/2 })} className="p-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold flex items-center justify-center">
                      MID
                    </button>
                    <button onClick={() => moveLogo(10, 0)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div />
                    <button onClick={() => moveLogo(0, 10)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const CalculationSummary = () => (
    <div className="space-y-3 pt-4 border-t border-zinc-800 mt-6">
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Resumo de Cálculos</p>
      <div className="grid grid-cols-1 gap-2">
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total de Painéis</p>
          <p className="text-lg font-mono text-white">{totalPanels}</p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Resolução Total</p>
          <p className="text-lg font-mono text-white">{screenWidth} × {screenHeight} <span className="text-xs text-zinc-400">px</span></p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Total de Pixels</p>
          <p className="text-lg font-mono text-white">{totalPixels.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Proporção (Aspect Ratio)</p>
          <p className="text-lg font-mono text-white">{aspectRatio}</p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Consumo em Amperagem</p>
          <p className="text-lg font-mono text-white">{totalAmps.toFixed(2)} <span className="text-xs text-zinc-400">A</span></p>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Resultado em kVA (FP 0.8)</p>
          <p className="text-lg font-mono text-white">{totalKva.toFixed(2)} <span className="text-xs text-zinc-400">kVA</span></p>
        </div>
      </div>
    </div>
  );

  const wiringPatterns = [
    { id: '1', pattern: 'row-serpentine', corner: 'TL', svg: <path d="M4 6h16v6H4v6h16" /> },
    { id: '2', pattern: 'col-serpentine', corner: 'TL', svg: <path d="M6 4v16h6V4h6v16" /> },
    { id: '3', pattern: 'row-straight', corner: 'TL', svg: <path d="M4 6h16M4 12h16M4 18h16" /> },
    { id: '4', pattern: 'col-straight', corner: 'TL', svg: <path d="M6 4v16M12 4v16M18 4v16" /> },
    { id: '5', pattern: 'row-serpentine', corner: 'TR', svg: <path d="M20 6H4v6h16v6H4" /> },
    { id: '6', pattern: 'col-serpentine', corner: 'BL', svg: <path d="M6 20V4h6v16h6V4" /> },
    { id: '7', pattern: 'row-serpentine', corner: 'BL', svg: <path d="M4 18h16v-6H4V6h16" /> },
    { id: '8', pattern: 'col-serpentine', corner: 'BR', svg: <path d="M18 20V4h-6v16H6V4" /> },
  ];

  const PredefinedSizes = () => {
    const sizes = [
      { name: '128x128', pxW: 128, pxH: 128, mmW: 500, mmH: 500 },
      { name: '168x168', pxW: 168, pxH: 168, mmW: 500, mmH: 500 },
      { name: '192x192', pxW: 192, pxH: 192, mmW: 500, mmH: 500 },
      { name: '128x256', pxW: 128, pxH: 256, mmW: 500, mmH: 1000 },
      { name: '168x336', pxW: 168, pxH: 336, mmW: 500, mmH: 1000 },
    ];

    return (
      <div className="pt-4 mt-4 border-t border-zinc-800">
        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 tracking-wider">Tamanhos pré-definidos</p>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <button
              key={s.name}
              onClick={() => updateConfig({
                panelWidthPx: s.pxW,
                panelHeightPx: s.pxH,
                panelWidthMm: s.mmW,
                panelHeightMm: s.mmH
              })}
              className={`py-2 px-1 text-[10px] font-bold rounded border transition-all ${
                config.panelWidthPx === s.pxW && config.panelHeightPx === s.pxH
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        <TabButton type={TabType.TAMANHO} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>} />
        <TabButton type={TabType.SOBREPOSICAO} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        <TabButton type={TabType.COR} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} />
        <TabButton type={TabType.CALCULO} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2v14a2 2 0 002 2z" /></svg>} />
        <TabButton type={TabType.FIACAO} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <TabButton type={TabType.FICHA_TECNICA} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
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
                  <input type="number" value={config.mapWidth === 0 ? '' : config.mapWidth} onChange={(e) => updateConfig({ mapWidth: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura do mapa (n)</label>
                  <input type="number" value={config.mapHeight === 0 ? '' : config.mapHeight} onChange={(e) => updateConfig({ mapHeight: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Largura do painel (px)</label>
                  <input type="number" value={config.panelWidthPx === 0 ? '' : config.panelWidthPx} onChange={(e) => updateConfig({ panelWidthPx: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura do painel (px)</label>
                  <input type="number" value={config.panelHeightPx === 0 ? '' : config.panelHeightPx} onChange={(e) => updateConfig({ panelHeightPx: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Largura física (mm)</label>
                  <input type="number" value={config.panelWidthMm === 0 ? '' : config.panelWidthMm} onChange={(e) => updateConfig({ panelWidthMm: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Altura física (mm)</label>
                  <input type="number" value={config.panelHeightMm === 0 ? '' : config.panelHeightMm} onChange={(e) => updateConfig({ panelHeightMm: parseInt(e.target.value) || 0 })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo de painel</label>
                <input type="text" placeholder="Tipos de painéis de filtro..." value={config.panelType} onChange={(e) => updateConfig({ panelType: e.target.value })} className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white" />
              </div>

              <PredefinedSizes />
            </>
          )}

          {activeTab === TabType.COR && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Cor Principal</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{config.color1}</span>
                  </div>
                  <input 
                    type="color" 
                    value={config.color1} 
                    onChange={(e) => updateConfig({ color1: e.target.value })} 
                    className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border-none p-0 overflow-hidden"
                  />
                </div>
                
                <div className="flex items-center justify-between gap-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Cor Secundária</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{config.color2}</span>
                  </div>
                  <input 
                    type="color" 
                    value={config.color2} 
                    onChange={(e) => updateConfig({ color2: e.target.value })} 
                    className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border-none p-0 overflow-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => updateConfig({ color1: '#000350', color2: '#00f4ff' })}
                  className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase rounded-lg transition-colors"
                >
                  Padrão
                </button>
                <button 
                  onClick={() => updateConfig({ color1: config.color2, color2: config.color1 })}
                  className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase rounded-lg transition-colors"
                >
                  Inverter
                </button>
              </div>
            </div>
          )}

          {activeTab === TabType.FIACAO && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Exibir Ligação Elétrica</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.showWiring} onChange={(e) => updateConfig({ showWiring: e.target.checked })} />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {config.showWiring && (
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-inner">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 tracking-widest">Conexão de Gabinete</p>
                    <div className="grid grid-cols-4 gap-2">
                      {wiringPatterns.map((wp) => (
                        <button
                          key={wp.id}
                          onClick={() => updateConfig({ wiringPattern: wp.pattern as any, wiringStartCorner: wp.corner as any })}
                          className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                            config.wiringPattern === wp.pattern && config.wiringStartCorner === wp.corner
                              ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {wp.svg}
                          </svg>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Limite por Porta</p>
                        <p className="text-sm font-mono text-blue-400">655.360 <span className="text-[10px] text-zinc-500 uppercase">px</span></p>
                      </div>
                      <button 
                        onClick={() => updateConfig({ showWiring: false })}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-rose-900/30 transition-all border border-zinc-700 group-hover:border-rose-500/50">
                          <svg className="w-5 h-5 text-zinc-500 group-hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase group-hover:text-rose-400 tracking-tighter">Desconectar</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                     <p className="text-[10px] text-blue-300 leading-tight">
                        A fiação é calculada automaticamente respeitando o limite de pixels por porta do processador (655.360px). Novas cores de cabo são usadas para cada porta necessária.
                     </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === TabType.FICHA_TECNICA && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Título da Ficha</label>
                <input type="text" value={config.techSheetTitle} onChange={(e) => updateConfig({ techSheetTitle: e.target.value })} className="w-full border-2 border-dashed border-blue-500 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-zinc-800 text-white outline-none" placeholder="Ex: Pixel mapping" />
              </div>
              <LogoSection />
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 mt-6 rounded-lg">
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">Esta aba permite visualizar o layout final da Ficha Técnica antes da exportação. Todas as informações do projeto serão incluídas no documento.</p>
                <button onClick={onExportTechSheet} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Baixar Ficha Técnica
                </button>
              </div>
            </div>
          )}

          {activeTab === TabType.CALCULO && (
            <div className="space-y-4">
              <div className="space-y-3 mb-6 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Parâmetros de Entrada</p>
                <div className="mb-4">
                  <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase">Voltagem da Rede (V)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[110, 220, 380].map((v) => (
                      <button key={v} onClick={() => handleVoltageChange(v)} className={`py-1.5 px-2 text-xs font-bold rounded border transition-all ${config.voltage === v ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}>{v}V</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase">Watts p/ Placa</label>
                    <input type="number" value={config.panelWatts === 0 ? '' : config.panelWatts} onChange={(e) => handleWattsChange(parseFloat(e.target.value) || 0)} className="w-full border border-zinc-800 rounded px-2 py-1.5 text-xs bg-zinc-900 text-white focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              
              <CalculationSummary />
            </div>
          )}

          {activeTab === TabType.SOBREPOSICAO && (
            <div className="space-y-4">
              {[{ label: 'Mostrar coordenadas do painel', key: 'showCoords' }, { label: 'Exibir sobreposição de escala', key: 'showScaleOverlay' }, { label: 'Exibir nome de usuário', key: 'showUserName' }, { label: 'Mostrar especificações', key: 'showSpecs' }, { label: 'Mostrar logotipo', key: 'showLogo' }].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={(config as any)[item.key]} onChange={(e) => updateConfig({ [item.key]: e.target.checked })} />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={onExport} className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar imagem da tela
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
