import React from 'react';
import { Layers, Cpu, ShieldCheck, Ruler, ArrowRight, Download, FileCode } from 'lucide-react';
import { QRConfig, ValidationResult } from '../types/qr';

interface CamSpecsViewProps {
  config: QRConfig;
  validation: ValidationResult | null;
  onExportSvg: () => void;
  onExportDxf: () => void;
}

export const CamSpecsView: React.FC<CamSpecsViewProps> = ({
  config,
  validation,
  onExportSvg,
  onExportDxf
}) => {
  const plateTotalCm = config.plateShape !== 'none'
    ? (config.targetSizeCm || 6.0) + (config.platePaddingCm || 0) * 2
    : (config.targetSizeCm || 6.0);
  const plateTotalMm = plateTotalCm * 10;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0a0c10] p-8 text-neutral-200 space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            CAM Toolpath & Mechanical Specifications
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Engineered parameters for LightBurn, LaserGRBL, Vectric VCarve, and Fusion 360 CAM pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportDxf}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-neutral-300" />
            <span>Export DXF</span>
          </button>
          <button
            onClick={onExportSvg}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors flex items-center gap-2 shadow-sm shadow-red-950 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Clean SVG</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800">
          <div className="text-neutral-400 text-xs font-medium mb-1">Workpiece Dimensions</div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {plateTotalCm.toFixed(2)} × {plateTotalCm.toFixed(2)} cm
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-1">
            {plateTotalMm.toFixed(1)} × {plateTotalMm.toFixed(1)} mm · {(plateTotalMm / 25.4).toFixed(2)}″
          </div>
        </div>

        <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800">
          <div className="text-neutral-400 text-xs font-medium mb-1">Module Pitch (Grid)</div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {validation ? validation.moduleSizeCm.toFixed(3) : '0.000'} cm
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-1">
            {validation ? validation.moduleSizeMm.toFixed(2) : '0.00'} mm · {validation?.moduleCount ?? 0}×{validation?.moduleCount ?? 0} grid
          </div>
        </div>

        <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800">
          <div className="text-neutral-400 text-xs font-medium mb-1">Engraved Dot Diameter</div>
          <div className="text-lg font-mono font-bold text-red-400 tabular-nums">
            {validation ? validation.dotDiameterCm.toFixed(3) : '0.000'} cm
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-1">
            {validation ? validation.dotDiameterMm.toFixed(2) : '0.00'} mm · dot_scale = {config.dotScale.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800">
          <div className="text-neutral-400 text-xs font-medium mb-1">Kerf Safety Gap</div>
          <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
            {validation ? ((validation.moduleSizeCm - validation.dotDiameterCm) * 10).toFixed(2) : '0.00'} mm
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-1">
            {validation ? (validation.moduleSizeCm - validation.dotDiameterCm).toFixed(3) : '0.000'} cm
          </div>
        </div>
      </div>

      {/* Layer Color Mapping Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-400" />
          <span>LightBurn & CAM Layer Assignments</span>
        </h2>

        <div className="bg-[#11141a] rounded-xl border border-neutral-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a22] text-neutral-400 border-b border-neutral-800 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-semibold">CAM Layer ID</th>
                <th className="py-2.5 px-4 font-semibold">Layer Label</th>
                <th className="py-2.5 px-4 font-semibold">Geometry Entity</th>
                <th className="py-2.5 px-4 font-semibold">Hex Color</th>
                <th className="py-2.5 px-4 font-semibold">Recommended Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 font-mono text-neutral-300">
              <tr>
                <td className="py-2.5 px-4 text-white font-medium">CAM_CUT_PERIMETER</td>
                <td className="py-2.5 px-4">00_Cut_Perimeter</td>
                <td className="py-2.5 px-4">Closed vector polygon/path</td>
                <td className="py-2.5 px-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: config.cutLayerColor }} />
                  <span>{config.cutLayerColor}</span>
                </td>
                <td className="py-2.5 px-4 text-red-400">Vector Line Cut (100% Power)</td>
              </tr>
              {config.mountingHoles !== 'none' && (
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">CAM_CUT_HOLES</td>
                  <td className="py-2.5 px-4">01_Cut_Holes</td>
                  <td className="py-2.5 px-4">Drill circles ({config.holeDiameterCm}cm / {(config.holeDiameterCm * 10).toFixed(1)}mm)</td>
                  <td className="py-2.5 px-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: config.cutLayerColor }} />
                    <span>{config.cutLayerColor}</span>
                  </td>
                  <td className="py-2.5 px-4 text-red-400">Vector Line Cut (Cut holes first!)</td>
                </tr>
              )}
              {config.separateFinderLayer && (
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">CAM_ENGRAVE_FINDERS</td>
                  <td className="py-2.5 px-4">02_Engrave_Finders</td>
                  <td className="py-2.5 px-4">3 Corner Finder Rings</td>
                  <td className="py-2.5 px-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: config.finderLayerColor }} />
                    <span>{config.finderLayerColor}</span>
                  </td>
                  <td className="py-2.5 px-4 text-blue-400">Fill Engrave / Deep Pocket</td>
                </tr>
              )}
              <tr>
                <td className="py-2.5 px-4 text-white font-medium">CAM_ENGRAVE_DATA</td>
                <td className="py-2.5 px-4">03_Engrave_Data</td>
                <td className="py-2.5 px-4">
                  {config.compoundPath ? 'Single Compound Path' : `${validation?.activeDots ?? 0} dots`}
                </td>
                <td className="py-2.5 px-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: config.engraveLayerColor }} />
                  <span>{config.engraveLayerColor}</span>
                </td>
                <td className="py-2.5 px-4 text-neutral-200">Fill (Raster Engrave / Pocket)</td>
              </tr>
              {config.hasLogo && (
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">CAM_LOGO_INLAY</td>
                  <td className="py-2.5 px-4">05_Logo_Brand</td>
                  <td className="py-2.5 px-4">{config.logoPresetName || 'Custom SVG'}</td>
                  <td className="py-2.5 px-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: config.logoLayerColor }} />
                    <span>{config.logoLayerColor}</span>
                  </td>
                  <td className="py-2.5 px-4 text-emerald-400">
                    {config.logoMode === 'cut' ? 'Vector Cut (Inlay)' : 'Fill Engrave'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Machine Speeds & Powers Reference Guide */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-400" />
          <span>Recommended Speeds & Powers Benchmarks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-xs">Baltic Birch Plywood</div>
            <div className="text-[11px] text-neutral-400 font-mono space-y-1">
              <div>Engrave: 300 mm/s @ 20%</div>
              <div>Cut (3mm): 15 mm/s @ 75%</div>
              <div>Interval: 0.08 mm (318 DPI)</div>
              <div>Air Assist: Low on engrave, High on cut</div>
            </div>
          </div>

          <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-xs">Black Cast Acrylic</div>
            <div className="text-[11px] text-neutral-400 font-mono space-y-1">
              <div>Engrave: 350 mm/s @ 15%</div>
              <div>Cut (3mm): 12 mm/s @ 80%</div>
              <div>Interval: 0.06 mm (423 DPI)</div>
              <div>Focus: Surface or +0.5mm defocus</div>
            </div>
          </div>

          <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-xs">Black Slate Coaster</div>
            <div className="text-[11px] text-neutral-400 font-mono space-y-1">
              <div>Engrave: 250 mm/s @ 35%</div>
              <div>Cut: N/A (Pre-cut blank)</div>
              <div>Interval: 0.07 mm (362 DPI)</div>
              <div>Mode: Invert QR for white contrast</div>
            </div>
          </div>

          <div className="p-4 bg-[#11141a] rounded-xl border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-xs">CNC Router (V-Carve)</div>
            <div className="text-[11px] text-neutral-400 font-mono space-y-1">
              <div>Tool: 60° V-Bit or 1.0mm Endmill</div>
              <div>Feed Rate: 1200 mm/min</div>
              <div>Plunge: 400 mm/min</div>
              <div>Depth per pass: 0.40 mm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
