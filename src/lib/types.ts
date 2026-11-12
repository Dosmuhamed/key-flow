import type { LanguageId } from '../data/languages'

export type Mode = 'time' | 'words' | 'text' | 'lesson'

export type LessonId = 'home' | 'top' | 'bottom' | 'all' | 'weak'

export interface Settings {
  language: LanguageId
  mode: Mode
  time: number
  words: number
  lesson: LessonId
  punctuation: boolean
  numbers: boolean
  /** do not advance on a wrong key */
  strict: boolean
  showKeyboard: boolean
  theme: 'light' | 'dark'
  /** speed unit: words per minute or characters per minute */
  unit: 'wpm' | 'cpm'
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'ru',
  mode: 'time',
  time: 30,
  words: 25,
  lesson: 'home',
  punctuation: false,
  numbers: false,
  strict: false,
  showKeyboard: true,
  theme: 'light',
  unit: 'cpm',
}

export const TIME_OPTIONS = [15, 30, 60, 120]
export const WORD_OPTIONS = [10, 25, 50, 100]

/** One recorded keystroke. */
export interface KeyEvent {
  /** ms since the first keystroke */
  t: number
  /** 'char' – a printable key, 'back' – backspace */
  kind: 'char' | 'back'
  /** typed character (for 'char') */
  typed?: string
  /** expected character at the position */
  expected?: string
  /** position in the target text before the event */
  index: number
  correct?: boolean
  /** physical key code */
  code?: string
}

export interface TestRun {
  id: string
  date: number
  settings: Settings
  target: string
  /** what the user ended up with */
  typed: string
  events: KeyEvent[]
  /** ms */
  duration: number
  /** label for text mode */
  title?: string
}
