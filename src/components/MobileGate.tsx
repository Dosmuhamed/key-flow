import { useTranslation } from 'react-i18next'
import { Laptop } from 'lucide-react'
import { useSyncExternalStore, type ReactNode } from 'react'

/** Phones, small tablets and touch-only devices: no physical keyboard to train on. */
const QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

export function MobileGate({ children }: { children: ReactNode }) {
  const blocked = useSyncExternalStore(subscribe, getSnapshot, () => false)
  const { t } = useTranslation()
  if (!blocked) return children

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <span className="keycap mb-8 grid size-14 place-items-center rounded-2xl bg-accent text-accent-ink">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 5v12M8 11.5 15 5M10.5 10l5.5 7" />
        </svg>
      </span>
      <h1 className="max-w-xs text-2xl font-bold tracking-tight text-ink">{t('mobile.title')}</h1>
      <p className="mt-3 max-w-xs text-base leading-relaxed text-muted">
        {t('mobile.body')}
      </p>
      <div className="mt-8 flex items-center gap-2 rounded-xl bg-sunken px-4 py-3 text-sm text-muted">
        <Laptop className="size-4 shrink-0" />
        {t('mobile.need')}
      </div>
    </div>
  )
}
