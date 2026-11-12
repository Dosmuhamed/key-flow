import i18n from '../i18n'
import type { Settings } from './types'

export type ModeParams = Pick<Settings, 'mode' | 'time' | 'words' | 'lesson' | 'difficulty'>

/** Stable id used to compare results (records) regardless of the interface language. */
export function modeKey(s: ModeParams): string {
  switch (s.mode) {
    case 'time':
      return `time:${s.time}:${s.difficulty}`
    case 'words':
      return `words:${s.words}:${s.difficulty}`
    case 'lesson':
      return `lesson:${s.lesson}`
    default:
      return 'text'
  }
}

export function modeLabel(s: ModeParams): string {
  const t = i18n.t.bind(i18n)
  const diff = (base: string) => (s.difficulty && s.difficulty !== 'normal' ? `${base}, ${t(`difficulty.${s.difficulty}`).toLocaleLowerCase()}` : base)
  switch (s.mode) {
    case 'time':
      return diff(t('modeLabel.time', { duration: s.time < 60 ? t('units.sec', { n: s.time }) : t('units.min', { n: s.time / 60 }) }))
    case 'words':
      return diff(t('modeLabel.words', { count: s.words }))
    case 'lesson':
      return t('modeLabel.lesson', { name: t(`lessons.${s.lesson}`).toLocaleLowerCase() })
    default:
      return t('modeLabel.text')
  }
}
