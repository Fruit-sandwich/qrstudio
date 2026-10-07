import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Copy, 
  Check, 
  Grid, 
  Flame, 
  Moon, 
  Sun,
  LayoutGrid
} from 'lucide-react';
import { MaterialTheme, QRConfig } from '../types/qr';

interface PreviewCanvasProps {
  svgContent: string;
  config: QRConfig;
  physicalWidthCm: number;
  physicalHeightCm: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
  material: MaterialTheme;
  setMaterial: (mat: MaterialTheme) => void;
  showKerfOverlay: boolean;
  setShowKerfOverlay: (val: boolean) => void;
  onCopySvg: () => void;
  hasCopied: boolean;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  svgContent,
  config,
  physicalWidthCm,
  physicalHeightCm,
  physicalWidthMm,
  physicalHeightMm,
  material,
  setMaterial,
  showKerfOverlay,
  setShowKerfOverlay,
  onCopySvg,
  hasCopied
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [canvasLighting, setCanvasLighting] = useState<'bright' | 'dark'>('bright');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(3.5, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, prev - 0.25));
  const handleResetZoom = () => setZoom(1);

  const isBright = canvasLighting === 'bright';

  // Material background and rendering effects
  const getMaterialStyles = () => {
    switch (material) {
      case 'cad-wireframe':
      default:
        // BRIGHT WHITE CAM Artboard: Crisp, clean, maximum contrast!
        return {
          background: '#ffffff',
          backgroundImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          boxShadow: isBright 
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 4px 15px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.08)'
            : '0 20px 50px rgba(0, 0, 0, 0.35), 0 2px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #cbd5e1',
        };
      case 'wood-birch':
        // Warm, bright, natural glowing Baltic Birch Plywood
        return {
          background: 'linear-gradient(135deg, #fcf4de 0%, #f4e4c4 50%, #ead0a6 100%)',
          boxShadow: 'inset 0 0 80px rgba(160, 110, 50, 0.18), 0 20px 45px rgba(0, 0, 0, 0.35)',
          border: '1px solid #d4b886',
        };
      case 'dark-walnut':
        return {
          background: 'linear-gradient(135deg, #3d2b1f 0%, #2f2016 50%, #241810 100%)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.5)',
          border: '1px solid #4a3424',
        };
      case 'black-slate':
        return {
          background: 'radial-gradient(circle at 50% 50%, #1e2025 0%, #121417 100%)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6)',
          border: '1px solid #2d333b',
        };
      case 'brushed-brass':
        return {
          background: 'linear-gradient(135deg, #fae99f 0%, #ebd068 35%, #c89b1c 70%, #f6e395 100%)',
          boxShadow: 'inset 0 0 70px rgba(120, 85, 0, 0.25), 0 20px 40px rgba(0,0,0,0.4)',
          border: '1px solid #cca128',
        };
      case 'cad-dark':
        // Dark Blueprint CAD mode (with auto-inverted bright dots)
        return {
          background: '#0d1117',
          backgroundImage: 'radial-gradient(circle, #2d333b 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          border: '1px solid #30363d',
        };
    }
  };

  // Modify rendered SVG for material simulation
  const getRenderableSvg = () => {
    if (material === 'cad-wireframe') {
      // In bright white CAD mode, the original crisp black, red, and blue vectors render natively with 100% clarity
      return svgContent;
    }

    let modified = svgContent;
    if (material === 'wood-birch') {
      modified = modified.replace(/fill="#000000"/gi, 'fill="#2b1a0e"');
      modified = modified.replace(/fill="#1E40AF"/gi, 'fill="#1a1208"');
      modified = modified.replace(/fill="#047857"/gi, 'fill="#23140a"');
      modified = modified.replace(/stroke="#FF0000"/gi, 'stroke="#4a2e18" stroke-width="0.3"');
    } else if (material === 'dark-walnut') {
      modified = modified.replace(/fill="#000000"/gi, 'fill="#110904"');
      modified = modified.replace(/fill="#1E40AF"/gi, 'fill="#0d0703"');
      modified = modified.replace(/fill="#047857"/gi, 'fill="#0d0703"');
      modified = modified.replace(/stroke="#FF0000"/gi, 'stroke="#140b05" stroke-width="0.4"');
    } else if (material === 'black-slate') {
      modified = modified.replace(/fill="#000000"/gi, 'fill="#f1f5f9"');
      modified = modified.replace(/fill="#1E40AF"/gi, 'fill="#e2e8f0"');
      modified = modified.replace(/fill="#047857"/gi, 'fill="#cbd5e1"');
      modified = modified.replace(/stroke="#FF0000"/gi, 'stroke="#64748b" stroke-width="0.3"');
    } else if (material === 'brushed-brass') {
      modified = modified.replace(/fill="#000000"/gi, 'fill="#2a1e05"');
      modified = modified.replace(/fill="#1E40AF"/gi, 'fill="#211803"');
      modified = modified.replace(/fill="#047857"/gi, 'fill="#1f1602"');
      modified = modified.replace(/stroke="#FF0000"/gi, 'stroke="#3b2b06" stroke-width="0.3"');
    } else if (material === 'cad-dark') {
      // Invert black modules to bright white/silver for dark blueprint readability
      modified = modified.replace(/fill="#000000"/gi, 'fill="#f8fafc"');
      modified = modified.replace(/fill="#1E40AF"/gi, 'fill="#38bdf8"');
      modified = modified.replace(/stroke="#FF0000"/gi, 'stroke="#ef4444" stroke-width="0.25"');
    }

    return modified;
  };

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-[#eef2f6]' : 'bg-[#12161f]'
    }`}>
      {/* Top Canvas Bar: Material & Brightness Switcher */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-2 border-b gap-2 z-10 text-xs transition-colors duration-200 ${
        isBright 
          ? 'bg-white/90 backdrop-blur-md border-slate-200/90 text-slate-700 shadow-2xs' 
          : 'bg-[#0d1017] border-neutral-800/80 text-neutral-300'
      }`}>
        {/* Material Switcher with Icons */}
        <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
          isBright ? 'bg-slate-100 border-slate-200' : 'bg-[#171b24] border-neutral-800'
        }`}>
          {[
            { id: 'cad-wireframe' as const, label: 'White Bed', icon: Sun, title: 'Bright White CAM Artboard (High Contrast)' },
            { id: 'wood-birch' as const, label: 'Birch', icon: Flame, title: 'Warm Baltic Birch Plywood' },
            { id: 'dark-walnut' as const, label: 'Walnut', icon: Flame, title: 'Dark Walnut Engraved' },
            { id: 'black-slate' as const, label: 'Slate', icon: Moon, title: 'Black Anodized / Slate' },
            { id: 'brushed-brass' as const, label: 'Brass', icon: Sun, title: 'Brushed Brass Metal' },
            { id: 'cad-dark' as const, label: 'Dark CAD', icon: LayoutGrid, title: 'Dark Blueprint CAD' },
          ].map((mat) => {
            const Icon = mat.icon;
            const isSelected = material === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => setMaterial(mat.id)}
                title={mat.title}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? isBright
                      ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                      : 'bg-neutral-800 text-white shadow-xs font-bold'
                    : isBright
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{mat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lighting Mode, Physical Dimensions & Kerf Toggle */}
        <div className={`flex items-center gap-3 text-xs font-mono ${
          isBright ? 'text-slate-600' : 'text-neutral-400'
        }`}>
          {/* Lighting Mode Switcher */}
          <button
            onClick={() => setCanvasLighting((prev) => (prev === 'bright' ? 'dark' : 'bright'))}
            title={isBright ? 'Switch to dark workshop canvas' : 'Switch to bright daylight canvas'}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border font-sans text-xs transition-colors cursor-pointer ${
              isBright 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 font-medium' 
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
          >
            {isBright ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isBright ? 'Bright Canvas' : 'Dark Canvas'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`font-semibold tabular-nums ${isBright ? 'text-slate-900' : 'text-neutral-200'}`}>
              {physicalWidthCm.toFixed(1)} × {physicalHeightCm.toFixed(1)} cm
            </span>
            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-neutral-500'}`}>
              ({physicalWidthMm.toFixed(0)} × {physicalHeightMm.toFixed(0)} mm)
            </span>
          </div>

          <label className={`flex items-center gap-1.5 cursor-pointer ${
            isBright ? 'text-slate-700 hover:text-slate-900' : 'text-neutral-300 hover:text-white'
          }`}>
            <input
              type="checkbox"
              checked={showKerfOverlay}
              onChange={(e) => setShowKerfOverlay(e.target.checked)}
              className="rounded bg-neutral-800 border-neutral-700 text-red-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="text-[11px] font-sans">Kerf Glow</span>
          </label>
        </div>
      </div>

      {/* Main Viewport Workbench Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-8 overflow-auto"
        style={{
          backgroundImage: isBright
            ? 'radial-gradient(circle at 50% 50%, rgba(100, 116, 139, 0.25) 1.5px, transparent 1.5px)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Scale transformation wrapper - The Workpiece Bed */}
        <div
          className="transition-transform duration-150 ease-out flex items-center justify-center relative p-6 rounded-xl"
          style={{
            transform: `scale(${zoom})`,
            ...getMaterialStyles(),
            minWidth: '380px',
            minHeight: '380px',
            maxWidth: '85vw',
            maxHeight: '75vh'
          }}
        >
          {/* Laser Kerf Burn Overlay Simulation if toggled */}
          {showKerfOverlay && (
            <div className="absolute inset-5 rounded-lg pointer-events-none border border-red-500/40 bg-red-500/10 mix-blend-multiply flex items-center justify-center" />
          )}

          {/* Actual Scaled SVG Injection */}
          <div
            className="w-full h-full max-w-[480px] max-h-[480px] flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: getRenderableSvg() }}
          />
        </div>
      </div>

      {/* Floating Bottom Canvas Controls: Zoom & Copy */}
      <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-lg border text-xs shadow-xl transition-colors ${
        isBright
          ? 'bg-white/95 text-slate-700 border-slate-200'
          : 'bg-[#0f131a]/95 text-neutral-300 border-neutral-800'
      }`}>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className={`p-1 transition-colors cursor-pointer ${
            isBright ? 'hover:text-slate-900' : 'hover:text-white'
          }`}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className={`font-mono text-[11px] tabular-nums px-1 ${
          isBright ? 'text-slate-600' : 'text-neutral-400'
        }`}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className={`p-1 transition-colors cursor-pointer ${
            isBright ? 'hover:text-slate-900' : 'hover:text-white'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset zoom"
          className={`p-1 transition-colors cursor-pointer border-l pl-1.5 ml-0.5 ${
            isBright ? 'border-slate-200 hover:text-slate-900' : 'border-neutral-700/60 hover:text-white'
          }`}
        >
          <Maximize2 className="w-3 h-3" />
        </button>

        <button
          onClick={onCopySvg}
          title="Copy SVG XML"
          className={`flex items-center gap-1 px-2 py-0.5 ml-1.5 rounded font-medium transition-colors cursor-pointer text-[11px] ${
            isBright
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
          }`}
        >
          {hasCopied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className={`w-3 h-3 ${isBright ? 'text-slate-500' : 'text-neutral-400'}`} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Layer Color Legend Indicator */}
      {(material === 'cad-wireframe' || material === 'cad-dark') && (
        <div className={`absolute bottom-3 left-3 flex items-center gap-2.5 backdrop-blur-md px-2.5 py-1 rounded-lg border text-[10px] font-mono shadow-xl transition-colors ${
          isBright
            ? 'bg-white/95 text-slate-700 border-slate-200'
            : 'bg-[#0f131a]/95 text-neutral-400 border-neutral-800'
        }`}>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-2xs" style={{ backgroundColor: config.cutLayerColor }} />
            <span>Cut</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-2xs" style={{ backgroundColor: config.engraveLayerColor }} />
            <span>Engrave</span>
          </div>
          {config.hasLogo && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-2xs" style={{ backgroundColor: config.logoLayerColor }} />
              <span>Logo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
