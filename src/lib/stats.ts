import { LANGUAGE_BY_ID } from '../data/languages'
import { KEY_BY_CODE, LAYOUTS, primaryKey, type Finger } from '../data/layouts'
import type { KeyEvent, TestRun } from './types'

/** Pauses longer than this are not counted towards per-key latency. */
const MAX_LATENCY = 2000

export interface CharStat {
  char: string
  count: number
  errors: number
  accuracy: number
  /** average ms to hit the key correctly (from the previous keystroke) */
  avgMs: number
}

export interface KeyStat {
  count: number
  errors: number
  avgMs: number
}

export interface FingerStat {
  finger: Finger
  count: number
  errors: number
  accuracy: number
  avgMs: number
  share: number
}

export interface TimelinePoint {
  sec: number
  /** cumulative net speed, cpm */
  cpm: number
  /** raw speed within this second (smoothed), cpm */
  raw: number
  errors: number
}

export interface WordStat {
  word: string
  start: number
  ms: number
  cpm: number
  errors: number
}

export interface Confusion {
  expected: string
  typed: string
  count: number
}

export interface Analysis {
  durationMs: number
  cpm: number
  rawCpm: number
  wpm: number
  rawWpm: number
  /** correct keystrokes / all keystrokes */
  accuracy: number
  correctChars: number
  incorrectChars: number
  missedChars: number
  keystrokes: number
  wrongKeystrokes: number
  backspaces: number
  consistency: number
  timeline: TimelinePoint[]
  chars: CharStat[]
  keys: Record<string, KeyStat>
  fingers: FingerStat[]
  confusions: Confusion[]
  words: WordStat[]
  /** positions that had at least one wrong keystroke */
  errorPositions: number[]
}

export const toWpm = (cpm: number) => cpm / 5

const normChar = (c: string) => (c === ' ' ? ' ' : c.toLocaleLowerCase())

interface Acc {
  count: number
  errors: number
  ms: number
  msCount: number
}
const emptyAcc = (): Acc => ({ count: 0, errors: 0, ms: 0, msCount: 0 })

export function analyze(run: TestRun): Analysis {
  const { events, target, typed } = run
  const lang = LANGUAGE_BY_ID[run.settings.language]
  const layout = LAYOUTS[lang.layoutId]
  const durationMs = Math.max(run.duration, 1)
  const minutes = durationMs / 60000

  let keystrokes = 0
  let wrong = 0
  let backspaces = 0
  const charAcc = new Map<string, Acc>()
  const keyAcc = new Map<string, Acc>()
  const fingerAcc = new Map<Finger, Acc>()
  const confusions = new Map<string, number>()
  const errorPositions = new Set<number>()

  let prevT: number | null = null
  for (const ev of events) {
    if (ev.kind === 'back') {
      backspaces++
      prevT = ev.t
      continue
    }
    keystrokes++
    const expected = ev.expected ?? ''
    if (!ev.correct) {
      wrong++
      errorPositions.add(ev.index)
      if (expected) {
        const k = `${expected}\u0000${ev.typed ?? ''}`
        confusions.set(k, (confusions.get(k) ?? 0) + 1)
      }
    }
    if (!expected) {
      prevT = ev.t
      continue
    }
    const dt = prevT === null ? null : ev.t - prevT
    const latency = ev.correct && dt !== null && dt < MAX_LATENCY ? dt : null

    const add = (acc: Acc) => {
      acc.count++
      if (!ev.correct) acc.errors++
      if (latency !== null) {
        acc.ms += latency
        acc.msCount++
      }
    }

    const c = normChar(expected)
    if (!charAcc.has(c)) charAcc.set(c, emptyAcc())
    add(charAcc.get(c)!)

    const code = expected === ' ' ? 'Space' : primaryKey(layout, expected)?.code
    if (code) {
      if (!keyAcc.has(code)) keyAcc.set(code, emptyAcc())
      add(keyAcc.get(code)!)
      const finger = KEY_BY_CODE[code]?.finger
      if (finger !== undefined) {
        if (!fingerAcc.has(finger)) fingerAcc.set(finger, emptyAcc())
        add(fingerAcc.get(finger)!)
      }
    }
    prevT = ev.t
  }

  // final text comparison
  let correctChars = 0
  let incorrectChars = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correctChars++
    else incorrectChars++
  }
  const isTimed = run.settings.mode === 'time'
  const missedChars = isTimed ? 0 : Math.max(0, target.length - typed.length)

  const cpm = correctChars / minutes
  const rawCpm = keystrokes / minutes

  // timeline
  const seconds = Math.max(1, Math.ceil(durationMs / 1000))
  const perSecRaw = new Array<number>(seconds).fill(0)
  const perSecErr = new Array<number>(seconds).fill(0)
  const perSecCorrect = new Array<number>(seconds).fill(0)
  for (const ev of events) {
    if (ev.kind !== 'char') continue
    const s = Math.min(seconds - 1, Math.floor(ev.t / 1000))
    perSecRaw[s]++
    if (ev.correct) perSecCorrect[s]++
    else perSecErr[s]++
  }
  const timeline: TimelinePoint[] = []
  let cumCorrect = 0
  for (let s = 0; s < seconds; s++) {
    cumCorrect += perSecCorrect[s]
    const secEnd = Math.min((s + 1) * 1000, durationMs)
    const lo = Math.max(0, s - 1)
    const window = perSecRaw.slice(lo, s + 1)
    const span = window.length
    const smoothRaw = (window.reduce((a, b) => a + b, 0) / span) * 60
    timeline.push({
      sec: s + 1,
      cpm: (cumCorrect / secEnd) * 60000,
      raw: smoothRaw,
      errors: perSecErr[s],
    })
  }

  // consistency — inverse of the coefficient of variation of per-second raw speed
  const active = perSecRaw.slice(0, Math.max(1, Math.floor(durationMs / 1000)))
  const mean = active.reduce((a, b) => a + b, 0) / active.length
  const sd = Math.sqrt(active.reduce((a, b) => a + (b - mean) ** 2, 0) / active.length)
  const consistency = mean > 0 ? Math.max(0, Math.min(100, 100 * (1 - sd / mean))) : 0

  const toStat = (acc: Acc) => ({
    count: acc.count,
    errors: acc.errors,
    avgMs: acc.msCount ? acc.ms / acc.msCount : 0,
  })

  const chars: CharStat[] = [...charAcc.entries()]
    .map(([char, acc]) => ({
      char,
      ...toStat(acc),
      accuracy: acc.count ? (acc.count - acc.errors) / acc.count : 1,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs)

  const keys: Record<string, KeyStat> = {}
  for (const [code, acc] of keyAcc) keys[code] = toStat(acc)

  const fingerTotal = [...fingerAcc.values()].reduce((a, b) => a + b.count, 0) || 1
  const fingers: FingerStat[] = ([0, 1, 2, 3, 4, 5, 6, 7, 8] as Finger[]).map((finger) => {
    const acc = fingerAcc.get(finger) ?? emptyAcc()
    return {
      finger,
      ...toStat(acc),
      accuracy: acc.count ? (acc.count - acc.errors) / acc.count : 1,
      share: acc.count / fingerTotal,
    }
  })

  const confusionList: Confusion[] = [...confusions.entries()]
    .map(([k, count]) => {
      const [expected, typedCh] = k.split('\u0000')
      return { expected, typed: typedCh, count }
    })
    .sort((a, b) => b.count - a.count)

  return {
    durationMs,
    cpm,
    rawCpm,
    wpm: toWpm(cpm),
    rawWpm: toWpm(rawCpm),
    accuracy: keystrokes ? (keystrokes - wrong) / keystrokes : 0,
    correctChars,
    incorrectChars,
    missedChars,
    keystrokes,
    wrongKeystrokes: wrong,
    backspaces,
    consistency,
    timeline,
    chars,
    keys,
    fingers,
    confusions: confusionList,
    words: wordStats(run, events),
    errorPositions: [...errorPositions],
  }
}

function wordStats(run: TestRun, events: KeyEvent[]): WordStat[] {
  const { target, typed } = run
  const out: WordStat[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(target))) {
    const start = m.index
    const end = start + m[0].length // exclusive
    if (end > typed.length) break
    let first: number | null = null
    let last: number | null = null
    let errors = 0
    // time from the keystroke before the word (usually the space) to the last char
    let before: number | null = null
    for (const ev of events) {
      if (ev.kind !== 'char') continue
      if (ev.index === start - 1 && ev.correct !== undefined) before = ev.t
      if (ev.index >= start && ev.index < end) {
        if (first === null) first = ev.t
        last = ev.t
        if (!ev.correct) errors++
      }
    }
    if (first === null || last === null) continue
    const startT = before ?? first
    const ms = Math.max(1, last - startT)
    out.push({
      word: m[0],
      start,
      ms,
      cpm: (m[0].length / ms) * 60000,
      errors,
    })
  }
  return out
}

/** Reconstructs the typed string after applying events up to time `t`. */
export function typedAt(run: TestRun, t: number, strict: boolean): { typed: string; lastEvent?: KeyEvent } {
  let typed = ''
  let lastEvent: KeyEvent | undefined
  for (const ev of run.events) {
    if (ev.t > t || t <= 0) break
    lastEvent = ev
    if (ev.kind === 'back') {
      typed = typed.slice(0, ev.index)
    } else if (!strict || ev.correct) {
      typed += ev.typed ?? ''
    }
  }
  return { typed, lastEvent }
}
