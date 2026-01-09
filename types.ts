
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
  techSheetStatsTitle: string;
  showScaleOverlay: boolean;
  showUserName: boolean;
  showSpecs: boolean;
  showCoords: boolean;
  color1: string;
  color2: string;
  showBackground: boolean;
  // Wiring Config
  showWiring: boolean;
  wiringPattern: 'row-serpentine' | 'col-serpentine' | 'row-straight' | 'col-straight';
  wiringStartCorner: 'TL' | 'TR' | 'BL' | 'BR';
  // Energy Config
  panelWatts: number;
  voltage: number;
  // Processing
  pixelsPerPort: number;
  // Sizing helpers
  targetWidthM: number;
  targetHeightM: number;
}

export enum TabType {
  TAMANHO = 'Tamanho',
  SOBREPOSICAO = 'Sobreposição',
  COR = 'Cor',
  CALCULO = 'Cálculo',
  CABEAMENTO = 'Cabeamento',
  FICHA_TECNICA = 'Ficha Técnica'
}
