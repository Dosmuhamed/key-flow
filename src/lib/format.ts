import i18n from '../i18n'
import type { Settings } from './types'

export const unitLabel = (unit: Settings['unit']) => i18n.t(unit === 'cpm' ? 'units.cpm' : 'units.wpm')

/** speed is always stored as characters per minute */
export function speedValue(cpm: number, unit: Settings['unit']) {
  return unit === 'cpm' ? cpm : cpm / 5
}

export function formatSpeed(cpm: number, unit: Settings['unit']) {
  return String(Math.round(speedValue(cpm, unit)))
}

/** decimal separator follows the interface language */
const decimal = (s: string) => (i18n.language === 'en' ? s : s.replace('.', ','))

export function formatDuration(ms: number) {
  const total = Math.round(ms / 100) / 10
  if (total < 60) return i18n.t('units.sec', { n: decimal(total.toFixed(1)) })
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  return i18n.t('units.minSec', { m, s })
}

export const pct = (v: number, digits = 0) => `${decimal((v * 100).toFixed(digits))}%`

export function displayChar(ch: string) {
  return ch === ' ' ? '␣' : ch
}
