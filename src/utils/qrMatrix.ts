import QRCode from 'qrcode';
import { QRConfig, QRMatrixInfo } from '../types/qr';

export function generateQRMatrix(config: QRConfig): QRMatrixInfo {
  const options: QRCode.QRCodeOptions = {
    errorCorrectionLevel: config.errorCorrection,
  };
  
  if (config.version && config.version > 0) {
    options.version = config.version;
  }

  // Create QR instance
  const qr = QRCode.create(config.data || 'https://github.com', options);
  const matrixSize = qr.modules.size;
  const matrix: boolean[][] = [];

  for (let r = 0; r < matrixSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < matrixSize; c++) {
      row.push(Boolean(qr.modules.get(r, c)));
    }
    matrix.push(row);
  }

  const boxSize = 10; // 10 units per module for vector precision
  const border = Math.max(0, config.border);
  const totalSize = (matrixSize + border * 2) * boxSize;
  const qrCenter = totalSize / 2;

  // Logo radius & clear radius calculation
  // Matches Python: logo_radius = (total_size * logo_scale) / 2
  // clear_radius = logo_radius * clearRadiusRatio
  const logoScale = config.hasLogo ? Math.max(0.01, Math.min(0.5, config.logoScale)) : 0;
  const logoRadius = (totalSize * logoScale) / 2;
  const clearRadius = config.hasLogo && config.cutoutShape !== 'none'
    ? logoRadius * (config.clearRadiusRatio || 1.25)
    : 0;

  // Finder patterns are 7x7 at the three corners
  const finders: [number, number][] = [
    [0, 0],
    [matrixSize - 7, 0],
    [0, matrixSize - 7]
  ];

  const isFinder = (r: number, c: number): boolean => {
    for (const [fr, fc] of finders) {
      if (r >= fr && r < fr + 7 && c >= fc && c < fc + 7) {
        return true;
      }
    }
    return false;
  };

  const isClearZone = (cx: number, cy: number): boolean => {
    if (!config.hasLogo || config.cutoutShape === 'none' || clearRadius <= 0) {
      return false;
    }

    const dx = Math.abs(cx - qrCenter);
    const dy = Math.abs(cy - qrCenter);

    switch (config.cutoutShape) {
      case 'circle': {
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= clearRadius;
      }
      case 'square': {
        return dx <= clearRadius && dy <= clearRadius;
      }
      case 'rounded-square': {
        // Squircle / rounded box clearance
        const rCorner = clearRadius * 0.35;
        if (dx > clearRadius || dy > clearRadius) return false;
        if (dx <= clearRadius - rCorner || dy <= clearRadius - rCorner) return true;
        const cornerDx = dx - (clearRadius - rCorner);
        const cornerDy = dy - (clearRadius - rCorner);
        return (cornerDx * cornerDx + cornerDy * cornerDy) <= rCorner * rCorner;
      }
      case 'hexagon': {
        // Regular hexagon clearance
        const q2x = Math.abs(dx);
        const q2y = Math.abs(dy);
        if (q2x > clearRadius || q2y > clearRadius * 0.866) return false;
        return (2 * 0.866 * clearRadius - 0.866 * q2x - q2y) >= 0;
      }
      default:
        return false;
    }
  };

  return {
    matrix,
    matrixSize,
    totalSize,
    boxSize,
    border,
    qrCenter,
    logoRadius,
    clearRadius,
    isFinder,
    isClearZone,
    finders
  };
}
