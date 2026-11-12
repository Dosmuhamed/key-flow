import { ChevronDown, Globe, History, Palette, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppearancePanel } from './components/AppearancePanel'
import { HistoryPanel } from './components/HistoryPanel'
import { ResultsView } from './components/results/ResultsView'
import { SettingsBar } from './components/SettingsBar'
import { TypingScreen } from './components/TypingScreen'
import { IconButton, Segmented } from './components/ui'
import { LANGUAGE_BY_ID } from './data/languages'
import { AppearanceContext } from './hooks/useAppearance'
import { useTypingTest } from './hooks/useTypingTest'
import { UI_LANGUAGES, type UiLanguage } from './i18n'
import { applyAppearance, loadAppearance, resolveDark, saveAppearance, type Appearance } from './lib/appearance'
import { modeKey, modeLabel } from './lib/modeLabel'
import { analyze } from './lib/stats'
import { clearHistory, loadHistory, loadSettings, pushHistory, recordLetters, saveSettings, weakLetters, type HistoryEntry } from './lib/storage'
import type { Settings, TestRun } from './lib/types'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="keycap grid size-9 place-items-center rounded-[10px] bg-accent">
        <svg viewBox="0 0 24 24" className="size-5 text-accent-ink" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 5v12M8 11.5 15 5M10.5 10l5.5 7" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight">
        Key<span className="font-medium text-muted">Flow</span>
      </span>
    </div>
  )
}

function useSystemDark() {
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [appearance, setAppearance] = useState<Appearance>(loadAppearance)
  const [run, setRun] = useState<TestRun | null>(null)
  const [isRecord, setIsRecord] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const systemDark = useSystemDark()
  const dark = appearance.mode === 'system' ? systemDark : resolveDark(appearance)
  const overlayOpen = historyOpen || appearanceOpen

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveAppearance(appearance)
    applyAppearance(appearance)
  }, [appearance, systemDark])

  // history changes whenever new letter stats are recorded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hasWeak = useMemo(() => weakLetters(settings.language).length > 0, [settings.language, history])

  const update = useCallback((patch: Partial<Settings>) => {
    setRun(null)
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const updateAppearance = useCallback((patch: Partial<Appearance>) => setAppearance((a) => ({ ...a, ...patch })), [])

  const onFinish = useCallback((r: TestRun) => {
    const a = analyze(r)
    const key = modeKey(r.settings)
    const prev = loadHistory().filter((h) => h.language === r.settings.language && h.modeKey === key)
    const prevBest = prev.reduce((m, h) => Math.max(m, h.cpm), 0)
    setIsRecord(prev.length > 0 && a.cpm > prevBest && a.keystrokes >= 10)
    if (a.keystrokes >= 5) {
      recordLetters(r.settings.language, a)
      const { mode, time, words, lesson, difficulty } = r.settings
      setHistory(
        pushHistory({
          id: r.id,
          date: r.date,
          language: r.settings.language,
          mode,
          modeKey: key,
          params: { mode, time, words, lesson, difficulty },
          cpm: a.cpm,
          wpm: a.wpm,
          accuracy: a.accuracy,
          durationMs: a.durationMs,
          consistency: a.consistency,
        }),
      )
    }
    setRun(r)
  }, [])

  const test = useTypingTest(settings, onFinish)
  const analysis = useMemo(() => (run ? analyze(run) : null), [run])

  const next = useCallback(() => {
    test.reset(false)
    setRun(null)
  }, [test])
  const retry = useCallback(() => {
    test.reset(true)
    setRun(null)
  }, [test])

  // Escape closes whichever overlay is open, before the typing screen sees it
  useEffect(() => {
    if (!overlayOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setHistoryOpen(false)
        setAppearanceOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [overlayOpen])

  const lang = LANGUAGE_BY_ID[settings.language]

  return (
    <AppearanceContext.Provider value={appearance}>
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-5">
          <button type="button" onClick={next} className="rounded-xl" aria-label={t('app.newTest')}>
            <Logo />
          </button>
          <div className="flex items-center gap-1">
            <div className="mr-1">
              <Segmented
                label={t('header.unitGroup')}
                value={settings.unit}
                onChange={(u) => setSettings((s) => ({ ...s, unit: u }))}
                options={[
                  { value: 'cpm', label: t('units.cpm'), title: t('units.cpmTitle') },
                  { value: 'wpm', label: t('units.wpm'), title: t('units.wpmTitle') },
                ]}
              />
            </div>
            <label className="relative flex h-10 items-center gap-1.5 rounded-xl pr-7 pl-2.5 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink">
              <Globe className="size-4" />
              <span className="sr-only">{t('header.uiLanguage')}</span>
              <select
                value={i18n.language}
                onChange={(e) => void i18n.changeLanguage(e.target.value as UiLanguage)}
                className="cursor-pointer appearance-none bg-transparent outline-none"
                title={t('header.uiLanguage')}
              >
                {UI_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 size-3.5" />
            </label>
            <IconButton title={t('header.history')} onClick={() => setHistoryOpen(true)}>
              <History className="size-5" />
            </IconButton>
            <IconButton title={t('header.appearance')} onClick={() => setAppearanceOpen(true)} className={appearanceOpen ? 'bg-sunken text-ink' : ''}>
              <Palette className="size-5" />
            </IconButton>
          </div>
        </header>

        <main className="flex-1 pb-12">
          {run && analysis ? (
            <ResultsView
              run={run}
              analysis={analysis}
              modeLabel={`${lang.name}, ${modeLabel(run.settings).toLocaleLowerCase()}`}
              isRecord={isRecord}
              history={history}
              paused={overlayOpen}
              onNext={next}
              onRetry={retry}
              onDrill={hasWeak ? () => update({ mode: 'lesson', lesson: 'weak' }) : undefined}
              onClearHistory={() => {
                clearHistory()
                setHistory([])
              }}
            />
          ) : (
            <div className="flex flex-col gap-8 pt-2 sm:pt-4">
              <SettingsBar settings={settings} update={update} hasWeakLetters={hasWeak} />
              <TypingScreen settings={settings} test={test} paused={overlayOpen} />
            </div>
          )}
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-xs text-muted">
          <span>{t('app.tagline')}</span>
          <span>{t('app.storedLocally')}</span>
        </footer>

        {historyOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t('history.fullTitle')}
              className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('history.fullTitle')}</h2>
                <IconButton title={t('app.close')} onClick={() => setHistoryOpen(false)}>
                  <X className="size-5" />
                </IconButton>
              </div>
              <HistoryPanel
                history={history}
                unit={settings.unit}
                limit={30}
                onClear={() => {
                  clearHistory()
                  setHistory([])
                }}
              />
            </div>
          </div>
        )}

        {appearanceOpen && (
          <AppearancePanel
            appearance={appearance}
            dark={dark}
            onChange={updateAppearance}
            showKeyboard={settings.showKeyboard}
            onShowKeyboard={(v) => setSettings((s) => ({ ...s, showKeyboard: v }))}
            language={settings.language}
            onClose={() => setAppearanceOpen(false)}
          />
        )}
      </div>
    </AppearanceContext.Provider>
  )
}
