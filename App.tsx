
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ScreenConfig, TabType } from './types';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';

const App: React.FC = () => {
  const [config, setConfig] = useState<ScreenConfig>({
    mapWidth: 16,
    mapHeight: 9,
    halfHeightRow: false,
    panelWidthPx: 128,
    panelHeightPx: 128,
    panelWidthMm: 500,
    panelHeightMm: 500,
    panelType: 'Paineis de LED',
    screenName: 'Screen 1',
    showScaleOverlay: true,
    showUserName: false,
    showSpecs: false,
    showCoords: false,
    showLogo: false,
    color1: '#1c1c1c',
    color2: '#fcfcfc',
    showWiring: false,
    wiringPattern: 'row-serpentine',
    wiringStartCorner: 'TL'
  });

  const [activeTab, setActiveTab] = useState<TabType>(TabType.TAMANHO);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const resetProject = () => {
    if (confirm('Deseja reiniciar o projeto? Todas as alterações serão perdidas.')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-slate-800">
      {/* Sidebar - Settings */}
      <div className="w-full md:w-96 bg-zinc-950 shadow-xl flex-shrink-0 z-10 overflow-y-auto max-h-screen border-r border-zinc-800 text-zinc-100">
        <div className="p-4 bg-blue-600 text-white flex items-center justify-center gap-2 font-semibold shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Telas
        </div>
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-white">Configurações de tela</h2>
          
          <Sidebar 
            config={config} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            updateConfig={updateConfig} 
            onExport={handleExport}
            onReset={resetProject}
          />
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-grow flex items-center justify-center p-8 bg-gray-300 overflow-hidden relative transition-colors duration-200">
        <div className="relative w-full h-full flex items-center justify-center">
            <Preview config={config} canvasRef={canvasRef} />
        </div>
        
        {/* Floating Zoom Control / Info */}
        <div className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium border border-gray-100">
            {config.mapWidth * config.panelWidthPx} x {config.mapHeight * config.panelHeightPx} px
        </div>
      </div>
    </div>
  );
};

export default App;
