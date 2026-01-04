
import React, { useEffect } from 'react';
import { ScreenConfig } from '../types';

interface TechSheetPreviewProps {
  config: ScreenConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onRender: (ctx: CanvasRenderingContext2D, cfg: ScreenConfig, isPreview?: boolean) => void;
}

const TechSheetPreview: React.FC<TechSheetPreviewProps> = ({ config, canvasRef, onRender }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a fixed 720p aspect for the professional sheet
    canvas.width = 1280;
    canvas.height = 720;

    onRender(ctx, config, true);
  }, [config, canvasRef, onRender]);

  return (
    <div className="max-w-full max-h-full flex flex-col items-center justify-center p-4">
      <div className="mb-2 text-xs font-bold text-zinc-600 uppercase tracking-widest">Pré-visualização da Ficha Técnica</div>
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-[75vh] shadow-2xl bg-white rounded-sm border-2 border-zinc-400"
      />
      <div className="mt-4 flex gap-4 text-[10px] text-zinc-500 font-medium">
          <span>1280 x 720 px</span>
          <span>•</span>
          <span>PNG de Alta Resolução</span>
      </div>
    </div>
  );
};

export default TechSheetPreview;
