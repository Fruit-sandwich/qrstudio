import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QRConfig, MaterialTheme, ValidationResult } from './types/qr';
import { LOGO_PRESETS } from './utils/logoPresets';
import { generateVectorBrandedQRSVG } from './utils/svgGenerator';
import { generateQRDXF } from './utils/dxfGenerator';
import { validateQRScannability } from './utils/qrValidator';
import { Header } from './components/Header';
import { PresetBar } from './components/PresetBar';
import { ControlPanel } from './components/ControlPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { CamSpecsView } from './components/CamSpecsView';
import { CalibrationModal } from './components/CalibrationModal';

export default function App() {
  const defaultPreset = LOGO_PRESETS[0];

  // Default state matching requirements: DEFAULT IN CM, ZERO WHITE SHAPES
  const [config, setConfig] = useState<QRConfig>({
    data: 'https://arweave.net/k3ljpG0dnti67uYVdhOCiWLzIVigY-cQX-CUp5TKU7k',
    errorCorrection: 'H',
    border: 4,
    targetSizeCm: 6.0, // Default in cm (6.0 cm = 60 mm)
    unit: 'cm',
    dotScale: 0.45, // 0.45 = 55% smaller radius (gaps for kerf)
    moduleShape: 'circle',
    moduleCornerRadius: 0.4,
    invertModules: false,
    compoundPath: true,
    renderMode: 'fill',
    strokeWidthMm: 0.05,
    finderStyle: 'dots', // Modular Dots: matches data dots, 100% zero white shapes!
    finderScale: 1.0,
    finderCornerRadius: 0.8,
    separateFinderLayer: true,
    hasLogo: true,
    logoScale: 0.20, // 20% width
    clearRadiusRatio: 1.25, // 1.25 multiplier
    cutoutShape: 'circle',
    logoMode: 'engrave',
    logoSvgContent: defaultPreset ? defaultPreset.svgContent : '',
    logoPresetName: defaultPreset ? defaultPreset.name : 'Default',
    plateShape: 'none',
    platePaddingCm: 0.6,
    plateCornerRadiusCm: 0.6,
    mountingHoles: 'none',
    holeDiameterCm: 0.32,
    holeInsetCm: 0.5,
    cutLayerColor: '#FF0000',
    engraveLayerColor: '#000000',
    finderLayerColor: '#1E40AF',
    logoLayerColor: '#047857',
    referenceLayerColor: '#06B6D4',
    includeReferenceLayer: false
  });

  const [activeView, setActiveView] = useState<'editor' | 'specs'>('editor');
  const [material, setMaterial] = useState<MaterialTheme>('cad-wireframe');
  const [showKerfOverlay, setShowKerfOverlay] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Generate SVG in real time
  const svgOutput = useMemo(() => {
    try {
      return generateVectorBrandedQRSVG(config);
    } catch (err) {
      console.error('SVG Generation Error:', err);
      return {
        svgString: '<svg></svg>',
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
        physicalWidthCm: config.targetSizeCm,
        physicalHeightCm: config.targetSizeCm,
        physicalWidthMm: config.targetSizeCm * 10,
        physicalHeightMm: config.targetSizeCm * 10,
        matrixInfo: null as any,
        activeDotsCount: 0,
        clearedDotsCount: 0
      };
    }
  }, [config]);

  // Optical scan verification running with debounce
  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(() => {
      validateQRScannability(config).then((res) => {
        if (isCurrent) {
          setValidation(res);
        }
      });
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [config]);

  // Export handlers
  const handleExportSvg = useCallback(() => {
    const blob = new Blob([svgOutput.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (config.data.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15) || 'cnc_qr');
    link.download = `${cleanName}_${config.targetSizeCm}cm_kerf${Math.round(config.dotScale * 100)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgOutput, config]);

  const handleExportDxf = useCallback(() => {
    const dxfString = generateQRDXF(config);
    const blob = new Blob([dxfString], { type: 'application/dxf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (config.data.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15) || 'cnc_qr');
    link.download = `${cleanName}_${config.targetSizeCm}cm_kerf${Math.round(config.dotScale * 100)}.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [config]);

  const handleCopySvg = useCallback(() => {
    navigator.clipboard.writeText(svgOutput.svgString).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  }, [svgOutput]);

  const handleApplyPreset = (partial: Partial<QRConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...partial
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0e12] text-neutral-200">
      {/* 3-Zone Top Bar Contract */}
      <Header
        onExportSvg={handleExportSvg}
        onExportDxf={handleExportDxf}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        isScannable={validation?.isValid ?? true}
      />

      {/* Preset Toolbar */}
      <PresetBar onApplyPreset={handleApplyPreset} />

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {activeView === 'editor' ? (
          <>
            {/* Left/Sidebar: Lean Parameters Panel (CM default) */}
            <ControlPanel
              config={config}
              onChange={setConfig}
              validation={validation}
            />

            {/* Right: Interactive Vector Canvas */}
            <PreviewCanvas
              svgContent={svgOutput.svgString}
              config={config}
              physicalWidthCm={svgOutput.physicalWidthCm}
              physicalHeightCm={svgOutput.physicalHeightCm}
              physicalWidthMm={svgOutput.physicalWidthMm}
              physicalHeightMm={svgOutput.physicalHeightMm}
              material={material}
              setMaterial={setMaterial}
              showKerfOverlay={showKerfOverlay}
              setShowKerfOverlay={setShowKerfOverlay}
              onCopySvg={handleCopySvg}
              hasCopied={hasCopied}
            />
          </>
        ) : (
          <CamSpecsView
            config={config}
            validation={validation}
            onExportSvg={handleExportSvg}
            onExportDxf={handleExportDxf}
          />
        )}
      </div>

      {/* Laser Kerf Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        config={config}
      />
    </div>
  );
}
