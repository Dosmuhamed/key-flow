import type { LanguageId } from '../data/languages'

export type Mode = 'time' | 'words' | 'text' | 'lesson'

export type LessonId = 'home' | 'top' | 'bottom' | 'all' | 'weak'

/**
 * Word difficulty. Typing sites usually grade by vocabulary size (200 / 1k / 5k / 10k most
 * frequent words); without a backend we grade by frequency, word length and extra symbols.
 */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert'
export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'expert']

export interface Settings {
  language: LanguageId
  mode: Mode
  time: number
  words: number
  lesson: LessonId
  difficulty: Difficulty
  /** index of the passage in text mode, -1 = random */
  textId: number
  punctuation: boolean
  numbers: boolean
  /** do not advance on a wrong key */
  strict: boolean
  showKeyboard: boolean
  /** speed unit: words per minute or characters per minute */
  unit: 'wpm' | 'cpm'
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'ru',
  mode: 'time',
  time: 30,
  words: 25,
  lesson: 'home',
  difficulty: 'normal',
  textId: -1,
  punctuation: false,
  numbers: false,
  strict: false,
  showKeyboard: true,
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
