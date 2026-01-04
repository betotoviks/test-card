
export interface ScreenConfig {
  mapWidth: number;
  mapHeight: number;
  halfHeightRow: boolean;
  panelWidthPx: number;
  panelHeightPx: number;
  panelWidthMm: number;
  panelHeightMm: number;
  panelType: string;
  screenName: string;
  techSheetTitle: string;
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
  ENERGIA = 'Energia',
  FICHA_TECNICA = 'Ficha Técnica'
}
