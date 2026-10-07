import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode,
  Wifi, 
  Link2, 
  Phone, 
  FileText,
  Circle,
  Square,
  BoxSelect,
  Hexagon,
  Crosshair,
  Disc,
  Grid,
  PenTool,
  Scissors,
  Box,
  Focus
} from 'lucide-react';
import { 
  QRConfig, 
  ModuleShape, 
  FinderStyle, 
  CutoutShape, 
  LogoMode, 
  PlateShape, 
  MountingHoles, 
  ErrorCorrectionLevel, 
  ValidationResult 
} from '../types/qr';
import { LOGO_PRESETS } from '../utils/logoPresets';

interface ControlPanelProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
  validation: ValidationResult | null;
}

type TabKey = 'content' | 'kerf' | 'finders' | 'logo' | 'plate' | 'cam';

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, validation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('kerf');

  const handleCustomSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange((prev) => ({
          ...prev,
          logoSvgContent: content,
          logoPresetName: file.name,
          hasLogo: true
        }));
      }
    };
    reader.readAsText(file);
  };

  const setPresetData = (type: 'url' | 'wifi' | 'text' | 'phone') => {
    if (type === 'url') {
      onChange((p) => ({ ...p, data: 'https://example.com/project' }));
    } else if (type === 'wifi') {
      onChange((p) => ({ ...p, data: 'WIFI:T:WPA;S:ShopLaserNet;P:Makerspace2026;;' }));
    } else if (type === 'phone') {
      onChange((p) => ({ ...p, data: 'tel:+15550192834' }));
    } else {
      onChange((p) => ({ ...p, data: 'CNC PART # 9821-B · LASER BATCH 04' }));
    }
  };

  return (
    <div className="w-full lg:w-[410px] h-full flex flex-col bg-[#0f1217] border-r border-neutral-800 text-neutral-200 select-none shrink-0 text-xs">
      {/* Lean Tab Header */}
      <div className="flex border-b border-neutral-800 bg-[#0c0e12] px-2 pt-1.5 gap-1">
        {[
          { id: 'content' as const, label: 'Data', icon: QrCode },
          { id: 'kerf' as const, label: 'Kerf', icon: Sliders },
          { id: 'finders' as const, label: 'Finders', icon: Focus },
          { id: 'logo' as const, label: 'Logo', icon: Sparkles },
          { id: 'plate' as const, label: 'Plate', icon: Scissors },
          { id: 'cam' as const, label: 'CAM', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'border-red-500 text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lean Status Strip (All measurements in cm & mm) */}
      <div className="px-4 py-2 bg-[#14171f] border-b border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          {validation?.isValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className={validation?.isValid ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'}>
            {validation?.isValid ? 'Scan: OK' : 'Scan: Warning'}
          </span>
        </div>
        <div className="text-neutral-400 tabular-nums">
          <span>{validation?.activeDots ?? 0} dots</span>
          <span className="mx-1.5 text-neutral-600">·</span>
          <span>{validation ? (validation.moduleSizeCm * 10).toFixed(2) : '0.00'} mm pitch</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: DATA & SIZE (CM DEFAULT) ================= */}
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-neutral-300">Payload Data</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPresetData('url')}
                    title="URL template"
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPresetData('wifi')}
                    title="Wi-Fi template"
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPresetData('phone')}
                    title="Phone template"
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPresetData('text')}
                    title="Text template"
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={config.data}
                onChange={(e) => onChange((p) => ({ ...p, data: e.target.value }))}
                rows={2}
                className="w-full bg-[#141820] border border-neutral-700/80 rounded-lg p-2 text-xs font-mono text-neutral-100 focus:outline-hidden focus:border-red-500 transition-colors resize-none"
                placeholder="Enter URL or text to encode..."
              />
            </div>

            {/* Error Correction */}
            <div>
              <div className="flex justify-between mb-1.5 font-medium text-neutral-400 text-[11px]">
                <span>Error Correction</span>
                <span className="font-mono text-neutral-300">
                  {config.errorCorrection === 'H' ? '30% (Recommended with Logo)' : config.errorCorrection === 'Q' ? '25%' : config.errorCorrection === 'M' ? '15%' : '7%'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#141820] rounded-lg border border-neutral-800">
                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onChange((p) => ({ ...p, errorCorrection: lvl }))}
                    className={`py-1.5 font-mono text-xs rounded transition-colors cursor-pointer ${
                      config.errorCorrection === lvl
                        ? 'bg-neutral-800 text-white font-bold shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Size (CM) & Quiet Zone */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block mb-1 font-medium text-neutral-400 text-[11px]">
                  Target Size (Width & Height)
                </label>
                <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden focus-within:border-red-500">
                  <input
                    type="number"
                    min="1.0"
                    max="100.0"
                    step="0.1"
                    value={config.targetSizeCm}
                    onChange={(e) =>
                      onChange((p) => ({ ...p, targetSizeCm: Math.max(1.0, Number(e.target.value)) }))
                    }
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                  />
                  <span className="px-2 text-[11px] font-mono font-bold text-red-400 bg-neutral-800/60 py-1.5">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-neutral-400 text-[11px]">
                  Quiet Zone (Border)
                </label>
                <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden focus-within:border-red-500">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.border}
                    onChange={(e) =>
                      onChange((p) => ({ ...p, border: Math.max(0, Number(e.target.value)) }))
                    }
                    className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                  />
                  <span className="px-2 text-[11px] font-mono text-neutral-400 bg-neutral-800/60 py-1.5">
                    mods
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics readout in CM and MM */}
            {validation && (
              <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800 text-[11px] font-mono flex justify-between text-neutral-400 tabular-nums">
                <div>
                  <span className="text-neutral-500 mr-1">Pitch:</span>
                  <span className="text-neutral-200">
                    {validation.moduleSizeCm.toFixed(2)} cm ({validation.moduleSizeMm.toFixed(2)}mm)
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 mr-1">Dot Ø:</span>
                  <span className="text-neutral-200">
                    {validation.dotDiameterCm.toFixed(2)} cm ({validation.dotDiameterMm.toFixed(2)}mm)
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 mr-1">Gap:</span>
                  <span className="text-emerald-400 font-semibold">
                    {((validation.moduleSizeCm - validation.dotDiameterCm) * 10).toFixed(2)}mm
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: KERF & DOTS ================= */}
        {activeTab === 'kerf' && (
          <div className="space-y-4">
            {/* Dot Scale Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-neutral-300">Kerf Scale (dot_scale)</span>
                <span className="font-mono text-xs font-bold text-red-400 tabular-nums">
                  {config.dotScale.toFixed(2)} · {Math.round((1 - config.dotScale) * 100)}% kerf gap
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.01"
                value={config.dotScale}
                onChange={(e) => onChange((p) => ({ ...p, dotScale: Number(e.target.value) }))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                <span>0.20 (Fine Wood)</span>
                <span className="text-neutral-400">0.45 (Python Default)</span>
                <span>1.00 (Solid)</span>
              </div>
            </div>

            {/* Module Shape Grid (Icon-Driven) */}
            <div>
              <span className="block mb-2 font-semibold text-neutral-300">Module Shape</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'circle', label: 'Circle', icon: Circle },
                  { id: 'square', label: 'Square', icon: Square },
                  { id: 'rounded-square', label: 'Squircle', icon: BoxSelect },
                  { 
                    id: 'diamond', 
                    label: 'Diamond', 
                    icon: () => (
                      <div className="w-3.5 h-3.5 border border-current rotate-45 transform shrink-0 rounded-2xs" />
                    ) 
                  },
                  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
                  { id: 'drill-cross', label: 'Drill Peck', icon: Crosshair }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = config.moduleShape === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onChange((p) => ({ ...p, moduleShape: item.id as ModuleShape }))}
                      className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-950/20 text-white'
                          : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corner Rounding Slider if Squircle */}
            {config.moduleShape === 'rounded-square' && (
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
                  <span>Corner Rounding</span>
                  <span className="font-mono text-neutral-200">
                    {Math.round(config.moduleCornerRadius * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.moduleCornerRadius}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, moduleCornerRadius: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            )}

            {/* Toggles */}
            <div className="pt-2 border-t border-neutral-800 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-medium text-neutral-300">Compound Vector Path</span>
                <input
                  type="checkbox"
                  checked={config.compoundPath}
                  onChange={(e) => onChange((p) => ({ ...p, compoundPath: e.target.checked }))}
                  className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-medium text-neutral-300">Invert QR (Negative Relief)</span>
                <input
                  type="checkbox"
                  checked={config.invertModules}
                  onChange={(e) => onChange((p) => ({ ...p, invertModules: e.target.checked }))}
                  className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FINDERS (ZERO WHITE SHAPES) ================= */}
        {activeTab === 'finders' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-300">Finder Style</span>
                <span className="text-[10px] font-mono text-emerald-400">Zero White Shapes</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { 
                    id: 'dots', 
                    label: 'Modular Dots', 
                    icon: Grid,
                    desc: 'Matches QR dots'
                  },
                  { 
                    id: 'classic', 
                    label: 'Hollow Square', 
                    icon: Square,
                    desc: 'Hollow frame'
                  },
                  { 
                    id: 'rounded', 
                    label: 'Rounded Frame', 
                    icon: BoxSelect,
                    desc: 'Curved hollow'
                  },
                  { 
                    id: 'concentric-circles', 
                    label: 'Donut Ring', 
                    icon: Disc,
                    desc: 'Hollow circle'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = config.finderStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onChange((p) => ({ ...p, finderStyle: item.id as FinderStyle }))}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-red-500 bg-red-950/20 text-white'
                          : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="text-[11px] font-medium leading-tight">{item.label}</div>
                        <div className="text-[9px] text-neutral-500 leading-tight">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[10px] text-neutral-400">
                {config.finderStyle === 'dots'
                  ? 'Modular Dots: finders are rendered using the exact same dots and kerf gaps as the rest of the QR code.'
                  : 'True hollow vector paths with transparent gaps (no white rectangles to confuse laser CAM).'}
              </p>
            </div>

            {/* Finder Kerf Scale */}
            {config.finderStyle !== 'dots' && (
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
                  <span>Finder Kerf Scale</span>
                  <span className="font-mono text-neutral-200">{config.finderScale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.02"
                  value={config.finderScale}
                  onChange={(e) => onChange((p) => ({ ...p, finderScale: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            )}

            {/* Rounded Corner if applicable */}
            {config.finderStyle === 'rounded' && (
              <div>
                <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
                  <span>Corner Radius</span>
                  <span className="font-mono text-neutral-200">{config.finderCornerRadius.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={config.finderCornerRadius}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, finderCornerRadius: Number(e.target.value) }))
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-medium text-neutral-300">Separate Finder Layer in SVG</span>
                <input
                  type="checkbox"
                  checked={config.separateFinderLayer}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, separateFinderLayer: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CENTER LOGO ================= */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-2.5 bg-[#141820] rounded-lg border border-neutral-800">
              <span className="font-semibold text-neutral-200">Enable Center Logo</span>
              <input
                type="checkbox"
                checked={config.hasLogo}
                onChange={(e) => onChange((p) => ({ ...p, hasLogo: e.target.checked }))}
                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
              />
            </label>

            {config.hasLogo && (
              <>
                {/* Logo Scale & Clearance Sliders */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
                      <span>Logo Scale</span>
                      <span className="font-mono text-neutral-200 tabular-nums">
                        {Math.round(config.logoScale * 100)}% width
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.08"
                      max="0.32"
                      step="0.01"
                      value={config.logoScale}
                      onChange={(e) => onChange((p) => ({ ...p, logoScale: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
                      <span>Clearance Margin</span>
                      <span className="font-mono text-neutral-200 tabular-nums">
                        {config.clearRadiusRatio.toFixed(2)}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.00"
                      max="2.00"
                      step="0.05"
                      value={config.clearRadiusRatio}
                      onChange={(e) =>
                        onChange((p) => ({ ...p, clearRadiusRatio: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>
                </div>

                {/* Cutout Shape Grid */}
                <div>
                  <span className="block mb-1.5 font-medium text-neutral-400 text-[11px]">
                    Pocket Shape
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'circle', label: 'Circle', icon: Circle },
                      { id: 'square', label: 'Square', icon: Square },
                      { id: 'rounded-square', label: 'Squircle', icon: BoxSelect },
                      { id: 'hexagon', label: 'Hexagon', icon: Hexagon }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = config.cutoutShape === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onChange((p) => ({ ...p, cutoutShape: item.id as CutoutShape }))}
                          className={`py-1.5 rounded border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-red-500 bg-red-950/20 text-white font-semibold'
                              : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CAM Mode */}
                <div>
                  <span className="block mb-1.5 font-medium text-neutral-400 text-[11px]">
                    Operation
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'engrave', label: 'Engrave', icon: PenTool },
                      { id: 'cut', label: 'Inlay Cut', icon: Scissors },
                      { id: 'clear-pocket', label: 'Pocket', icon: Box }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = config.logoMode === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onChange((p) => ({ ...p, logoMode: item.id as LogoMode }))}
                          className={`py-1.5 rounded border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-red-500 bg-red-950/20 text-white font-semibold'
                              : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logo Preset Picker */}
                {config.logoMode === 'engrave' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-neutral-400 text-[11px]">Emblem</span>
                      <label className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload SVG</span>
                        <input
                          type="file"
                          accept=".svg"
                          onChange={handleCustomSvgUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {LOGO_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() =>
                            onChange((p) => ({
                              ...p,
                              logoSvgContent: preset.svgContent,
                              logoPresetName: preset.name
                            }))
                          }
                          title={preset.name}
                          className={`p-1.5 rounded border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                            config.logoPresetName === preset.name
                              ? 'border-red-500 bg-red-950/20 text-white'
                              : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div
                            className="w-5 h-5 text-neutral-200 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: preset.svgContent }}
                          />
                          <span className="text-[9px] truncate max-w-full font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= TAB 5: OUTER PLATE (CM DEFAULT) ================= */}
        {activeTab === 'plate' && (
          <div className="space-y-4">
            <div>
              <span className="block mb-2 font-semibold text-neutral-300">Plate Perimeter (Cut Layer)</span>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'square', label: 'Square' },
                  { id: 'rounded-rect', label: 'Rounded' },
                  { id: 'circle', label: 'Circle' },
                  { id: 'chamfer', label: 'Chamfer' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChange((p) => ({ ...p, plateShape: item.id as PlateShape }))}
                    className={`py-1.5 text-[11px] font-medium rounded border text-center transition-colors cursor-pointer ${
                      config.plateShape === item.id
                        ? 'border-red-500 bg-red-950/20 text-white font-semibold'
                        : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {config.plateShape !== 'none' && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block mb-1 text-[11px] text-neutral-400">Margin Padding</label>
                    <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={config.platePaddingCm}
                        onChange={(e) =>
                          onChange((p) => ({ ...p, platePaddingCm: Math.max(0, Number(e.target.value)) }))
                        }
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                      />
                      <span className="px-2 text-[11px] font-mono text-red-400 font-bold bg-neutral-800/60 py-1.5">
                        cm
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-neutral-400">Corner Radius</label>
                    <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={config.plateCornerRadiusCm}
                        onChange={(e) =>
                          onChange((p) => ({
                            ...p,
                            plateCornerRadiusCm: Math.max(0, Number(e.target.value))
                          }))
                        }
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                      />
                      <span className="px-2 text-[11px] font-mono text-red-400 font-bold bg-neutral-800/60 py-1.5">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mounting Holes */}
                <div>
                  <span className="block mb-1.5 text-[11px] text-neutral-400">Mounting Holes</span>
                  <div className="grid grid-cols-4 gap-1 mb-2.5">
                    {[
                      { id: 'none', label: 'None' },
                      { id: '4-corners', label: '4 Corners' },
                      { id: 'top-keychain', label: 'Top Hole' },
                      { id: '2-sides', label: '2 Sides' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          onChange((p) => ({ ...p, mountingHoles: item.id as MountingHoles }))
                        }
                        className={`py-1 text-[11px] rounded border text-center transition-colors cursor-pointer ${
                          config.mountingHoles === item.id
                            ? 'border-red-500 bg-red-950/20 text-white font-semibold'
                            : 'border-neutral-800 bg-[#141820] text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {config.mountingHoles !== 'none' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block mb-1 text-[11px] text-neutral-400">Hole Diameter</label>
                        <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden">
                          <input
                            type="number"
                            min="0.1"
                            max="5.0"
                            step="0.05"
                            value={config.holeDiameterCm}
                            onChange={(e) =>
                              onChange((p) => ({
                                ...p,
                                holeDiameterCm: Math.max(0.05, Number(e.target.value))
                              }))
                            }
                            className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                          />
                          <span className="px-2 text-[11px] font-mono text-red-400 font-bold bg-neutral-800/60 py-1.5">
                            cm
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-[11px] text-neutral-400">Edge Inset</label>
                        <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden">
                          <input
                            type="number"
                            min="0.2"
                            max="5.0"
                            step="0.05"
                            value={config.holeInsetCm}
                            onChange={(e) =>
                              onChange((p) => ({
                                ...p,
                                holeInsetCm: Math.max(0.1, Number(e.target.value))
                              }))
                            }
                            className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                          />
                          <span className="px-2 text-[11px] font-mono text-red-400 font-bold bg-neutral-800/60 py-1.5">
                            cm
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 6: CAM LAYERS ================= */}
        {activeTab === 'cam' && (
          <div className="space-y-3">
            <span className="block font-semibold text-neutral-300">LightBurn CAM Layer Colors</span>
            <div className="space-y-1.5">
              {[
                { label: 'Perimeter Cut (02)', key: 'cutLayerColor' as const },
                { label: 'Data Modules (00)', key: 'engraveLayerColor' as const },
                { label: 'Finders (01)', key: 'finderLayerColor' as const },
                { label: 'Logo Inlay (03)', key: 'logoLayerColor' as const },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between p-2 bg-[#141820] rounded border border-neutral-800"
                >
                  <span className="font-medium text-neutral-300">{row.label}</span>
                  <input
                    type="color"
                    value={config[row.key]}
                    onChange={(e) => onChange((p) => ({ ...p, [row.key]: e.target.value }))}
                    className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Hairline Stroke */}
            <div className="pt-2">
              <label className="block mb-1 text-[11px] text-neutral-400">Hairline Cut Stroke</label>
              <div className="flex items-center bg-[#141820] border border-neutral-700/80 rounded-lg overflow-hidden">
                <input
                  type="number"
                  min="0.001"
                  max="1.0"
                  step="0.01"
                  value={config.strokeWidthMm}
                  onChange={(e) =>
                    onChange((p) => ({
                      ...p,
                      strokeWidthMm: Math.max(0.001, Number(e.target.value))
                    }))
                  }
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs font-mono text-neutral-100 focus:outline-hidden"
                />
                <span className="px-2 text-[11px] font-mono text-neutral-400 bg-neutral-800/60 py-1.5">
                  mm
                </span>
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer py-1 border-t border-neutral-800 pt-2">
              <span className="font-medium text-neutral-300">T0 Alignment Guides</span>
              <input
                type="checkbox"
                checked={config.includeReferenceLayer}
                onChange={(e) =>
                  onChange((p) => ({ ...p, includeReferenceLayer: e.target.checked }))
                }
                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
