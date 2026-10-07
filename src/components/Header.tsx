import React from 'react';
import { Download, Sliders, FileCode, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onExportSvg: () => void;
  onExportDxf: () => void;
  onOpenCalibration: () => void;
  activeView: 'editor' | 'specs';
  setActiveView: (view: 'editor' | 'specs') => void;
  isScannable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExportSvg,
  onExportDxf,
  onOpenCalibration,
  activeView,
  setActiveView,
  isScannable
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-[#0c0e12] shrink-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
          QR
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white block leading-tight">
            CNC Vector QR Studio
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Laser & Router Kerf Engine
          </span>
        </div>
      </div>

      {/* Zone 2: clean text navigation links with icons */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-400">
        <button
          onClick={() => setActiveView('editor')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'editor' ? 'text-white font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          Generator
        </button>
        <button
          onClick={() => setActiveView('specs')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            activeView === 'specs' ? 'text-white font-semibold' : 'hover:text-neutral-200'
          }`}
        >
          CAM Specs
        </button>
        <button
          onClick={onOpenCalibration}
          className="transition-colors whitespace-nowrap cursor-pointer hover:text-neutral-200 flex items-center gap-1.5"
        >
          <Sliders className="w-3 h-3 text-neutral-400" />
          <span>Kerf Ladder</span>
        </button>
      </nav>

      {/* Zone 3: Primary export actions */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 mr-1 text-[11px] text-neutral-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isScannable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="font-mono">{isScannable ? 'OK' : 'Warn'}</span>
        </div>

        <button
          onClick={onExportDxf}
          title="Export CAD DXF"
          className="px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-md hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5 text-neutral-400" />
          <span>DXF</span>
        </button>

        <button
          onClick={onExportSvg}
          title="Download Vector SVG"
          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-red-950 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>SVG</span>
        </button>
      </div>
    </header>
  );
};
