export interface ThemeGlowOrb {
  color: string;
  size: string;
  pos: string;
}

export interface ThemeVars {
  name: string;
  label: string;
  description: string;
  /** CSS variable key-value pairs — injected into :root */
  vars: Record<string, string>;
  /** ParticleField props */
  particles: {
    hueMin: number;
    hueMax: number;
    connectionColor: string;
    countMultiplier: number;
  };
  /** Hero glow orbs */
  heroOrbs: ThemeGlowOrb[];
  /** Google Fonts to load — display + body */
  fonts: {
    display: string;
    body: string;
  };
  /** Whether this is a brand-imported theme */
  source?: 'builtin' | 'brand-design-md';
}

export type BuiltinThemeName = 'aurora' | 'neon' | 'minimal' | 'ocean' | 'sunset' | 'forest';

export type BrandThemeName =
  | 'claude'
  | 'stripe'
  | 'linear'
  | 'vercel'
  | 'notion'
  | 'apple'
  | 'nike'
  | 'spotify';

export type ThemeName = BuiltinThemeName | BrandThemeName;
