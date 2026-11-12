import { LANGUAGE_BY_ID } from '../data/languages'
import { BOTTOM_ROW_CODES, HOME_ROW_CODES, LAYOUTS, TOP_ROW_CODES, lettersOnRows } from '../data/layouts'
import type { LessonId, Settings } from './types'

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const capitalize = (w: string) => w.charAt(0).toLocaleUpperCase() + w.slice(1)

/** Pick N words without immediate repeats. */
function pickWords(pool: string[], n: number): string[] {
  const out: string[] = []
  let bag: string[] = []
  while (out.length < n) {
    if (bag.length === 0) bag = shuffle(pool)
    const w = bag.pop()!
    if (out[out.length - 1] !== w) out.push(w)
  }
  return out
}

function decorate(words: string[], settings: Settings): string[] {
  const { punctuation, numbers, language } = settings
  const noDigits = language === 'kk'
  let sentenceStart = true
  return words.map((raw, i) => {
    let w = raw
    const isLast = i === words.length - 1
    if (numbers && !noDigits && Math.random() < 0.12) {
      w = String(Math.floor(Math.random() * (Math.random() < 0.5 ? 100 : 2100)))
    }
    if (!punctuation) return w.toLocaleLowerCase()
    w = sentenceStart ? capitalize(w) : w.toLocaleLowerCase()
    sentenceStart = false
    const r = Math.random()
    if (isLast || r < 0.1) {
      w += rand(['.', '.', '.', '!', '?'])
      sentenceStart = true
    } else if (r < 0.22) {
      w += rand([',', ',', ',', ';', ':'])
    } else if (r < 0.25) {
      w = `(${w})`
    } else if (r < 0.28) {
      w = `"${w}"`
    } else if (r < 0.3 && !isLast) {
      w += ' -'
    }
    return w
  })
}

/** Pseudo-words built from a restricted alphabet — classic finger drills. */
function drillWords(letters: string[], n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const len = 2 + Math.floor(Math.random() * 4)
    let w = ''
    for (let j = 0; j < len; j++) {
      let ch = rand(letters)
      // avoid triple repeats
      while (w.length >= 2 && w.endsWith(ch + ch)) ch = rand(letters)
      w += ch
    }
    out.push(w)
  }
  return out
}

export function lessonLetters(settings: Settings, lesson: LessonId): string[] {
  const lang = LANGUAGE_BY_ID[settings.language]
  const layout = LAYOUTS[lang.layoutId]
  switch (lesson) {
    case 'home':
      return lettersOnRows(layout, HOME_ROW_CODES)
    case 'top':
      return lettersOnRows(layout, TOP_ROW_CODES)
    case 'bottom':
      return lettersOnRows(layout, BOTTOM_ROW_CODES)
    default:
      return lettersOnRows(layout, [...HOME_ROW_CODES, ...TOP_ROW_CODES, ...BOTTOM_ROW_CODES])
  }
}

export interface Generated {
  text: string
  title?: string
}

export const LESSON_LENGTH = 30

/**
 * Builds the target text for the given settings.
 * `weakLetters` drives the "weak keys" lesson.
 */
export function generate(settings: Settings, weakLetters: string[] = []): Generated {
  const lang = LANGUAGE_BY_ID[settings.language]
  switch (settings.mode) {
    case 'time':
      return { text: decorate(pickWords(lang.words, 120), settings).join(' ') }
    case 'words':
      return { text: decorate(pickWords(lang.words, settings.words), settings).join(' ') }
    case 'text': {
      const t = rand(lang.texts)
      return { text: t.body, title: t.title }
    }
    case 'lesson': {
      if (settings.lesson === 'weak' && weakLetters.length) {
        const pool = lang.words.filter((w) => weakLetters.some((l) => w.toLocaleLowerCase().includes(l)))
        const words = pool.length >= 8 ? pickWords(pool, LESSON_LENGTH) : drillWords(weakLetters, LESSON_LENGTH)
        return { text: words.map((w) => w.toLocaleLowerCase()).join(' ') }
      }
      const letters = lessonLetters(settings, settings.lesson === 'weak' ? 'all' : settings.lesson)
      return { text: drillWords(letters, LESSON_LENGTH).join(' ') }
    }
  }
}

/** More words for the timed mode, appended when the user gets close to the end. */
export function moreWords(settings: Settings, n = 60): string {
  const lang = LANGUAGE_BY_ID[settings.language]
  return decorate(pickWords(lang.words, n), { ...settings }).join(' ')
}
