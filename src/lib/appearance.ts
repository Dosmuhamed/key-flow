export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentId = 'teal' | 'blue' | 'violet' | 'green' | 'amber' | 'rose'
export type RadiusId = 'sharp' | 'normal' | 'round'
export type TypeFont = 'plex' | 'jetbrains' | 'roboto' | 'fira' | 'ptmono' | 'onest'
export type TypeSize = 's' | 'm' | 'l'
export type CaretStyle = 'line' | 'block' | 'underline'
export type KeyStyle = 'sculpted' | 'flat' | 'outline'
export type Colorway = 'auto' | 'graphite' | 'retro' | 'milk' | 'navy' | 'mint' | 'lavender'

export interface Appearance {
  mode: ThemeMode
  accent: AccentId
  radius: RadiusId
  font: TypeFont
  size: TypeSize
  caret: CaretStyle
  smoothCaret: boolean
  keyStyle: KeyStyle
  colorway: Colorway
  fingerZones: boolean
  highlightNext: boolean
}

export const DEFAULT_APPEARANCE: Appearance = {
  mode: 'system',
  accent: 'teal',
  radius: 'normal',
  font: 'plex',
  size: 'm',
  caret: 'line',
  smoothCaret: true,
  keyStyle: 'sculpted',
  colorway: 'auto',
  fingerZones: false,
  highlightNext: true,
}

/* ---------- palettes ---------- */

interface AccentTone {
  accent: string
  soft: string
  ink: string
  skirt: string
}

export const ACCENTS: Record<AccentId, { light: AccentTone; dark: AccentTone }> = {
  teal: {
    light: { accent: '#0b7f8a', soft: '#cfe8ea', ink: '#ffffff', skirt: '#075e66' },
    dark: { accent: '#3cc3cf', soft: '#163a40', ink: '#062226', skirt: '#1f8a94' },
  },
  blue: {
    light: { accent: '#2f5fd0', soft: '#d9e3fa', ink: '#ffffff', skirt: '#21459a' },
    dark: { accent: '#6f9bff', soft: '#1b2a4d', ink: '#0a1530', skirt: '#4669c4' },
  },
  violet: {
    light: { accent: '#6b4fd1', soft: '#e4ddfa', ink: '#ffffff', skirt: '#4e37a3' },
    dark: { accent: '#a58bff', soft: '#2a2150', ink: '#140b33', skirt: '#7a61d6' },
  },
  green: {
    light: { accent: '#2f8a3f', soft: '#d7ecd9', ink: '#ffffff', skirt: '#1f6a2c' },
    dark: { accent: '#5cc96e', soft: '#18361e', ink: '#06210c', skirt: '#3d9c4d' },
  },
  amber: {
    light: { accent: '#b86a00', soft: '#f6e3c4', ink: '#ffffff', skirt: '#8a4f00' },
    dark: { accent: '#f2a93b', soft: '#3d2c12', ink: '#2a1800', skirt: '#c4831c' },
  },
  rose: {
    light: { accent: '#c2416b', soft: '#f7d9e2', ink: '#ffffff', skirt: '#952c4f' },
    dark: { accent: '#ff7aa2', soft: '#45202d', ink: '#2f0716', skirt: '#d0577d' },
  },
}

const RADII: Record<RadiusId, Record<string, string> | null> = {
  sharp: { '--radius-md': '3px', '--radius-lg': '4px', '--radius-xl': '6px', '--radius-2xl': '8px', '--radius-3xl': '10px' },
  normal: null,
  round: { '--radius-md': '0.6rem', '--radius-lg': '0.8rem', '--radius-xl': '1rem', '--radius-2xl': '1.5rem', '--radius-3xl': '2.25rem' },
}

export const FONTS: Record<TypeFont, { name: string; family: string; url?: string }> = {
  plex: { name: 'IBM Plex Mono', family: "'IBM Plex Mono', ui-monospace, monospace" },
  jetbrains: {
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', ui-monospace, monospace",
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
  },
  roboto: {
    name: 'Roboto Mono',
    family: "'Roboto Mono', ui-monospace, monospace",
    url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap',
  },
  fira: {
    name: 'Fira Code',
    family: "'Fira Code', ui-monospace, monospace",
    url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap',
  },
  ptmono: {
    name: 'PT Mono',
    family: "'PT Mono', ui-monospace, monospace",
    url: 'https://fonts.googleapis.com/css2?family=PT+Mono&display=swap',
  },
  onest: { name: 'Onest', family: "'Onest', ui-sans-serif, system-ui, sans-serif" },
}

/** Text metrics for the main typing area, per size. */
export const TYPE_SIZES: Record<TypeSize, { fontSize: string; lineHeight: number }> = {
  s: { fontSize: '1.4rem', lineHeight: 44 },
  m: { fontSize: '1.85rem', lineHeight: 52 },
  l: { fontSize: '2.25rem', lineHeight: 62 },
}

/** Physical keyboard colorways — override the --kb-* variables. */
export const COLORWAYS: Record<Exclude<Colorway, 'auto'>, Record<string, string>> = {
  graphite: {
    '--kb-case-top': '#2c3036', '--kb-case-bottom': '#22262b', '--kb-case-edge': '#3a3f46', '--kb-plate': '#15181c',
    '--kb-face': '#3d434b', '--kb-skirt': '#2a2e34', '--kb-legend': '#e8ebef',
    '--kb-mod-face': '#2f343a', '--kb-mod-skirt': '#1f2327', '--kb-mod-legend': '#9aa3ad', '--kb-gloss': '0.08',
  },
  retro: {
    '--kb-case-top': '#d8cfbd', '--kb-case-bottom': '#cbc1ad', '--kb-case-edge': '#b8ad97', '--kb-plate': '#a59a85',
    '--kb-face': '#efe8d8', '--kb-skirt': '#cfc5b0', '--kb-legend': '#3b342a',
    '--kb-mod-face': '#8d8a85', '--kb-mod-skirt': '#6c6964', '--kb-mod-legend': '#f2ede4', '--kb-gloss': '0.55',
  },
  milk: {
    '--kb-case-top': '#f6f6f4', '--kb-case-bottom': '#eaeae7', '--kb-case-edge': '#d9d9d5', '--kb-plate': '#d2d2cd',
    '--kb-face': '#ffffff', '--kb-skirt': '#e3e3df', '--kb-legend': '#55554f',
    '--kb-mod-face': '#f1f1ee', '--kb-mod-skirt': '#d6d6d1', '--kb-mod-legend': '#8a8a84', '--kb-gloss': '1',
  },
  navy: {
    '--kb-case-top': '#1f2943', '--kb-case-bottom': '#172036', '--kb-case-edge': '#2b3858', '--kb-plate': '#0d1324',
    '--kb-face': '#2b3758', '--kb-skirt': '#1b2440', '--kb-legend': '#e6ecff',
    '--kb-mod-face': '#d3a94a', '--kb-mod-skirt': '#a17d2c', '--kb-mod-legend': '#1d2740', '--kb-gloss': '0.1',
  },
  mint: {
    '--kb-case-top': '#d3e8df', '--kb-case-bottom': '#c2dbd0', '--kb-case-edge': '#a9c9bb', '--kb-plate': '#9bbcae',
    '--kb-face': '#f4fbf8', '--kb-skirt': '#cfe4da', '--kb-legend': '#24453a',
    '--kb-mod-face': '#7fbfa8', '--kb-mod-skirt': '#5c9c85', '--kb-mod-legend': '#0f2e24', '--kb-gloss': '0.8',
  },
  lavender: {
    '--kb-case-top': '#ded8ef', '--kb-case-bottom': '#cfc7e6', '--kb-case-edge': '#bcb2da', '--kb-plate': '#ada2cf',
    '--kb-face': '#f9f7fe', '--kb-skirt': '#ddd7f0', '--kb-legend': '#3a3060',
    '--kb-mod-face': '#a99ad8', '--kb-mod-skirt': '#8676bd', '--kb-mod-legend': '#ffffff', '--kb-gloss': '0.8',
  },
}

/** Swatch colors for the colorway picker: [case, alpha keys, modifiers]. */
export function colorwaySwatch(id: Colorway): [string, string, string] {
  if (id === 'auto') return ['var(--kb-case-bottom)', 'var(--kb-face)', 'var(--kb-mod-face)']
  const c = COLORWAYS[id]
  return [c['--kb-case-bottom'], c['--kb-face'], c['--kb-mod-face']]
}

/* ---------- persistence & applying ---------- */

const KEY = 'keyflow:appearance'

export function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_APPEARANCE, ...(JSON.parse(raw) as Partial<Appearance>) }
    // migrate the old light/dark switch
    const old = JSON.parse(localStorage.getItem('keyflow:settings') ?? '{}') as { theme?: 'light' | 'dark' }
    if (old.theme) return { ...DEFAULT_APPEARANCE, mode: old.theme }
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_APPEARANCE
}

export function saveAppearance(a: Appearance) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch {
    /* ignore */
  }
}

export const systemDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

export function resolveDark(a: Appearance) {
  return a.mode === 'dark' || (a.mode === 'system' && systemDark())
}

const loadedFonts = new Set<string>()
function ensureFont(font: TypeFont) {
  const url = FONTS[font].url
  if (!url || loadedFonts.has(url)) return
  loadedFonts.add(url)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

/** Loads every selectable font — used while the appearance panel is open, for previews. */
export function preloadFonts() {
  for (const id of Object.keys(FONTS) as TypeFont[]) ensureFont(id)
}

const RADIUS_VARS = ['--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl', '--radius-3xl']

export function applyAppearance(a: Appearance) {
  const root = document.documentElement
  const dark = resolveDark(a)
  root.dataset.theme = dark ? 'dark' : 'light'

  const tone = ACCENTS[a.accent][dark ? 'dark' : 'light']
  root.style.setProperty('--kf-accent', tone.accent)
  root.style.setProperty('--kf-accent-soft', tone.soft)
  root.style.setProperty('--kf-accent-ink', tone.ink)
  root.style.setProperty('--kb-accent-skirt', tone.skirt)

  for (const v of RADIUS_VARS) root.style.removeProperty(v)
  const radii = RADII[a.radius]
  if (radii) for (const [k, v] of Object.entries(radii)) root.style.setProperty(k, v)

  ensureFont(a.font)
  root.style.setProperty('--kf-type-font', FONTS[a.font].family)
}
