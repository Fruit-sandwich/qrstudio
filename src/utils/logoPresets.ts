export interface LogoPreset {
  id: string;
  name: string;
  category: string;
  svgContent: string;
}

export const BRAND_DEFAULT_SVG = `<svg viewBox="0 0 30.098902 30.098902" fill="currentColor">
  <g transform="translate(-76.1334,-77.891403)">
    <path
      fill="currentColor"
      d="m 81.588998,87.59083 c -1.437905,-0.01968 -4.044119,0.452284 -4.044119,0.452284 l 0.850647,2.259562 c 2.846468,-0.880353 4.95948,-0.469606 5.194241,1.320443 0.23476,1.790048 -0.631208,3.060649 -2.083563,3.374672 -1.085765,0.234757 -1.839113,-0.307065 -1.643101,-1.20311 0.205415,-0.939037 1.379107,-0.410655 1.379107,-0.410655 l 0.439989,-1.819574 c -2.230221,-1.203137 -4.665543,0.968481 -4.107987,3.140016 0.5625,2.190789 3.198332,2.963953 5.135103,1.995564 1.936771,-0.968389 3.257465,-2.46506 2.964015,-5.428903 -0.293448,-2.963852 -2.647161,-3.480561 -3.550668,-3.638671 -0.146725,-0.02563 -0.328249,-0.03882 -0.533664,-0.04166 z m 19.317902,0 c -0.20541,0.0027 -0.38693,0.01593 -0.53366,0.04166 -0.903508,0.15811 -3.257693,0.674819 -3.551144,3.638671 -0.293451,2.963843 1.027248,4.460513 2.964021,5.428902 1.936773,0.968389 4.573083,0.195225 5.135583,-1.995563 0.55755,-2.171536 -1.87825,-4.343153 -4.10847,-3.140016 l 0.43999,1.819573 c 0,0 1.17416,-0.528382 1.37958,0.410656 0.19601,0.896045 -0.55781,1.437866 -1.64357,1.203109 -1.452354,-0.314022 -2.318337,-1.584624 -2.083571,-3.374672 0.234761,-1.790048 2.347781,-2.200795 5.194251,-1.320442 l 0.85112,-2.259563 c 0,0 -2.60622,-0.471949 -4.04413,-0.452284 z m -9.905438,0.276294 c -3.227988,-0.08807 -3.505902,0.918219 -3.785328,3.052007 -0.322801,2.465032 1.789801,2.435543 3.931994,2.494228 1.878075,0.08807 1.760889,1.819052 0.675121,1.789755 0,0 -5.546435,-0.146657 -6.192025,-0.146657 l -1.643101,2.259553 c 0,0 8.715314,0.20547 9.331559,-0.117323 0.616244,-0.322803 1.115384,-0.586682 1.584908,-2.758218 0.469523,-2.171526 -2.024943,-2.993386 -3.022674,-3.022683 -0.997732,-0.0293 -2.171719,-8.2e-5 -1.819574,-0.909777 0.352136,-0.909696 0.557541,-0.645322 5.634235,-0.645322 l 1.614241,-1.96623 c 0,0 -3.081395,0.05878 -6.309356,-0.0293 z"
    />
  </g>
</svg>`;

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'default',
    name: 'Default',
    category: 'Default',
    svgContent: BRAND_DEFAULT_SVG
  },
  {
    id: 'laser',
    name: 'Laser',
    category: 'Laser',
    svgContent: `<svg viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="4"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="50" cy="50" r="6" fill="currentColor"/>
      <line x1="50" y1="10" x2="50" y2="30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="70" x2="50" y2="90" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="10" y1="50" x2="30" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <line x1="70" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'scan-me',
    name: 'Scan Me',
    category: 'Scan Me',
    svgContent: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M22 18 H38 V26 H30 V34 H22 Z"/>
      <path d="M78 18 H62 V26 H70 V34 H78 Z"/>
      <path d="M22 82 H38 V74 H30 V66 H22 Z"/>
      <path d="M78 82 H62 V74 H70 V66 H78 Z"/>
      <text x="50" y="44" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">SCAN</text>
      <text x="50" y="62" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">ME</text>
    </svg>`
  },
  {
    id: 'security',
    name: 'Security',
    category: 'Security',
    svgContent: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 15 L78 26 V52 C78 70 66 83 50 89 C34 83 22 70 22 52 V26 Z"/>
      <path d="M50 24 L70 33 V52 C70 65 61 75 50 80 C39 75 30 65 30 52 V33 Z" fill="none" stroke="white" stroke-width="3"/>
      <path d="M42 48 L48 54 L60 40" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    category: 'Mechanical',
    svgContent: `<svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M45 10 H55 L57 20 C60 21 63 23 66 25 L75 20 L82 27 L77 36 C79 39 81 42 82 45 L92 47 V57 L82 59 C81 62 79 65 77 68 L82 77 L75 84 L66 79 C63 81 60 83 57 84 L55 94 H45 L43 84 C40 83 37 81 34 79 L25 84 L18 77 L23 68 C21 65 19 62 18 59 L8 57 V47 L18 45 C19 42 21 39 23 36 L18 27 L25 20 L34 25 C37 23 40 21 43 20 Z"/>
      <circle cx="50" cy="50" r="18" fill="white"/>
      <circle cx="50" cy="50" r="9" fill="currentColor"/>
    </svg>`
  }
];
