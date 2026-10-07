import React from 'react';
import { Flame, Crosshair, Layers, Tag, Square } from 'lucide-react';
import { QRConfig } from '../types/qr';
import { LOGO_PRESETS } from '../utils/logoPresets';

interface PresetBarProps {
  onApplyPreset: (partial: Partial<QRConfig>) => void;
  activeDotScale?: number;
}

export const PresetBar: React.FC<PresetBarProps> = ({ onApplyPreset, activeDotScale }) => {
  const defaultLogo = LOGO_PRESETS.find((p) => p.id === 'default')?.svgContent || LOGO_PRESETS[0]?.svgContent || '';
  const laserLogo = LOGO_PRESETS.find((p) => p.id === 'laser')?.svgContent || '';
  const gearLogo = LOGO_PRESETS.find((p) => p.id === 'mechanical')?.svgContent || '';

  const presets = [
    {
      id: 'laser-wood',
      title: 'Wood Laser',
      icon: Flame,
      tooltip: '0.45 kerf dots · 20% Monogram logo · Level H',
      config: {
        dotScale: 0.45,
        moduleShape: 'circle' as const,
        finderStyle: 'dots' as const,
        errorCorrection: 'H' as const,
        border: 4,
        targetSizeCm: 6.0,
        hasLogo: true,
        logoScale: 0.20,
        clearRadiusRatio: 1.25,
        cutoutShape: 'circle' as const,
        logoMode: 'engrave' as const,
        logoSvgContent: defaultLogo,
        logoPresetName: 'Default',
        plateShape: 'none' as const,
        compoundPath: true
      }
    },
    {
      id: 'laser-keytag',
      title: 'Wood Keytag',
      icon: Tag,
      tooltip: 'Rounded plate · Lanyard hole · Baltic Birch',
      config: {
        dotScale: 0.45,
        moduleShape: 'circle' as const,
        finderStyle: 'dots' as const,
        errorCorrection: 'H' as const,
        targetSizeCm: 4.5,
        plateShape: 'rounded-rect' as const,
        platePaddingCm: 0.6,
        plateCornerRadiusCm: 0.6,
        mountingHoles: 'top-keychain' as const,
        holeDiameterCm: 0.45,
        holeInsetCm: 0.45,
        hasLogo: true,
        logoScale: 0.18,
        clearRadiusRatio: 1.20,
        compoundPath: true,
        logoSvgContent: laserLogo,
        logoPresetName: 'Laser'
      }
    },
    {
      id: 'cnc-router',
      title: 'CNC Router',
      icon: Crosshair,
      tooltip: 'Center peck points · 4 corner M3 holes',
      config: {
        dotScale: 0.35,
        moduleShape: 'drill-cross' as const,
        finderStyle: 'dots' as const,
        errorCorrection: 'M' as const,
        targetSizeCm: 8.0,
        plateShape: 'square' as const,
        platePaddingCm: 0.8,
        mountingHoles: '4-corners' as const,
        holeDiameterCm: 0.32,
        holeInsetCm: 0.5,
        hasLogo: true,
        logoScale: 0.22,
        clearRadiusRatio: 1.30,
        cutoutShape: 'square' as const,
        logoPresetName: 'Mechanical',
        logoSvgContent: gearLogo,
        compoundPath: false
      }
    },
    {
      id: 'metal-slate',
      title: 'Dark Slate',
      icon: Layers,
      tooltip: 'Inverted negative · Kerf square · Chamfer plate',
      config: {
        dotScale: 0.85,
        moduleShape: 'square' as const,
        finderStyle: 'classic' as const,
        invertModules: true,
        errorCorrection: 'Q' as const,
        targetSizeCm: 5.0,
        plateShape: 'chamfer' as const,
        platePaddingCm: 0.4,
        plateCornerRadiusCm: 0.5,
        mountingHoles: 'none' as const,
        hasLogo: false,
        compoundPath: true
      }
    },
    {
      id: 'solid-vector',
      title: 'Solid (1.0)',
      icon: Square,
      tooltip: 'Zero kerf offset · Sharp digital modules',
      config: {
        dotScale: 1.00,
        moduleShape: 'square' as const,
        finderStyle: 'classic' as const,
        errorCorrection: 'M' as const,
        border: 4,
        targetSizeCm: 6.0,
        plateShape: 'none' as const,
        hasLogo: false,
        compoundPath: true
      }
    }
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0c0e12] border-b border-neutral-800/80 overflow-x-auto scrollbar-none text-xs">
      <span className="text-[11px] font-mono text-neutral-400 shrink-0 font-medium mr-1">
        Presets:
      </span>
      {presets.map((preset) => {
        const Icon = preset.icon;
        return (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset.config)}
            title={preset.tooltip}
            className="px-2.5 py-1 bg-[#141820] hover:bg-[#1e2330] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Icon className="w-3 h-3 text-neutral-400" />
            <span className="font-medium text-[11px]">{preset.title}</span>
          </button>
        );
      })}
    </div>
  );
};
