
export interface ScreenConfig {
  mapWidth: number;
  mapHeight: number;
  halfHeightRow: boolean;
  panelWidthPx: number;
  panelHeightPx: number;
  panelType: string;
  screenName: string;
  showScaleOverlay: boolean;
  showUserName: boolean;
  showSpecs: boolean;
  showCoords: boolean;
  showLogo: boolean;
  color1: string;
  color2: string;
}

export enum TabType {
  TAMANHO = 'Tamanho',
  PROCESSADOR = 'Processador',
  SOBREPOSICAO = 'Sobreposição',
  COR = 'Cor',
  CALCULO = 'Cálculo',
  FIACAO = 'Fiação'
}
