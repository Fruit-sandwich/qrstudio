import { QRConfig } from '../types/qr';
import { generateQRMatrix } from './qrMatrix';

export function generateQRDXF(config: QRConfig): string {
  const matrixInfo = generateQRMatrix(config);
  const {
    matrix,
    matrixSize,
    totalSize: qrInnerUnits,
    boxSize,
    border,
    qrCenter,
    isFinder,
    isClearZone,
    finders
  } = matrixInfo;

  const qrTargetMm = (config.targetSizeCm || 6.0) * 10;
  const mmPerUnit = qrTargetMm / qrInnerUnits;
  const platePaddingMm = config.plateShape !== 'none' ? (config.platePaddingCm || 0) * 10 : 0;
  const platePaddingUnits = platePaddingMm / mmPerUnit;
  const totalUnits = qrInnerUnits + platePaddingUnits * 2;
  
  const offsetX = platePaddingUnits;
  const offsetY = platePaddingUnits;

  const fullRadius = boxSize / 2;
  const dotScale = Math.max(0.05, Math.min(1.0, config.dotScale));
  const dotRadiusMm = fullRadius * dotScale * mmPerUnit;

  let dxf = `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n0\nENDSEC\n`;
  
  // TABLES SECTION (Layers)
  dxf += `0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n3\n`;
  dxf += `0\nLAYER\n2\nENGRAVE_DATA\n70\n0\n62\n7\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nLAYER\n2\nENGRAVE_FINDERS\n70\n0\n62\n5\n6\nCONTINUOUS\n0\n`;
  dxf += `0\nLAYER\n2\nCUT_PLATE\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n`;
  dxf += `ENDTAB\n0\nENDSEC\n`;

  // ENTITIES SECTION
  dxf += `0\nSECTION\n2\nENTITIES\n`;

  // 1. Data Modules (Circles on ENGRAVE_DATA layer)
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      const isBitActive = config.invertModules ? !matrix[row][col] : matrix[row][col];
      if (!isBitActive || isFinder(row, col)) continue;

      const cx = ((col + border) * boxSize + fullRadius + offsetX) * mmPerUnit;
      const cy = (totalUnits - ((row + border) * boxSize + fullRadius + offsetY)) * mmPerUnit;

      const qrRelCx = (col + border) * boxSize + fullRadius;
      const qrRelCy = (row + border) * boxSize + fullRadius;

      if (isClearZone(qrRelCx, qrRelCy)) continue;

      // DXF CIRCLE
      dxf += `0\nCIRCLE\n8\nENGRAVE_DATA\n10\n${cx.toFixed(3)}\n20\n${cy.toFixed(3)}\n30\n0.0\n40\n${dotRadiusMm.toFixed(3)}\n`;
    }
  }

  // 2. Finders
  if (config.finderStyle === 'dots') {
    // Modular dots: export individual circle entities
    for (const [fr, fc] of finders) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerEye = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isOuterBorder || isInnerEye) {
            const dcx = ((fc + border + c + 0.5) * boxSize + offsetX) * mmPerUnit;
            const dcy = (totalUnits - ((fr + border + r + 0.5) * boxSize + offsetY)) * mmPerUnit;
            dxf += `0\nCIRCLE\n8\nENGRAVE_FINDERS\n10\n${dcx.toFixed(3)}\n20\n${dcy.toFixed(3)}\n30\n0.0\n40\n${dotRadiusMm.toFixed(3)}\n`;
          }
        }
      }
    }
  } else {
    // Hollow ring outer + center eye (NO gap outline)
    for (const [fr, fc] of finders) {
      const fx = ((fc + border) * boxSize + offsetX) * mmPerUnit;
      const fy = (totalUnits - ((fr + border) * boxSize + offsetY)) * mmPerUnit;
      const size7 = 7 * boxSize * mmPerUnit;
      const size3 = 3 * boxSize * mmPerUnit;
      const eyeOffset = 2 * boxSize * mmPerUnit;

      // Outer frame
      dxf += addDxfRect(fx, fy - size7, size7, size7, 'ENGRAVE_FINDERS');
      // Inner solid eye
      dxf += addDxfRect(fx + eyeOffset, fy - size7 + eyeOffset, size3, size3, 'ENGRAVE_FINDERS');
    }
  }

  // 3. Plate Cut Perimeter
  if (config.plateShape !== 'none') {
    const totalW = totalUnits * mmPerUnit;
    const totalH = totalUnits * mmPerUnit;

    if (config.plateShape === 'circle') {
      const c = totalW / 2;
      dxf += `0\nCIRCLE\n8\nCUT_PLATE\n10\n${c.toFixed(3)}\n20\n${c.toFixed(3)}\n30\n0.0\n40\n${(totalW / 2).toFixed(3)}\n`;
    } else {
      dxf += addDxfRect(0, 0, totalW, totalH, 'CUT_PLATE');
    }

    // Mounting holes
    if (config.mountingHoles !== 'none') {
      const r = ((config.holeDiameterCm * 10) / 2);
      const inset = (config.holeInsetCm * 10);

      if (config.mountingHoles === '4-corners') {
        const holes = [
          [inset, inset],
          [totalW - inset, inset],
          [inset, totalH - inset],
          [totalW - inset, totalH - inset]
        ];
        for (const [hx, hy] of holes) {
          dxf += `0\nCIRCLE\n8\nCUT_PLATE\n10\n${hx.toFixed(3)}\n20\n${hy.toFixed(3)}\n30\n0.0\n40\n${r.toFixed(3)}\n`;
        }
      } else if (config.mountingHoles === 'top-keychain') {
        const hx = totalW / 2;
        const hy = totalH - inset;
        dxf += `0\nCIRCLE\n8\nCUT_PLATE\n10\n${hx.toFixed(3)}\n20\n${hy.toFixed(3)}\n30\n0.0\n40\n${r.toFixed(3)}\n`;
      }
    }
  }

  dxf += `0\nENDSEC\n0\nEOF\n`;
  return dxf;
}

function addDxfRect(x: number, y: number, w: number, h: number, layer: string): string {
  return `0\nLWPOLYLINE\n8\n${layer}\n90\n4\n70\n1\n` +
    `10\n${x.toFixed(3)}\n20\n${y.toFixed(3)}\n` +
    `10\n${(x + w).toFixed(3)}\n20\n${y.toFixed(3)}\n` +
    `10\n${(x + w).toFixed(3)}\n20\n${(y + h).toFixed(3)}\n` +
    `10\n${x.toFixed(3)}\n20\n${(y + h).toFixed(3)}\n`;
}
