import type { ru } from './locales/ru'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : string }

/**
 * Russian is the source of truth. Other locales may omit plural forms
 * that their language does not have (e.g. `_few`, `_many`).
 */
export type Locale = DeepPartial<typeof ru>
