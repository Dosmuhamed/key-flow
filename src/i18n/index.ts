import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { kk } from './locales/kk'
import { ru } from './locales/ru'

export const UI_LANGUAGES = [
  { id: 'ru', name: 'Русский', short: 'RU', locale: 'ru-RU' },
  { id: 'en', name: 'English', short: 'EN', locale: 'en-GB' },
  { id: 'kk', name: 'Қазақша', short: 'KK', locale: 'kk-KZ' },
] as const

export type UiLanguage = (typeof UI_LANGUAGES)[number]['id']

const STORAGE_KEY = 'keyflow:ui-lang'
const isUi = (v: unknown): v is UiLanguage => UI_LANGUAGES.some((l) => l.id === v)

function initialLanguage(): UiLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isUi(saved)) return saved
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  for (const tag of nav) {
    const base = tag.toLowerCase().split('-')[0]
    if (isUi(base)) return base
  }
  return 'ru'
}

void i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en }, kk: { translation: kk } },
  lng: initialLanguage(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
  returnNull: false,
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
})
document.documentElement.lang = i18n.language

export function intlLocale(): string {
  return UI_LANGUAGES.find((l) => l.id === i18n.language)?.locale ?? 'ru-RU'
}

export default i18n
