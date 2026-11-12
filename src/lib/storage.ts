import type { LanguageId } from '../data/languages'
import type { ModeParams } from './modeLabel'
import type { Analysis } from './stats'
import { DEFAULT_SETTINGS, type Mode, type Settings } from './types'

const SETTINGS_KEY = 'keyflow:settings'
const HISTORY_KEY = 'keyflow:history'
const LETTERS_KEY = 'keyflow:letters'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be unavailable — results simply aren't remembered */
  }
}

export function loadSettings(): Settings {
  const { theme: _legacyTheme, ...stored } = read<Partial<Settings> & { theme?: unknown }>(SETTINGS_KEY, {})
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(s: Settings) {
  write(SETTINGS_KEY, s)
}

export interface HistoryEntry {
  id: string
  date: number
  language: LanguageId
  mode: Mode
  /** label of entries saved before mode keys existed */
  modeLabel?: string
  /** language-independent id of the mode, see modeKey() */
  modeKey?: string
  params?: ModeParams
  cpm: number
  wpm: number
  accuracy: number
  durationMs: number
  consistency: number
}

export function loadHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, [])
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, 100)
  write(HISTORY_KEY, next)
  return next
}

export function clearHistory() {
  write(HISTORY_KEY, [])
  write(LETTERS_KEY, {})
}

type LetterBook = Partial<Record<LanguageId, Record<string, { count: number; errors: number }>>>

export function recordLetters(language: LanguageId, analysis: Analysis) {
  const book = read<LetterBook>(LETTERS_KEY, {})
  const lang = book[language] ?? {}
  for (const c of analysis.chars) {
    if (c.char === ' ') continue
    const prev = lang[c.char] ?? { count: 0, errors: 0 }
    lang[c.char] = { count: prev.count + c.count, errors: prev.errors + c.errors }
  }
  book[language] = lang
  write(LETTERS_KEY, book)
}

/** Letters with the worst lifetime accuracy for a language (needs some data first). */
export function weakLetters(language: LanguageId, limit = 6): string[] {
  const lang = read<LetterBook>(LETTERS_KEY, {})[language] ?? {}
  return Object.entries(lang)
    .filter(([ch, s]) => s.count >= 3 && s.errors > 0 && /\p{L}/u.test(ch))
    .sort((a, b) => b[1].errors / b[1].count - a[1].errors / a[1].count)
    .slice(0, limit)
    .map(([ch]) => ch)
}
