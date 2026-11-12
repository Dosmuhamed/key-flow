import { History, Keyboard as KeyboardIcon, Moon, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { HistoryPanel } from './components/HistoryPanel'
import { ResultsView } from './components/results/ResultsView'
import { SettingsBar } from './components/SettingsBar'
import { TypingScreen } from './components/TypingScreen'
import { IconButton, Segmented } from './components/ui'
import { LANGUAGE_BY_ID } from './data/languages'
import { useTypingTest } from './hooks/useTypingTest'
import { analyze } from './lib/stats'
import { clearHistory, loadHistory, loadSettings, pushHistory, recordLetters, saveSettings, weakLetters, type HistoryEntry } from './lib/storage'
import type { Settings, TestRun } from './lib/types'

const LESSON_NAMES: Record<Settings['lesson'], string> = {
  home: 'основной ряд',
  top: 'верхний ряд',
  bottom: 'нижний ряд',
  all: 'все буквы',
  weak: 'мои ошибки',
}

function modeLabel(s: Settings) {
  switch (s.mode) {
    case 'time':
      return `Время, ${s.time < 60 ? `${s.time} с` : `${s.time / 60} мин`}`
    case 'words':
      return `${s.words} слов`
    case 'text':
      return 'Текст'
    case 'lesson':
      return `Урок: ${LESSON_NAMES[s.lesson]}`
  }
}

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

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [run, setRun] = useState<TestRun | null>(null)
  const [isRecord, setIsRecord] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.dataset.theme = settings.theme
  }, [settings])

  // history changes whenever new letter stats are recorded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hasWeak = useMemo(() => weakLetters(settings.language).length > 0, [settings.language, history])

  const update = useCallback((patch: Partial<Settings>) => {
    setRun(null)
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const onFinish = useCallback((r: TestRun) => {
    const a = analyze(r)
    const label = modeLabel(r.settings)
    const prev = loadHistory().filter((h) => h.language === r.settings.language && h.modeLabel === label)
    const prevBest = prev.reduce((m, h) => Math.max(m, h.cpm), 0)
    setIsRecord(prev.length > 0 && a.cpm > prevBest && a.keystrokes >= 10)
    if (a.keystrokes >= 5) {
      recordLetters(r.settings.language, a)
      setHistory(
        pushHistory({
          id: r.id,
          date: r.date,
          language: r.settings.language,
          mode: r.settings.mode,
          modeLabel: label,
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

  useEffect(() => {
    if (!historyOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        setHistoryOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [historyOpen])

  const lang = LANGUAGE_BY_ID[settings.language]

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between gap-3 py-5">
        <button type="button" onClick={next} className="rounded-xl" aria-label="KeyFlow — новый тест">
          <Logo />
        </button>
        <div className="flex items-center gap-1">
          <div className="mr-1 hidden sm:block">
            <Segmented
              label="Единицы скорости"
              value={settings.unit}
              onChange={(u) => setSettings((s) => ({ ...s, unit: u }))}
              options={[
                { value: 'cpm', label: 'зн/мин', title: 'Знаков в минуту' },
                { value: 'wpm', label: 'сл/мин', title: 'Слов в минуту (слово = 5 знаков)' },
              ]}
            />
          </div>
          <IconButton
            title={settings.showKeyboard ? 'Скрыть клавиатуру' : 'Показать клавиатуру'}
            onClick={() => setSettings((s) => ({ ...s, showKeyboard: !s.showKeyboard }))}
            className={settings.showKeyboard ? 'text-accent' : ''}
          >
            <KeyboardIcon className="size-5" />
          </IconButton>
          <IconButton title="История результатов" onClick={() => setHistoryOpen(true)}>
            <History className="size-5" />
          </IconButton>
          <IconButton
            title={settings.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            onClick={() => setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
          >
            {settings.theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </IconButton>
        </div>
      </header>

      <main className="flex-1 pb-12">
        {run && analysis ? (
          <ResultsView
            run={run}
            analysis={analysis}
            modeLabel={`${lang.name}, ${modeLabel(run.settings).toLowerCase()}`}
            isRecord={isRecord}
            history={history}
            paused={historyOpen}
            onNext={next}
            onRetry={retry}
            onDrill={
              hasWeak
                ? () => update({ mode: 'lesson', lesson: 'weak' })
                : undefined
            }
            onClearHistory={() => {
              clearHistory()
              setHistory([])
            }}
          />
        ) : (
          <div className="flex flex-col gap-8 pt-2 sm:pt-6">
            <SettingsBar settings={settings} update={update} hasWeakLetters={hasWeak} />
            <TypingScreen settings={settings} test={test} paused={historyOpen} />
          </div>
        )}
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-5 text-xs text-muted">
        <span>KeyFlow — тренажёр слепой печати</span>
        <span>Результаты хранятся только в этом браузере</span>
      </footer>

      {historyOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setHistoryOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="История результатов"
            className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">История результатов</h2>
              <IconButton title="Закрыть" onClick={() => setHistoryOpen(false)}>
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
    </div>
  )
}
