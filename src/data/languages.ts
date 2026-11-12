import { de } from './langs/de'
import { en } from './langs/en'
import { es } from './langs/es'
import { kk } from './langs/kk'
import { ru } from './langs/ru'
import { deHard } from './hard/de'
import { enHard } from './hard/en'
import { esHard } from './hard/es'
import { kkHard } from './hard/kk'
import { ruHard } from './hard/ru'

export type LanguageId = 'ru' | 'en' | 'kk' | 'de' | 'es'

export interface LanguagePack {
  id: LanguageId
  name: string
  short: string
  layoutId: string
  script: 'cyrillic' | 'latin'
  words: string[]
  texts: { title: string; body: string }[]
}

export const LANGUAGES: LanguagePack[] = [ru, en, kk, de, es]

/** Long and rare words for the hard and expert difficulties. */
export const HARD_WORDS: Record<LanguageId, string[]> = { ru: ruHard, en: enHard, kk: kkHard, de: deHard, es: esHard }

export const LANGUAGE_BY_ID = Object.fromEntries(LANGUAGES.map((l) => [l.id, l])) as Record<LanguageId, LanguagePack>
