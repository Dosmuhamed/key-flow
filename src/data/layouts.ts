import { OS, type Os } from '../lib/platform'

export type Finger = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const FINGER_NAMES: Record<Finger, string> = {
  0: 'Левый мизинец',
  1: 'Левый безымянный',
  2: 'Левый средний',
  3: 'Левый указательный',
  4: 'Правый указательный',
  5: 'Правый средний',
  6: 'Правый безымянный',
  7: 'Правый мизинец',
  8: 'Большие пальцы',
}

export const FINGER_SHORT: Record<Finger, string> = {
  0: 'Мизинец',
  1: 'Безымянный',
  2: 'Средний',
  3: 'Указательный',
  4: 'Указательный',
  5: 'Средний',
  6: 'Безымянный',
  7: 'Мизинец',
  8: 'Большой',
}

export interface KeyDef {
  code: string
  finger: Finger
  /** width in key units */
  w?: number
  /** fixed label for modifier keys */
  label?: string
  /** small symbol printed in the top corner (⌘, ⌥, ⌃) */
  symbol?: string
  /** home-row bump */
  bump?: boolean
  /** half-height key (Mac arrow cluster) */
  half?: 'top' | 'bottom'
  /** the next key shares this key's column (stacked ↑ ↓) */
  stack?: boolean
}

const MOD_LABELS: Record<Os, Record<string, string>> = {
  win: { Backspace: 'Backspace', Tab: 'Tab', CapsLock: 'Caps Lock', Enter: 'Enter', ShiftLeft: 'Shift', ShiftRight: 'Shift' },
  mac: { Backspace: 'delete', Tab: 'tab', CapsLock: 'caps lock', Enter: 'return', ShiftLeft: 'shift', ShiftRight: 'shift' },
}

const BOTTOM_ROW: Record<Os, KeyDef[]> = {
  win: [
    { code: 'ControlLeft', finger: 0, w: 1.25, label: 'Ctrl' },
    { code: 'MetaLeft', finger: 8, w: 1.25, label: 'Win' },
    { code: 'AltLeft', finger: 8, w: 1.25, label: 'Alt' },
    { code: 'Space', finger: 8, w: 6.25, label: '' },
    { code: 'AltRight', finger: 8, w: 1.25, label: 'Alt' },
    { code: 'MetaRight', finger: 8, w: 1.25, label: 'Win' },
    { code: 'ContextMenu', finger: 8, w: 1.25, label: 'Menu' },
    { code: 'ControlRight', finger: 7, w: 1.25, label: 'Ctrl' },
  ],
  mac: [
    { code: 'Fn', finger: 0, w: 1, label: 'fn' },
    { code: 'ControlLeft', finger: 0, w: 1, label: 'control', symbol: '⌃' },
    { code: 'AltLeft', finger: 8, w: 1, label: 'option', symbol: '⌥' },
    { code: 'MetaLeft', finger: 8, w: 1.25, label: 'command', symbol: '⌘' },
    { code: 'Space', finger: 8, w: 5.5, label: '' },
    { code: 'MetaRight', finger: 8, w: 1.25, label: 'command', symbol: '⌘' },
    { code: 'AltRight', finger: 8, w: 1, label: 'option', symbol: '⌥' },
    { code: 'ArrowLeft', finger: 7, w: 1, label: '◀', half: 'bottom' },
    { code: 'ArrowUp', finger: 7, w: 1, label: '▲', half: 'top', stack: true },
    { code: 'ArrowDown', finger: 7, w: 1, label: '▼', half: 'bottom' },
    { code: 'ArrowRight', finger: 7, w: 1, label: '▶', half: 'bottom' },
  ],
}

/** Physical ANSI geometry: PC or Mac flavour. */
export function keyRows(os: Os): KeyDef[][] {
  const L = MOD_LABELS[os]
  return [
    [
      { code: 'Backquote', finger: 0 },
      { code: 'Digit1', finger: 0 },
      { code: 'Digit2', finger: 1 },
      { code: 'Digit3', finger: 2 },
      { code: 'Digit4', finger: 3 },
      { code: 'Digit5', finger: 3 },
      { code: 'Digit6', finger: 4 },
      { code: 'Digit7', finger: 4 },
      { code: 'Digit8', finger: 5 },
      { code: 'Digit9', finger: 6 },
      { code: 'Digit0', finger: 7 },
      { code: 'Minus', finger: 7 },
      { code: 'Equal', finger: 7 },
      { code: 'Backspace', finger: 7, w: 2, label: L.Backspace },
    ],
    [
      { code: 'Tab', finger: 0, w: 1.5, label: L.Tab },
      { code: 'KeyQ', finger: 0 },
      { code: 'KeyW', finger: 1 },
      { code: 'KeyE', finger: 2 },
      { code: 'KeyR', finger: 3 },
      { code: 'KeyT', finger: 3 },
      { code: 'KeyY', finger: 4 },
      { code: 'KeyU', finger: 4 },
      { code: 'KeyI', finger: 5 },
      { code: 'KeyO', finger: 6 },
      { code: 'KeyP', finger: 7 },
      { code: 'BracketLeft', finger: 7 },
      { code: 'BracketRight', finger: 7 },
      { code: 'Backslash', finger: 7, w: 1.5 },
    ],
    [
      { code: 'CapsLock', finger: 0, w: 1.75, label: L.CapsLock },
      { code: 'KeyA', finger: 0 },
      { code: 'KeyS', finger: 1 },
      { code: 'KeyD', finger: 2 },
      { code: 'KeyF', finger: 3, bump: true },
      { code: 'KeyG', finger: 3 },
      { code: 'KeyH', finger: 4 },
      { code: 'KeyJ', finger: 4, bump: true },
      { code: 'KeyK', finger: 5 },
      { code: 'KeyL', finger: 6 },
      { code: 'Semicolon', finger: 7 },
      { code: 'Quote', finger: 7 },
      { code: 'Enter', finger: 7, w: 2.25, label: L.Enter },
    ],
    [
      { code: 'ShiftLeft', finger: 0, w: 2.25, label: L.ShiftLeft },
      { code: 'KeyZ', finger: 0 },
      { code: 'KeyX', finger: 1 },
      { code: 'KeyC', finger: 2 },
      { code: 'KeyV', finger: 3 },
      { code: 'KeyB', finger: 3 },
      { code: 'KeyN', finger: 4 },
      { code: 'KeyM', finger: 4 },
      { code: 'Comma', finger: 5 },
      { code: 'Period', finger: 6 },
      { code: 'Slash', finger: 7 },
      { code: 'ShiftRight', finger: 7, w: 2.75, label: L.ShiftRight },
    ],
    BOTTOM_ROW[os],
  ]
}

export const KEY_ROWS = keyRows(OS)
export const ALL_KEYS: KeyDef[] = [...keyRows('win').flat(), ...BOTTOM_ROW.mac]
export const KEY_BY_CODE: Record<string, KeyDef> = Object.fromEntries(ALL_KEYS.map((k) => [k.code, k]))

export const HOME_ROW_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote']
export const TOP_ROW_CODES = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight']
export const BOTTOM_ROW_CODES = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash']
export const NUMBER_ROW_CODES = ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal']

/** code → [normal, shifted] */
export type CharMap = Record<string, [string, string]>

export interface Layout {
  id: string
  name: string
  chars: CharMap
  /** characters produced by a dead key + letter, e.g. á = ´ then a */
  compose?: Record<string, { dead: string; deadShift?: boolean; base: string }>
}

const pairs = (codes: string[], normal: string, shifted: string): CharMap => {
  const out: CharMap = {}
  const n = Array.from(normal)
  const s = Array.from(shifted)
  codes.forEach((c, i) => {
    out[c] = [n[i], s[i]]
  })
  return out
}

const LETTER_CODES_TOP = TOP_ROW_CODES
const LETTER_CODES_HOME = HOME_ROW_CODES
const LETTER_CODES_BOTTOM = BOTTOM_ROW_CODES

const QWERTY: Layout = {
  id: 'qwerty',
  name: 'QWERTY (US)',
  chars: {
    ...pairs(NUMBER_ROW_CODES, '`1234567890-=', '~!@#$%^&*()_+'),
    ...pairs([...LETTER_CODES_TOP, 'Backslash'], 'qwertyuiop[]\\', 'QWERTYUIOP{}|'),
    ...pairs(LETTER_CODES_HOME, "asdfghjkl;'", 'ASDFGHJKL:"'),
    ...pairs(LETTER_CODES_BOTTOM, 'zxcvbnm,./', 'ZXCVBNM<>?'),
    Space: [' ', ' '],
  },
}

const JCUKEN: Layout = {
  id: 'jcuken',
  name: 'ЙЦУКЕН',
  chars: {
    ...pairs(NUMBER_ROW_CODES, 'ё1234567890-=', 'Ё!"№;%:?*()_+'),
    ...pairs([...LETTER_CODES_TOP, 'Backslash'], 'йцукенгшщзхъ\\', 'ЙЦУКЕНГШЩЗХЪ/'),
    ...pairs(LETTER_CODES_HOME, 'фывапролджэ', 'ФЫВАПРОЛДЖЭ'),
    ...pairs(LETTER_CODES_BOTTOM, 'ячсмитьбю.', 'ЯЧСМИТЬБЮ,'),
    Space: [' ', ' '],
  },
}

const KAZAKH: Layout = {
  id: 'kazakh',
  name: 'Қазақ',
  chars: {
    ...JCUKEN.chars,
    ...pairs(NUMBER_ROW_CODES, '("әіңғ,.үұқөһ', ')!ӘІҢҒ;:ҮҰҚӨҺ'),
    Slash: ['№', '?'],
  },
}

const QWERTZ: Layout = {
  id: 'qwertz',
  name: 'QWERTZ (DE)',
  chars: {
    ...pairs(NUMBER_ROW_CODES, '^1234567890ß´', '°!"§$%&/()=?`'),
    ...pairs([...LETTER_CODES_TOP, 'Backslash'], "qwertzuiopü+#", "QWERTZUIOPÜ*'"),
    ...pairs(LETTER_CODES_HOME, 'asdfghjklöä', 'ASDFGHJKLÖÄ'),
    ...pairs(LETTER_CODES_BOTTOM, 'yxcvbnm,.-', 'YXCVBNM;:_'),
    Space: [' ', ' '],
  },
}

const SPANISH: Layout = {
  id: 'es',
  name: 'Español (ES)',
  chars: {
    ...pairs(NUMBER_ROW_CODES, "º1234567890'¡", 'ª!"·$%&/()=?¿'),
    ...pairs([...LETTER_CODES_TOP, 'Backslash'], 'qwertyuiop`+ç', 'QWERTYUIOP^*Ç'),
    ...pairs(LETTER_CODES_HOME, 'asdfghjklñ´', 'ASDFGHJKLÑ¨'),
    ...pairs(LETTER_CODES_BOTTOM, 'zxcvbnm,.-', 'ZXCVBNM;:_'),
    Space: [' ', ' '],
  },
  compose: {
    á: { dead: 'Quote', base: 'a' },
    é: { dead: 'Quote', base: 'e' },
    í: { dead: 'Quote', base: 'i' },
    ó: { dead: 'Quote', base: 'o' },
    ú: { dead: 'Quote', base: 'u' },
    Á: { dead: 'Quote', base: 'A' },
    É: { dead: 'Quote', base: 'E' },
    Í: { dead: 'Quote', base: 'I' },
    Ó: { dead: 'Quote', base: 'O' },
    Ú: { dead: 'Quote', base: 'U' },
    ü: { dead: 'Quote', deadShift: true, base: 'u' },
  },
}

export const LAYOUTS: Record<string, Layout> = {
  qwerty: QWERTY,
  jcuken: JCUKEN,
  kazakh: KAZAKH,
  qwertz: QWERTZ,
  es: SPANISH,
}

export interface KeyHit {
  code: string
  shift: boolean
}

/** Which physical keys must be pressed to produce `char` on `layout`. */
export function keysForChar(layout: Layout, char: string): KeyHit[] {
  for (const [code, [n, s]] of Object.entries(layout.chars)) {
    if (n === char) return [{ code, shift: false }]
    if (s === char) return [{ code, shift: true }]
  }
  const comp = layout.compose?.[char]
  if (comp) {
    return [{ code: comp.dead, shift: !!comp.deadShift }, ...keysForChar(layout, comp.base)]
  }
  return []
}

/** Returns the key the user's finger should travel to for `char` — the last key of the sequence. */
export function primaryKey(layout: Layout, char: string): KeyHit | undefined {
  const keys = keysForChar(layout, char)
  return keys[keys.length - 1]
}

export function shiftSideFor(code: string): 'ShiftLeft' | 'ShiftRight' {
  const key = KEY_BY_CODE[code]
  if (!key) return 'ShiftLeft'
  return key.finger <= 3 ? 'ShiftRight' : 'ShiftLeft'
}

export function fingerForChar(layout: Layout, char: string): Finger | undefined {
  if (char === ' ') return 8
  const k = primaryKey(layout, char)
  return k ? KEY_BY_CODE[k.code]?.finger : undefined
}

export function lettersOnRows(layout: Layout, codes: string[]): string[] {
  return codes
    .map((c) => layout.chars[c]?.[0])
    .filter((ch): ch is string => !!ch && /\p{L}/u.test(ch))
}
