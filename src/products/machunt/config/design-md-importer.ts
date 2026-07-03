/**
 * DESIGN.md importer — converts a DESIGN.md (YAML) file into ThemeVars.
 * Compatible with the awesome-design-md format by VoltAgent.
 *
 * Usage:
 *   import { importDesignMd } from './config/design-md-importer';
 *   const theme = importDesignMd(designMdYamlContent);
 */

import type { ThemeVars, ThemeGlowOrb } from './themes/types';

interface DesignMdColors {
  [key: string]: string;
}

interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

interface DesignMdTokens {
  name?: string;
  description?: string;
  colors: DesignMdColors;
  typography: Record<string, TypographyToken>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string>;
  components?: Record<string, any>;
}

function parseYamlFrontmatter(content: string): DesignMdTokens | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const tokens: DesignMdTokens = { colors: {}, typography: {} };

  let currentSection: string | null = null;
  let currentToken: string | null = null;
  let currentObj: Record<string, any> = {};

  const lines = yaml.split('\n');

  for (const line of lines) {
    // Skip empty / comment lines
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);

    // Top-level key
    if (indent === 0) {
      const key = line.split(':')[0].trim();
      if (['colors', 'typography', 'rounded', 'spacing', 'components'].includes(key)) {
        currentSection = key;
        continue;
      }
      if (key === 'name') tokens.name = line.split(':').slice(1).join(':').trim();
      if (key === 'description')
        tokens.description = line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
      currentSection = null;
      currentToken = null;
      continue;
    }

    if (!currentSection) continue;

    // Section key (indent 2)
    if (indent === 2) {
      const key = line.split(':')[0].trim();
      const value = line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');

      if (currentSection === 'colors') {
        tokens.colors[key] = value;
        continue;
      }

      if (currentSection === 'rounded' || currentSection === 'spacing') {
        if (!tokens[currentSection]) (tokens as any)[currentSection] = {};
        (tokens as any)[currentSection]![key] = value;
        continue;
      }

      if (currentSection === 'typography') {
        currentToken = key;
        currentObj = {};
        continue;
      }

      if (currentSection === 'components') {
        currentToken = key;
        currentObj = {};
        continue;
      }
      continue;
    }

    // Nested properties (indent 4)
    if (indent === 4 && currentToken) {
      const key = line.split(':')[0].trim();
      const rawValue = line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');

      if (currentSection === 'typography') {
        if (key === 'fontFamily') currentObj.fontFamily = rawValue;
        else if (key === 'fontSize') currentObj.fontSize = parseInt(rawValue) || 14;
        else if (key === 'fontWeight') currentObj.fontWeight = parseInt(rawValue) || 400;
        else if (key === 'lineHeight') currentObj.lineHeight = parseFloat(rawValue) || 1.4;
        else if (key === 'letterSpacing') currentObj.letterSpacing = parseFloat(rawValue) || 0;

        tokens.typography[currentToken!] = { ...currentObj } as TypographyToken;
        continue;
      }

      if (currentSection === 'components') {
        if (key === 'backgroundColor') currentObj.backgroundColor = rawValue;
        else if (key === 'textColor') currentObj.textColor = rawValue;
        else if (key === 'rounded') currentObj.rounded = rawValue;
        else if (key === 'padding') currentObj.padding = rawValue;

        if (!tokens.components) tokens.components = {};
        (tokens.components as any)[currentToken!] = { ...currentObj };
        continue;
      }
    }
  }

  return tokens;
}

/** Extract font family from DESIGN.md typography */
function extractFontFamily(typography: Record<string, TypographyToken>): { display: string; body: string } {
  // Find the largest display token
  const displayKeys = Object.keys(typography).filter(
    (k) => k.includes('display') || k.includes('hero') || k.includes('heading')
  );
  const bodyKeys = Object.keys(typography).filter((k) => k.includes('body'));

  const displayFont = displayKeys.length > 0
    ? typography[displayKeys[0]].fontFamily.split(',')[0].trim()
    : 'Inter';

  const bodyFont = bodyKeys.length > 0
    ? typography[bodyKeys[0]].fontFamily.split(',')[0].trim()
    : 'Inter';

  // Map proprietary fonts to available Google Fonts
  const fontMap: Record<string, string> = {
    'Copernicus': 'Playfair Display',
    'Tiempos Headline': 'Playfair Display',
    'sohne-var': 'Inter',
    'Sohne': 'Inter',
    'StyreneB': 'Inter',
    'SF Pro Display': 'Inter',
    'SF Pro Text': 'Inter',
    'system-ui': 'Inter',
    '-apple-system': 'Inter',
    'Helvetica Neue': 'Inter',
    'Helvetica': 'Inter',
    'ui-monospace': 'JetBrains Mono',
    'JetBrains Mono': 'JetBrains Mono',
    'Fira Code': 'Fira Code',
  };

  const display = fontMap[displayFont] || displayFont.replace(/['"]/g, '');
  const body = fontMap[bodyFont] || bodyFont.replace(/['"]/g, '');

  return {
    display: display.startsWith('"') ? display.slice(1, -1) : display,
    body: body.startsWith('"') ? display.slice(1, -1) : body,
  };
}

/** Derive particle config from color palette */
function deriveParticles(colors: DesignMdColors) {
  const primary = colors.primary || colors.ink || '#3b82f6';
  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);

  // Convert to HSL roughly
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = (max - min) / 255;
    if (max === r) h = ((g - b) / 255 / d + 6) % 6;
    else if (max === g) h = ((b - r) / 255 / d) + 2;
    else h = ((r - g) / 255 / d) + 4;
    h = Math.round(h * 60);
  }

  const isDark =
    (colors.canvas && parseInt(colors.canvas.slice(1, 3), 16) < 60) ||
    (colors.ink && parseInt(colors.ink.slice(1, 3), 16) > 200);

  return {
    hueMin: (h - 30 + 360) % 360,
    hueMax: (h + 30) % 360,
    connectionColor: isDark
      ? `rgba(${r}, ${g}, ${b}, 0.06)`
      : `rgba(${r}, ${g}, ${b}, 0.04)`,
    countMultiplier: isDark ? 0.5 : 0.2,
  };
}

/** Derive hero orbs from accent colors */
function deriveHeroOrbs(colors: DesignMdColors): ThemeGlowOrb[] {
  const primary = colors.primary || '#3b82f6';
  const keys = Object.keys(colors);
  const accentKeys = keys.filter((k) => k.includes('accent') || k.includes('ruby') || k.includes('magenta') || k.includes('amber'));
  const secondary = accentKeys.length > 0 ? colors[accentKeys[0]] : primary;

  const orbs: ThemeGlowOrb[] = [
    {
      color: `bg-${primaryToTailwind(primary)}/15`,
      size: 'w-[450px] h-[450px]',
      pos: 'top-[-200px] right-[-100px]',
    },
    {
      color: `bg-${primaryToTailwind(secondary)}/10`,
      size: 'w-[350px] h-[350px]',
      pos: 'bottom-[-100px] left-[30%]',
    },
  ];

  return orbs;
}

/** Map hex to approximate Tailwind color */
function primaryToTailwind(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (r > g && r > b && r > 180) return 'red-500';
  if (r > g && b > g && b > 150) return 'purple-500';
  if (g > r && g > b) return 'emerald-500';
  if (b > r && b > g) return 'blue-500';
  if (r > 200 && g > 150 && b < 100) return 'amber-500';
  if (r > 200 && g < 100 && b > 100) return 'pink-500';
  if (r < 50 && g < 50 && b < 50) return 'white/5';

  return 'indigo-500';
}

/** Detect if the palette is dark or light */
function detectDarkMode(colors: DesignMdColors): boolean {
  const canvas = colors.canvas || colors['surface-soft'] || colors.background || '#ffffff';
  const r = parseInt(canvas.slice(1, 3), 16);
  const g = parseInt(canvas.slice(3, 5), 16);
  const b = parseInt(canvas.slice(5, 7), 16);
  return (r + g + b) / 3 < 128;
}

/**
 * Import a DESIGN.md string and convert to ThemeVars.
 */
export function importDesignMd(mdContent: string, name: string): ThemeVars | null {
  const tokens = parseYamlFrontmatter(mdContent);
  if (!tokens) return null;

  const isDark = detectDarkMode(tokens.colors);

  // Core colors
  const bg = tokens.colors.canvas || tokens.colors.background || (isDark ? '#0a0a0f' : '#ffffff');
  const bg2 = tokens.colors['canvas-soft'] || tokens.colors['surface-soft'] || (isDark ? '#111118' : '#f5f5f7');
  const bg3 = tokens.colors['surface-card'] || tokens.colors['surface-cream-strong'] || (isDark ? '#16161f' : '#e8e8ed');
  const text = tokens.colors.ink || tokens.colors.text || (isDark ? '#ffffff' : '#141413');
  const text2 = tokens.colors['ink-secondary'] || tokens.colors.body || (isDark ? '#d1d5db' : '#3d3d3a');
  const textMuted = tokens.colors['ink-mute'] || tokens.colors.muted || (isDark ? '#6b7280' : '#6c6a64');
  const primary = tokens.colors.primary || '#3b82f6';
  const secondary = tokens.colors['accent-teal'] || tokens.colors.ruby || tokens.colors['primary-soft'] || primary;
  const badgeBg = isDark
    ? `rgba(${parseInt(primary.slice(1,3),16)}, ${parseInt(primary.slice(3,5),16)}, ${parseInt(primary.slice(5,7),16)}, 0.06)`
    : `rgba(${parseInt(primary.slice(1,3),16)}, ${parseInt(primary.slice(3,5),16)}, ${parseInt(primary.slice(5,7),16)}, 0.08)`;
  const badgeBorder = isDark
    ? `rgba(${parseInt(primary.slice(1,3),16)}, ${parseInt(primary.slice(3,5),16)}, ${parseInt(primary.slice(5,7),16)}, 0.15)`
    : `rgba(${parseInt(primary.slice(1,3),16)}, ${parseInt(primary.slice(3,5),16)}, ${parseInt(primary.slice(5,7),16)}, 0.2)`;
  const glassBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  const fonts = extractFontFamily(tokens.typography);
  const particles = deriveParticles(tokens.colors);
  const orbs = deriveHeroOrbs(tokens.colors);

  const description = tokens.description || `Imported from DESIGN.md (${name})`;

  return {
    name,
    label: `${name} (DESIGN.md)`,
    description,
    source: 'brand-design-md',
    vars: {
      '--color-surface': bg,
      '--color-surface-2': bg2,
      '--color-surface-3': bg3,
      '--color-glass-bg': glassBg,
      '--color-glass-border': glassBorder,
      '--color-glass-highlight': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
      '--gradient-hero': isDark
        ? `linear-gradient(180deg, ${bg} 0%, ${bg2} 100%)`
        : `linear-gradient(180deg, ${bg2} 0%, ${bg} 100%)`,
      '--gradient-card-hover': `linear-gradient(to right, rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.04), rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.02))`,
      '--gradient-card-top': `linear-gradient(to right, transparent, rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.15), rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.15), transparent)`,
      '--badge-bg': badgeBg,
      '--badge-border': badgeBorder,
      '--badge-text': primary,
      '--accent-primary': primary,
      '--accent-secondary': secondary,
      '--text-primary': text,
      '--text-secondary': text2,
      '--text-muted': textMuted,
      '--glow-line': `linear-gradient(90deg, transparent, rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.2), rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},.2), transparent)`,
    },
    particles,
    heroOrbs: orbs,
    fonts,
  };
}

/**
 * Load DESIGN.md from file content string.
 * For file-system reading, pipe the file through on the Node.js side.
 *
 * Node.js usage:
 *   const fs = await import('node:fs/promises');
 *   const content = await fs.readFile(filePath, 'utf-8');
 *   const theme = importDesignMd(content, themeName);
 */

