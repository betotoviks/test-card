
import React, { useState, useRef, useCallback } from 'react';
import { ScreenConfig, TabType } from './types';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';

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
    screenName: 'PAINEL LED 01',
    techSheetTitle: 'MAPEAMENTO DE PIXELS',
    techSheetStatsTitle: 'LED SPECS',
    showScaleOverlay: true,
    showUserName: true,
    showSpecs: true,
    showCoords: true,
    color1: '#1e3a8a',
    color2: '#1e40af',
    showBackground: false,
    showWiring: false,
    wiringPattern: 'row-serpentine',
    wiringStartCorner: 'TL',
    panelWatts: 110,
    voltage: 220,
    pixelsPerPort: 655360,
    targetWidthM: 3,
    targetHeightM: 2
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateConfig = (newConfig: Partial<ScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `test-card-${config.screenName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  }, [config.screenName]);

  const handleReset = () => {
    if (confirm('Deseja resetar todas as configurações?')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* Sidebar de Controles */}
      <aside className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0">
        <div className="p-4 border-b border-zinc-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">GC</div>
          <h1 className="font-bold text-sm tracking-tight text-white uppercase">Grid Creator</h1>
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

        <div className="p-4 border-t border-zinc-900 grid grid-cols-2 gap-2">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase transition-colors"
          >
            Resetar
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase transition-all shadow-lg shadow-blue-900/20"
          >
            Exportar PNG
          </button>
        </div>
      </aside>

      {/* Área do Preview */}
      <main className="flex-grow relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden flex items-center justify-center p-8">
        <Preview config={config} canvasRef={canvasRef} />
      </main>
    </div>
  );
};

export default App;
