import type { ThemeVars, ThemeName } from './types';
import { aurora } from './aurora';
import { neon } from './neon';
import { minimal } from './minimal';
import { ocean } from './ocean';
import { sunset } from './sunset';
import { forest } from './forest';
import { claude, stripe, linear, vercel, notion, apple, nike, spotify } from './brands';

const themeRegistry: Record<ThemeName, ThemeVars> = {
  aurora,
  neon,
  minimal,
  ocean,
  sunset,
  forest,
  claude,
  stripe,
  linear,
  vercel,
  notion,
  apple,
  nike,
  spotify,
};

const allThemes: ThemeVars[] = Object.values(themeRegistry);

export function getTheme(name: ThemeName): ThemeVars {
  return themeRegistry[name];
}

export function getAllThemes(): ThemeVars[] {
  return allThemes;
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(themeRegistry) as ThemeName[];
}

/** Group themes by source */
export function getBuiltinThemes(): ThemeVars[] {
  return allThemes.filter((t) => !t.source || t.source === 'builtin');
}

export function getBrandThemes(): ThemeVars[] {
  return allThemes.filter((t) => t.source === 'brand-design-md');
}

/**
 * Inject theme CSS variables into :root.
 * Call once on App mount.
 */
export function injectTheme(theme: ThemeVars): void {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export { themeRegistry };
export type { ThemeVars, ThemeName };
