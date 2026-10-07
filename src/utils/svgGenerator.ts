import { QRConfig, QRMatrixInfo, ModuleShape } from '../types/qr';
import { generateQRMatrix } from './qrMatrix';

interface SVGOutput {
  svgString: string;
  viewBox: { x: number; y: number; width: number; height: number };
  physicalWidthCm: number;
  physicalHeightCm: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
  matrixInfo: QRMatrixInfo;
  activeDotsCount: number;
  clearedDotsCount: number;
}

export function generateVectorBrandedQRSVG(config: QRConfig): SVGOutput {
  const matrixInfo = generateQRMatrix(config);
  const {
    matrix,
    matrixSize,
    totalSize: qrInnerUnits,
    boxSize,
    border,
    qrCenter,
    logoRadius,
    clearRadius,
    isFinder,
    isClearZone,
    finders
  } = matrixInfo;

  // Conversion from internal units (boxSize=10) to physical cm & mm
  // targetSizeCm is the QR dimension (excluding plate padding)
  const qrTargetCm = config.targetSizeCm || 6.0;
  const qrTargetMm = qrTargetCm * 10;
  const mmPerUnit = qrTargetMm / qrInnerUnits;
  
  // Plate padding in internal units (converted from cm)
  const platePaddingMm = (config.plateShape !== 'none' ? (config.platePaddingCm || 0) * 10 : 0);
  const platePaddingUnits = platePaddingMm / mmPerUnit;
  
  // Total viewBox including plate
  const viewBoxWidth = qrInnerUnits + platePaddingUnits * 2;
  const viewBoxHeight = qrInnerUnits + platePaddingUnits * 2;
  const physicalWidthMm = viewBoxWidth * mmPerUnit;
  const physicalHeightMm = viewBoxHeight * mmPerUnit;
  const physicalWidthCm = physicalWidthMm / 10;
  const physicalHeightCm = physicalHeightMm / 10;

  // Offset QR within plate
  const offsetX = platePaddingUnits;
  const offsetY = platePaddingUnits;
  const plateCenterX = viewBoxWidth / 2;
  const plateCenterY = viewBoxHeight / 2;

  // Hairline stroke width for vector cuts/scores (0.02mm or configurable)
  const hairlineUnits = Math.max(0.1, config.strokeWidthMm / mmPerUnit);

  let activeDotsCount = 0;
  let clearedDotsCount = 0;

  // 1. Data Modules Rendering
  const fullRadius = boxSize / 2;
  const dotScale = Math.max(0.05, Math.min(1.0, config.dotScale));
  const dotRadius = fullRadius * dotScale;
  const halfDotSize = (boxSize * dotScale) / 2;

  const dataModulePaths: string[] = [];
  const individualDataElements: string[] = [];

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      const isBitActive = config.invertModules ? !matrix[row][col] : matrix[row][col];
      
      if (!isBitActive) continue;
      if (isFinder(row, col)) continue;

      const cx = (col + border) * boxSize + fullRadius + offsetX;
      const cy = (row + border) * boxSize + fullRadius + offsetY;

      // Check distance from center for logo clearance
      const qrRelCx = cx - offsetX;
      const qrRelCy = cy - offsetY;

      if (isClearZone(qrRelCx, qrRelCy)) {
        clearedDotsCount++;
        continue;
      }

      activeDotsCount++;

      // Generate module geometry
      if (config.compoundPath && config.moduleShape === 'circle') {
        const r = dotRadius.toFixed(2);
        const x1 = (cx - dotRadius).toFixed(2);
        const x2 = (cx + dotRadius).toFixed(2);
        const y = cy.toFixed(2);
        dataModulePaths.push(`M ${x1} ${y} A ${r} ${r} 0 1 0 ${x2} ${y} A ${r} ${r} 0 1 0 ${x1} ${y} Z`);
      } else if (config.compoundPath && config.moduleShape === 'square') {
        const left = (cx - halfDotSize).toFixed(2);
        const top = (cy - halfDotSize).toFixed(2);
        const side = (halfDotSize * 2).toFixed(2);
        dataModulePaths.push(`M ${left} ${top} h ${side} v ${side} h -${side} Z`);
      } else {
        const elem = renderModuleElement(
          config.moduleShape,
          cx,
          cy,
          dotRadius,
          halfDotSize,
          config.moduleCornerRadius,
          config.renderMode,
          config.engraveLayerColor,
          hairlineUnits
        );
        individualDataElements.push(elem);
      }
    }
  }

  // 2. Finder Patterns Rendering - ZERO WHITE SHAPES!
  // Uses true transparent/void compound evenodd paths or matching dots
  const finderElements: string[] = [];
  const finderScale = Math.max(0.2, Math.min(1.0, config.finderScale));

  for (const [fr, fc] of finders) {
    const fx = (fc + border) * boxSize + offsetX;
    const fy = (fr + border) * boxSize + offsetY;
    const fCenter = 3.5 * boxSize;

    if (config.finderStyle === 'dots') {
      // Modular Dots: uses the EXACT SAME dot scale and geometry as data modules
      // Zero solid difference, zero white shapes, 100% consistent kerf across the entire QR code!
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerEye = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isOuterBorder || isInnerEye) {
            const dotCx = fx + (c + 0.5) * boxSize;
            const dotCy = fy + (r + 0.5) * boxSize;
            const elem = renderModuleElement(
              config.moduleShape,
              dotCx,
              dotCy,
              dotRadius,
              halfDotSize,
              config.moduleCornerRadius,
              config.renderMode,
              config.finderLayerColor,
              hairlineUnits
            );
            finderElements.push(elem);
          }
        }
      }
    } else if (config.finderStyle === 'classic') {
      // Hollow Even-Odd Frame: outer perimeter + inner hole perimeter (NO white filler!)
      const outerSize = 7 * boxSize * finderScale;
      const wallThickness = 1 * boxSize * finderScale;
      const gapSize = 5 * boxSize * finderScale;
      const innerSize = 3 * boxSize * finderScale;

      const outerInset = (7 * boxSize - outerSize) / 2;
      const ox = fx + outerInset;
      const oy = fy + outerInset;

      const gx = ox + wallThickness;
      const gy = oy + wallThickness;

      const ix = ox + 2 * wallThickness;
      const iy = oy + 2 * wallThickness;

      const outerPath = buildRoundedRectPath(ox, oy, outerSize, outerSize, 0);
      const holePath = buildRoundedRectPath(gx, gy, gapSize, gapSize, 0);

      finderElements.push(`
        <!-- Finder at (${fc}, ${fr}) - True hollow square frame, zero white shapes -->
        <path fill-rule="evenodd" d="${outerPath} ${holePath}" fill="${config.finderLayerColor}" />
        <rect x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" fill="${config.finderLayerColor}" />
      `);
    } else if (config.finderStyle === 'rounded') {
      // Concentric Rounded Hollow Frame (ZERO white shapes, mathematically uniform wall thickness)
      const outerSize = 7 * boxSize * finderScale;
      const wallThickness = 1 * boxSize * finderScale;
      const gapSize = 5 * boxSize * finderScale;
      const innerSize = 3 * boxSize * finderScale;

      const outerInset = (7 * boxSize - outerSize) / 2;
      const ox = fx + outerInset;
      const oy = fy + outerInset;

      const gx = ox + wallThickness;
      const gy = oy + wallThickness;

      const ix = ox + 2 * wallThickness;
      const iy = oy + 2 * wallThickness;

      const rxOuter = Math.min(outerSize * 0.45, boxSize * config.finderCornerRadius * finderScale);
      // Concentric hole radius: exactly outer radius minus wall thickness (so wall thickness is 100% constant)
      const rxGap = Math.max(0, rxOuter - wallThickness);
      // Matching rounded center eye
      const rxInner = Math.min(innerSize * 0.45, rxOuter * (3 / 7));

      const outerPath = buildRoundedRectPath(ox, oy, outerSize, outerSize, rxOuter);
      const holePath = buildRoundedRectPath(gx, gy, gapSize, gapSize, rxGap);

      finderElements.push(`
        <!-- Finder at (${fc}, ${fr}) - Flawless concentric rounded hollow frame -->
        <path fill-rule="evenodd" d="${outerPath} ${holePath}" fill="${config.finderLayerColor}" />
        <rect x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${rxInner.toFixed(2)}" ry="${rxInner.toFixed(2)}" fill="${config.finderLayerColor}" />
      `);
    } else if (config.finderStyle === 'concentric-circles') {
      // Concentric Rings: true donut ring (ZERO white shapes) + center circle
      const cx = fx + fCenter;
      const cy = fy + fCenter;
      const rOuter = 3.5 * boxSize * finderScale;
      const rGap = 2.5 * boxSize * finderScale;
      const rInner = (1.5 * boxSize * finderScale).toFixed(2);

      // Even-Odd circular donut
      const dDonut = `
        M ${(cx - rOuter).toFixed(2)} ${cy.toFixed(2)} 
        A ${rOuter.toFixed(2)} ${rOuter.toFixed(2)} 0 1 0 ${(cx + rOuter).toFixed(2)} ${cy.toFixed(2)} 
        A ${rOuter.toFixed(2)} ${rOuter.toFixed(2)} 0 1 0 ${(cx - rOuter).toFixed(2)} ${cy.toFixed(2)} 
        Z 
        M ${(cx - rGap).toFixed(2)} ${cy.toFixed(2)} 
        A ${rGap.toFixed(2)} ${rGap.toFixed(2)} 0 1 1 ${(cx + rGap).toFixed(2)} ${cy.toFixed(2)} 
        A ${rGap.toFixed(2)} ${rGap.toFixed(2)} 0 1 1 ${(cx - rGap).toFixed(2)} ${cy.toFixed(2)} 
        Z
      `;

      finderElements.push(`
        <path fill-rule="evenodd" d="${dDonut}" fill="${config.finderLayerColor}" />
        <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${rInner}" fill="${config.finderLayerColor}" />
      `);
    }
  }

  // 3. Center Logo & Cutout Zone
  const logoElements: string[] = [];
  if (config.hasLogo && config.logoScale > 0) {
    const logoCenterAbsX = qrCenter + offsetX;
    const logoCenterAbsY = qrCenter + offsetY;
    const logoBoxWidth = logoRadius * 2;

    if (config.cutoutShape !== 'none' && config.logoMode === 'cut') {
      if (config.cutoutShape === 'circle') {
        logoElements.push(
          `<circle cx="${logoCenterAbsX.toFixed(2)}" cy="${logoCenterAbsY.toFixed(2)}" r="${clearRadius.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
      } else if (config.cutoutShape === 'square') {
        const side = (clearRadius * 2).toFixed(2);
        const x = (logoCenterAbsX - clearRadius).toFixed(2);
        const y = (logoCenterAbsY - clearRadius).toFixed(2);
        logoElements.push(
          `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
      }
    }

    if (config.logoMode === 'engrave' && config.logoSvgContent) {
      const cleanedContent = sanitizeAndTransformSvg(
        config.logoSvgContent,
        logoCenterAbsX - logoRadius,
        logoCenterAbsY - logoRadius,
        logoBoxWidth,
        config.logoLayerColor
      );
      logoElements.push(cleanedContent);
    }
  }

  // 4. Plate Perimeter & Mounting Screw / Keychain Holes (Layer CUT)
  const plateCutElements: string[] = [];
  const mountingHolesElements: string[] = [];

  if (config.plateShape !== 'none') {
    const plateRadiusCorner = ((config.plateCornerRadiusCm * 10) / mmPerUnit);
    
    switch (config.plateShape) {
      case 'square':
        plateCutElements.push(
          `<rect x="0" y="0" width="${viewBoxWidth.toFixed(2)}" height="${viewBoxHeight.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
        break;
      case 'rounded-rect':
        plateCutElements.push(
          `<rect x="0" y="0" width="${viewBoxWidth.toFixed(2)}" height="${viewBoxHeight.toFixed(2)}" rx="${plateRadiusCorner.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
        break;
      case 'circle':
        plateCutElements.push(
          `<circle cx="${plateCenterX.toFixed(2)}" cy="${plateCenterY.toFixed(2)}" r="${(viewBoxWidth / 2).toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
        break;
      case 'chamfer': {
        const ch = Math.min(plateRadiusCorner, viewBoxWidth * 0.15);
        const w = viewBoxWidth;
        const h = viewBoxHeight;
        const d = `M ${ch} 0 L ${w - ch} 0 L ${w} ${ch} L ${w} ${h - ch} L ${w - ch} ${h} L ${ch} ${h} L 0 ${h - ch} L 0 ${ch} Z`;
        plateCutElements.push(
          `<path d="${d}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
        break;
      }
    }

    // Mounting holes
    if (config.mountingHoles !== 'none') {
      const holeRadius = (((config.holeDiameterCm * 10) / 2) / mmPerUnit);
      const holeInset = ((config.holeInsetCm * 10) / mmPerUnit);

      if (config.mountingHoles === '4-corners') {
        const holePositions = [
          [holeInset, holeInset],
          [viewBoxWidth - holeInset, holeInset],
          [holeInset, viewBoxHeight - holeInset],
          [viewBoxWidth - holeInset, viewBoxHeight - holeInset],
        ];
        for (const [hx, hy] of holePositions) {
          mountingHolesElements.push(
            `<circle cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="${holeRadius.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
          );
        }
      } else if (config.mountingHoles === 'top-keychain') {
        const hx = plateCenterX;
        const hy = holeInset;
        mountingHolesElements.push(
          `<circle cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="${holeRadius.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
      } else if (config.mountingHoles === '2-sides') {
        const h1x = holeInset;
        const h1y = plateCenterY;
        const h2x = viewBoxWidth - holeInset;
        const h2y = plateCenterY;
        mountingHolesElements.push(
          `<circle cx="${h1x.toFixed(2)}" cy="${h1y.toFixed(2)}" r="${holeRadius.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`,
          `<circle cx="${h2x.toFixed(2)}" cy="${h2y.toFixed(2)}" r="${holeRadius.toFixed(2)}" fill="none" stroke="${config.cutLayerColor}" stroke-width="${hairlineUnits.toFixed(2)}" />`
        );
      }
    }
  }

  // 5. Reference Alignment Layer (Optional CAM Tool layer)
  const referenceElements: string[] = [];
  if (config.includeReferenceLayer) {
    referenceElements.push(`
      <rect x="${offsetX.toFixed(2)}" y="${offsetY.toFixed(2)}" width="${qrInnerUnits.toFixed(2)}" height="${qrInnerUnits.toFixed(2)}" fill="none" stroke="${config.referenceLayerColor}" stroke-width="${(hairlineUnits * 0.8).toFixed(2)}" stroke-dasharray="2,2" opacity="0.6"/>
      <line x1="${(qrCenter + offsetX).toFixed(2)}" y1="${offsetY.toFixed(2)}" x2="${(qrCenter + offsetX).toFixed(2)}" y2="${(qrCenter + offsetY + qrInnerUnits / 2).toFixed(2)}" stroke="${config.referenceLayerColor}" stroke-width="${(hairlineUnits * 0.8).toFixed(2)}" stroke-dasharray="2,2" opacity="0.4"/>
      <line x1="${offsetX.toFixed(2)}" y1="${(qrCenter + offsetY).toFixed(2)}" x2="${(offsetX + qrInnerUnits).toFixed(2)}" y2="${(qrCenter + offsetY).toFixed(2)}" stroke="${config.referenceLayerColor}" stroke-width="${(hairlineUnits * 0.8).toFixed(2)}" stroke-dasharray="2,2" opacity="0.4"/>
    `);
  }

  // Assemble Complete SVG Document with DEFAULT IN CM
  const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  width="${physicalWidthCm.toFixed(2)}cm" 
  height="${physicalHeightCm.toFixed(2)}cm" 
  viewBox="0 0 ${viewBoxWidth.toFixed(2)} ${viewBoxHeight.toFixed(2)}"
  version="1.1"
>
  <!-- Generated by CNC Vector QR Studio (Scale dot_scale=${config.dotScale}, No White Shapes) -->
  <defs>
    <style>
      .cnc-cut { stroke: ${config.cutLayerColor}; stroke-width: ${hairlineUnits.toFixed(2)}; fill: none; }
      .cnc-engrave-data { fill: ${config.engraveLayerColor}; }
      .cnc-engrave-finder { fill: ${config.finderLayerColor}; }
      .cnc-engrave-logo { fill: ${config.logoLayerColor}; }
      .cnc-ref { stroke: ${config.referenceLayerColor}; fill: none; }
    </style>
  </defs>

  ${referenceElements.length > 0 ? `
  <!-- CAM LAYER: REFERENCE & ALIGNMENT GUIDES -->
  <g id="CAM_REF_ALIGNMENT" inkscape:groupmode="layer" inkscape:label="04_Ref_Guides">
    ${referenceElements.join('\n')}
  </g>` : ''}

  ${plateCutElements.length > 0 ? `
  <!-- CAM LAYER: PLATE CUT PERIMETER -->
  <g id="CAM_CUT_PERIMETER" inkscape:groupmode="layer" inkscape:label="00_Cut_Perimeter" class="cnc-cut">
    ${plateCutElements.join('\n')}
  </g>` : ''}

  ${mountingHolesElements.length > 0 ? `
  <!-- CAM LAYER: MOUNTING & FIXTURE HOLES -->
  <g id="CAM_CUT_HOLES" inkscape:groupmode="layer" inkscape:label="01_Cut_Holes" class="cnc-cut">
    ${mountingHolesElements.join('\n')}
  </g>` : ''}

  ${config.separateFinderLayer ? `
  <!-- CAM LAYER: FINDER PATTERNS -->
  <g id="CAM_ENGRAVE_FINDERS" inkscape:groupmode="layer" inkscape:label="02_Engrave_Finders">
    ${finderElements.join('\n')}
  </g>` : ''}

  <!-- CAM LAYER: QR DATA MODULES (Kerf-Compensated) -->
  <g id="CAM_ENGRAVE_DATA" inkscape:groupmode="layer" inkscape:label="03_Engrave_Data">
    ${!config.separateFinderLayer ? finderElements.join('\n') : ''}
    ${config.compoundPath && dataModulePaths.length > 0 ? `
    <path d="${dataModulePaths.join(' ')}" fill="${config.engraveLayerColor}" />
    ` : individualDataElements.join('\n')}
  </g>

  ${logoElements.length > 0 ? `
  <!-- CAM LAYER: CENTER LOGO / MEDALLION -->
  <g id="CAM_LOGO_INLAY" inkscape:groupmode="layer" inkscape:label="05_Logo_Brand">
    ${logoElements.join('\n')}
  </g>` : ''}
</svg>`;

  return {
    svgString: svgDoc.trim(),
    viewBox: { x: 0, y: 0, width: viewBoxWidth, height: viewBoxHeight },
    physicalWidthCm,
    physicalHeightCm,
    physicalWidthMm,
    physicalHeightMm,
    matrixInfo,
    activeDotsCount,
    clearedDotsCount
  };
}

function renderModuleElement(
  shape: ModuleShape,
  cx: number,
  cy: number,
  r: number,
  halfSize: number,
  cornerRadius: number,
  renderMode: 'fill' | 'stroke' | 'both',
  color: string,
  hairline: number
): string {
  const fillAttr = renderMode === 'stroke' ? 'none' : color;
  const strokeAttr = renderMode === 'fill' ? 'none' : color;
  const strokeWidth = renderMode === 'fill' ? '0' : hairline.toFixed(2);

  switch (shape) {
    case 'circle':
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
    case 'outline-circle':
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="none" stroke="${color}" stroke-width="${hairline.toFixed(2)}" />`;
    case 'square': {
      const left = cx - halfSize;
      const top = cy - halfSize;
      const size = halfSize * 2;
      return `<rect x="${left.toFixed(2)}" y="${top.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
    }
    case 'rounded-square': {
      const left = cx - halfSize;
      const top = cy - halfSize;
      const size = halfSize * 2;
      const rx = (halfSize * cornerRadius).toFixed(2);
      return `<rect x="${left.toFixed(2)}" y="${top.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${rx}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
    }
    case 'diamond': {
      const d = `M ${cx.toFixed(2)} ${(cy - halfSize).toFixed(2)} L ${(cx + halfSize).toFixed(2)} ${cy.toFixed(2)} L ${cx.toFixed(2)} ${(cy + halfSize).toFixed(2)} L ${(cx - halfSize).toFixed(2)} ${cy.toFixed(2)} Z`;
      return `<path d="${d}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
    }
    case 'hexagon': {
      const hx = halfSize;
      const hy = halfSize * 0.866;
      const d = `M ${(cx - hx * 0.5).toFixed(2)} ${(cy - hy).toFixed(2)} L ${(cx + hx * 0.5).toFixed(2)} ${(cy - hy).toFixed(2)} L ${(cx + hx).toFixed(2)} ${cy.toFixed(2)} L ${(cx + hx * 0.5).toFixed(2)} ${(cy + hy).toFixed(2)} L ${(cx - hx * 0.5).toFixed(2)} ${(cy + hy).toFixed(2)} L ${(cx - hx).toFixed(2)} ${cy.toFixed(2)} Z`;
      return `<path d="${d}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
    }
    case 'drill-cross': {
      const arm = halfSize * 0.9;
      return `<g stroke="${color}" stroke-width="${hairline.toFixed(2)}"><line x1="${(cx - arm).toFixed(2)}" y1="${cy.toFixed(2)}" x2="${(cx + arm).toFixed(2)}" y2="${cy.toFixed(2)}" /><line x1="${cx.toFixed(2)}" y1="${(cy - arm).toFixed(2)}" x2="${cx.toFixed(2)}" y2="${(cy + arm).toFixed(2)}" /></g>`;
    }
    default:
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${strokeWidth}" />`;
  }
}

function sanitizeAndTransformSvg(
  svgContent: string,
  targetX: number,
  targetY: number,
  targetSize: number,
  fillColor: string
): string {
  try {
    const viewBoxMatch = svgContent.match(/viewBox=["']([0-9.\s-]+)["']/i);
    let vbWidth = 100;
    let vbHeight = 100;

    if (viewBoxMatch && viewBoxMatch[1]) {
      const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        vbWidth = parts[2];
        vbHeight = parts[3];
      }
    }

    const innerContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let innerContent = innerContentMatch ? innerContentMatch[1] : svgContent;

    innerContent = innerContent.replace(/currentColor/g, fillColor);

    const scale = (targetSize / Math.max(vbWidth, vbHeight)).toFixed(4);
    
    return `<g transform="translate(${targetX.toFixed(2)}, ${targetY.toFixed(2)}) scale(${scale})" color="${fillColor}" fill="${fillColor}">
      ${innerContent}
    </g>`;
  } catch {
    return '';
  }
}

function buildRoundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  const maxR = Math.min(w, h) / 2;
  const radius = Math.max(0, Math.min(maxR, r));

  if (radius <= 0.05) {
    return `M ${x.toFixed(2)} ${y.toFixed(2)} h ${w.toFixed(2)} v ${h.toFixed(2)} h -${w.toFixed(2)} Z`;
  }

  const rad = radius.toFixed(2);
  const straightW = (w - 2 * radius).toFixed(2);
  const straightH = (h - 2 * radius).toFixed(2);

  return `M ${(x + radius).toFixed(2)} ${y.toFixed(2)} h ${straightW} a ${rad} ${rad} 0 0 1 ${rad} ${rad} v ${straightH} a ${rad} ${rad} 0 0 1 -${rad} ${rad} h -${straightW} a ${rad} ${rad} 0 0 1 -${rad} -${rad} v -${straightH} a ${rad} ${rad} 0 0 1 ${rad} -${rad} Z`;
}

