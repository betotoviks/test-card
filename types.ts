
export interface ScreenConfig {
  mapWidth: number;
  mapHeight: number;
  halfHeightRow: boolean;
  panelWidthPx: number;
  panelHeightPx: number;
  panelWidthMm: number; // Nova propriedade
  panelHeightMm: number; // Nova propriedade
  panelType: string;
  screenName: string;
  showScaleOverlay: boolean;
  showUserName: boolean;
  showSpecs: boolean;
  showCoords: boolean;
  showLogo: boolean;
  color1: string;
  color2: string;
  // Wiring Config
  showWiring: boolean;
  wiringPattern: 'row-serpentine' | 'col-serpentine' | 'row-straight' | 'col-straight';
  wiringStartCorner: 'TL' | 'TR' | 'BL' | 'BR';
}

export enum TabType {
  TAMANHO = 'Tamanho',
  PROCESSADOR = 'Processador',
  SOBREPOSICAO = 'Sobreposição',
  COR = 'Cor',
  CALCULO = 'Cálculo',
  FIACAO = 'Fiação'
}
