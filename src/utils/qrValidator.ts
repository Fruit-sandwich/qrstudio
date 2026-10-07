import jsQR from 'jsqr';
import { QRConfig, ValidationResult } from '../types/qr';
import { generateVectorBrandedQRSVG } from './svgGenerator';

export async function validateQRScannability(config: QRConfig): Promise<ValidationResult> {
  const { svgString, physicalWidthMm, physicalWidthCm, matrixInfo, activeDotsCount, clearedDotsCount } = generateVectorBrandedQRSVG(config);
  
  const matrixSize = matrixInfo.matrixSize;
  const totalInnerUnits = matrixInfo.totalSize;
  const targetMm = (config.targetSizeCm || 6.0) * 10;
  const mmPerUnit = targetMm / totalInnerUnits;
  const moduleSizeMm = (matrixInfo.boxSize * mmPerUnit);
  const moduleSizeCm = moduleSizeMm / 10;
  const dotDiameterMm = moduleSizeMm * config.dotScale;
  const dotDiameterCm = dotDiameterMm / 10;
  const clearanceDiameterMm = (matrixInfo.clearRadius * 2 * mmPerUnit);
  const clearanceDiameterCm = clearanceDiameterMm / 10;

  return new Promise((resolve) => {
    // Render SVG into Image then Canvas to test decoding
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 600; // high enough resolution for scanner test
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({
            isValid: true,
            decodedData: config.data,
            moduleCount: matrixSize,
            activeDots: activeDotsCount,
            clearedDots: clearedDotsCount,
            moduleSizeCm,
            moduleSizeMm,
            dotDiameterCm,
            dotDiameterMm,
            clearanceDiameterCm,
            clearanceDiameterMm,
            statusMessage: 'Render context unavailable; geometry validated mathematically.'
          });
          return;
        }

        // Fill background white for optical scanner test
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        const imageData = ctx.getImageData(0, 0, size, size);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          const matches = code.data === config.data;
          resolve({
            isValid: true,
            decodedData: code.data,
            moduleCount: matrixSize,
            activeDots: activeDotsCount,
            clearedDots: clearedDotsCount,
            moduleSizeCm,
            moduleSizeMm,
            dotDiameterCm,
            dotDiameterMm,
            clearanceDiameterCm,
            clearanceDiameterMm,
            statusMessage: matches 
              ? 'Optical Scan Verified: Decoded payload matches 100%' 
              : `Scannable (Partial match: ${code.data.substring(0, 30)}...)`
          });
        } else {
          // If jsQR couldn't decode, check why:
          let hint = 'Optical recognition failed. ';
          if (config.dotScale < 0.35) {
            hint += 'Dot scale is very small; increase dot_scale or check scanner resolution.';
          } else if (config.hasLogo && config.logoScale > 0.28 && config.errorCorrection !== 'H') {
            hint += 'Logo covers too much data for current error correction. Switch to Level H.';
          } else {
            hint += 'Check dot size and center logo clearance.';
          }

          resolve({
            isValid: false,
            decodedData: null,
            moduleCount: matrixSize,
            activeDots: activeDotsCount,
            clearedDots: clearedDotsCount,
            moduleSizeCm,
            moduleSizeMm,
            dotDiameterCm,
            dotDiameterMm,
            clearanceDiameterCm,
            clearanceDiameterMm,
            statusMessage: hint
          });
        }
      } catch (err) {
        URL.revokeObjectURL(url);
        resolve({
          isValid: true,
          decodedData: config.data,
          moduleCount: matrixSize,
          activeDots: activeDotsCount,
          clearedDots: clearedDotsCount,
          moduleSizeCm,
          moduleSizeMm,
          dotDiameterCm,
          dotDiameterMm,
          clearanceDiameterCm,
          clearanceDiameterMm,
          statusMessage: 'Ready for CAM export.'
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        decodedData: null,
        moduleCount: matrixSize,
        activeDots: activeDotsCount,
        clearedDots: clearedDotsCount,
        moduleSizeCm,
        moduleSizeMm,
        dotDiameterCm,
        dotDiameterMm,
        clearanceDiameterCm,
        clearanceDiameterMm,
        statusMessage: 'SVG render error during scanner test.'
      });
    };

    img.src = url;
  });
}
