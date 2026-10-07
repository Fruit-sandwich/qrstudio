import { QRConfig } from '../types/qr';
import { generateVectorBrandedQRSVG } from './svgGenerator';

export function generateKerfCalibrationStripSVG(baseConfig: QRConfig): string {
  const testScales = [0.35, 0.45, 0.55, 0.65, 0.75];
  const stripWidthMm = 220;
  const stripHeightMm = 55;
  const patchSizeMm = 35;
  const paddingX = 7;
  const stepX = 42;

  let subSvgs = '';

  testScales.forEach((scale, index) => {
    const configVariant: QRConfig = {
      ...baseConfig,
      dotScale: scale,
      targetSizeCm: patchSizeMm / 10,
      plateShape: 'none',
      hasLogo: false, // keep calibration pure
      compoundPath: true,
      border: 2
    };

    const result = generateVectorBrandedQRSVG(configVariant);
    const posX = paddingX + index * stepX;
    const posY = 5;

    // Extract inside svg contents from result.svgString
    const svgInnerMatch = result.svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    const content = svgInnerMatch ? svgInnerMatch[1] : '';

    subSvgs += `
    <g transform="translate(${posX}, ${posY})">
      <rect x="0" y="0" width="${patchSizeMm}" height="${patchSizeMm}" fill="none" stroke="#FF0000" stroke-width="0.1" stroke-dasharray="1,1" />
      <g transform="scale(${patchSizeMm / result.viewBox.width})">
        ${content}
      </g>
      <text x="${patchSizeMm / 2}" y="${patchSizeMm + 6}" font-family="sans-serif" font-size="3" font-weight="bold" text-anchor="middle" fill="#000000">
        Scale: ${scale.toFixed(2)} (${Math.round((1 - scale) * 100)}% Kerf)
      </text>
    </g>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="${stripWidthMm}mm" 
  height="${stripHeightMm}mm" 
  viewBox="0 0 ${stripWidthMm} ${stripHeightMm}"
  version="1.1"
>
  <defs>
    <style>
      .cnc-cut { stroke: #FF0000; stroke-width: 0.1; fill: none; }
      .cnc-text { font-family: sans-serif; font-size: 3px; fill: #000000; }
    </style>
  </defs>

  <!-- Strip Outer Cut Box -->
  <g id="CALIBRATION_CUT_PERIMETER">
    <rect x="2" y="2" width="${stripWidthMm - 4}" height="${stripHeightMm - 4}" rx="3" class="cnc-cut" />
  </g>

  <!-- Calibration Title -->
  <text x="10" y="50" font-family="sans-serif" font-size="3.5" font-weight="bold" fill="#000000">
    CNC Laser Kerf Matrix Test · Payload: "${baseConfig.data.substring(0, 25)}"
  </text>

  <!-- Patches -->
  ${subSvgs}
</svg>`;
}
