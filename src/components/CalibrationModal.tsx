import React from 'react';
import { X, Download, Sliders, Check } from 'lucide-react';
import { QRConfig } from '../types/qr';
import { generateKerfCalibrationStripSVG } from '../utils/calibrationStrip';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRConfig;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  if (!isOpen) return null;

  const stripSvg = generateKerfCalibrationStripSVG(config);

  const handleDownloadStrip = () => {
    const blob = new Blob([stripSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kerf_calibration_test_${Math.round(Date.now() / 1000)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#11141a] border border-neutral-800 rounded-xl max-w-4xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Laser Kerf Calibration Test Ladder
              </h2>
              <p className="text-xs text-neutral-400">
                Engrave this 5-patch test card to determine the optimal dot_scale for your laser tube & wood batch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview of the calibration strip */}
        <div className="bg-[#090b0e] border border-neutral-800 p-4 rounded-lg overflow-x-auto flex items-center justify-center">
          <div
            className="max-w-full"
            dangerouslySetInnerHTML={{ __html: stripSvg }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-300">
          <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80">
            <div className="font-semibold text-white mb-1">1. Cut & Engrave</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Send this file to LightBurn or your laser CAM. Engrave the black dots and cut the outer red outline.
            </p>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80">
            <div className="font-semibold text-white mb-1">2. Scan With Phone</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Test each scale (0.35, 0.45, 0.55, 0.65, 0.75) from 12–18 inches away using your smartphone camera.
            </p>
          </div>
          <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80">
            <div className="font-semibold text-white mb-1">3. Select Best Scale</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Pick the scale that scans fastest without bleeding dots together. Enter it in the Dot Scale slider.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownloadStrip}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-red-950"
          >
            <Download className="w-4 h-4" />
            <span>Download Calibration SVG (220 × 55 mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
