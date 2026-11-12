import type { Settings } from './types'

export const unitLabel = (unit: Settings['unit']) => (unit === 'cpm' ? 'зн/мин' : 'сл/мин')

/** speed is always stored as characters per minute */
export function speedValue(cpm: number, unit: Settings['unit']) {
  return unit === 'cpm' ? cpm : cpm / 5
}

export function formatSpeed(cpm: number, unit: Settings['unit']) {
  return String(Math.round(speedValue(cpm, unit)))
}

export function formatDuration(ms: number) {
  const total = Math.round(ms / 100) / 10
  if (total < 60) return `${total.toFixed(1).replace('.', ',')} с`
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  return `${m} мин ${s} с`
}

export const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits).replace('.', ',')}%`

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function displayChar(ch: string) {
  return ch === ' ' ? '␣' : ch
}
