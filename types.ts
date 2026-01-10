
export interface ScreenConfig {
  mapWidth: number;
  mapHeight: number;
  panelWidthPx: number;
  panelHeightPx: number;
  panelWidthMm: number;
  panelHeightMm: number;
  panelType: string;
  screenName: string;
  logoUrl: string | null;
  techSheetTitle: string;
  techSheetStatsTitle: string;
  // Tech Sheet Specific Extra Fields
  softwareVideo: string;
  fileFormat: string;
  videoCodec: string;
  videoFps: string;
  
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
  // Weight
  panelWeightKg: number;
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
