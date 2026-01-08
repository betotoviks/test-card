
export interface ScreenConfig {
  mapWidth: number;
  mapHeight: number;
  panelWidthPx: number;
  panelHeightPx: number;
  panelWidthMm: number;
  panelHeightMm: number;
  panelType: string;
  screenName: string;
  techSheetTitle: string;
  techSheetStatsTitle: string; // New field for the "LED" text editor
  showScaleOverlay: boolean;
  showUserName: boolean;
  showSpecs: boolean;
  showCoords: boolean;
  showLogo: boolean;
  logoUrl?: string; // Propriedade para o logotipo importado
  logoSize: number;
  logoX: number;
  logoY: number;
  color1: string;
  color2: string;
  // Fix: Missing background properties used in App.tsx
  showBackground: boolean;
  backgroundUrl?: string;
  // Wiring Config
  showWiring: boolean;
  wiringPattern: 'row-serpentine' | 'col-serpentine' | 'row-straight' | 'col-straight';
  wiringStartCorner: 'TL' | 'TR' | 'BL' | 'BR';
  // Energy Config
  panelWatts: number;
  panelAmps: number;
  voltage: number;
}

export enum TabType {
  TAMANHO = 'Tamanho',
  SOBREPOSICAO = 'Sobreposição',
  COR = 'Cor',
  CALCULO = 'Cálculo',
  FIACAO = 'Fiação',
  FICHA_TECNICA = 'Ficha Técnica'
}
