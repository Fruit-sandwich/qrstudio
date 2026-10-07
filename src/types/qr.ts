export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleShape = 
  | 'circle' 
  | 'square' 
  | 'rounded-square' 
  | 'diamond' 
  | 'hexagon' 
  | 'drill-cross'
  | 'outline-circle';

export type FinderStyle = 'dots' | 'classic' | 'rounded' | 'concentric-circles';

export type CutoutShape = 'circle' | 'square' | 'rounded-square' | 'hexagon' | 'none';

export type LogoMode = 'engrave' | 'cut' | 'clear-pocket' | 'none';

export type PlateShape = 'none' | 'square' | 'rounded-rect' | 'circle' | 'chamfer';

export type MountingHoles = 'none' | '4-corners' | 'top-keychain' | '2-sides';

export type MaterialTheme = 
  | 'cad-wireframe' // Bright White CAM Artboard (High Contrast default)
  | 'wood-birch'     // Natural Baltic Birch Wood
  | 'dark-walnut'    // Rich Dark Walnut Wood
  | 'black-slate'    // Anodized Aluminum / Slate
  | 'brushed-brass'  // Metallic Brass
  | 'cad-dark';      // Dark Blueprint CAD

export interface QRConfig {
  // Content & Encoding
  data: string;
  errorCorrection: ErrorCorrectionLevel;
  version?: number; // 0 = auto
  border: number; // quiet zone in modules (default 4)
  
  // Physical Dimensions - DEFAULT IN CM
  targetSizeCm: number; // default 6.0 cm
  unit: 'cm' | 'mm' | 'in';
  
  // Kerf & Module Geometry
  dotScale: number; // 0.1 to 1.0 (default 0.45 from python script)
  moduleShape: ModuleShape;
  moduleCornerRadius: number; // 0 to 1 for rounded squares
  invertModules: boolean; // engrave background instead of dots
  compoundPath: boolean; // combine all dots into single <path> for fast CAM parsing
  renderMode: 'fill' | 'stroke' | 'both';
  strokeWidthMm: number; // hairline beam width e.g. 0.05mm
  
  // Finder Patterns (Zero white shapes! True transparent gaps or matching dots)
  finderStyle: FinderStyle;
  finderScale: number; // 0.5 to 1.0
  finderCornerRadius: number; // for rounded finders
  separateFinderLayer: boolean;
  
  // Center Logo & Cutout
  hasLogo: boolean;
  logoScale: number; // 0.05 to 0.40 (ratio of total QR width)
  clearRadiusRatio: number; // safety clearance margin multiplier (default 1.25 from python script)
  cutoutShape: CutoutShape;
  logoMode: LogoMode;
  logoSvgContent: string; // custom or preset SVG
  logoPresetName: string;
  
  // Outer Plate & Mounting Fixture - IN CM
  plateShape: PlateShape;
  platePaddingCm: number; // default 0.6 cm
  plateCornerRadiusCm: number; // default 0.6 cm
  mountingHoles: MountingHoles;
  holeDiameterCm: number; // default 0.32 cm for M3 screw
  holeInsetCm: number; // default 0.5 cm
  
  // CAM Layer Styling & Colors (LightBurn standard compatible)
  cutLayerColor: string; // default #FF0000 (Red)
  engraveLayerColor: string; // default #000000 (Black)
  finderLayerColor: string; // default #1E40AF (Blue)
  logoLayerColor: string; // default #047857 (Green)
  referenceLayerColor: string; // default #06B6D4 (Cyan)
  includeReferenceLayer: boolean;
}

export interface QRMatrixInfo {
  matrix: boolean[][];
  matrixSize: number;
  totalSize: number; // in internal units
  boxSize: number; // standard 10 units per module
  border: number;
  qrCenter: number;
  logoRadius: number;
  clearRadius: number;
  isFinder: (r: number, c: number) => boolean;
  isClearZone: (cx: number, cy: number) => boolean;
  finders: [number, number][];
}

export interface ValidationResult {
  isValid: boolean;
  decodedData: string | null;
  moduleCount: number;
  activeDots: number;
  clearedDots: number;
  moduleSizeCm: number;
  moduleSizeMm: number;
  dotDiameterCm: number;
  dotDiameterMm: number;
  clearanceDiameterCm: number;
  clearanceDiameterMm: number;
  statusMessage: string;
}
