import { ArrowRightLeft, Dumbbell, Lightbulb, RotateCcw, SkipForward, Trophy } from 'lucide-react'
import type { TFunction } from 'i18next'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { displayChar, formatDuration, formatSpeed, pct, unitLabel } from '../../lib/format'
import type { HistoryEntry } from '../../lib/storage'
import type { Analysis } from '../../lib/stats'
import type { TestRun } from '../../lib/types'
import { HistoryPanel } from '../HistoryPanel'
import { Kbd, Panel } from '../ui'
import { ConfusionPanel, FingerPanel, KeyHeatmap, LetterGrid, WordsPanel } from './Breakdown'
import { Replay } from './Replay'
import { SpeedChart } from './SpeedChart'

interface Props {
  run: TestRun
  analysis: Analysis
  modeLabel: string
  isRecord: boolean
  history: HistoryEntry[]
  onNext: () => void
  onRetry: () => void
  onDrill?: () => void
  onClearHistory: () => void
  paused?: boolean
}

function tips(a: Analysis, t: TFunction): string[] {
  const out: string[] = []
  if (a.keystrokes < 10) return [t('tips.tooShort')]
  if (a.accuracy < 0.92) out.push(t('tips.lowAccuracy'))
  else if (a.accuracy >= 0.98) out.push(t('tips.highAccuracy'))
  const fingerName = (f: number) => t(`fingers.${f}`).toLocaleLowerCase()
  const fingers = a.fingers.filter((f) => f.count >= 5 && f.finger !== 8)
  const worstFinger = [...fingers].sort((x, y) => x.accuracy - y.accuracy)[0]
  if (worstFinger && worstFinger.accuracy < 0.95) {
    out.push(t('tips.worstFinger', { finger: fingerName(worstFinger.finger), rate: pct(1 - worstFinger.accuracy) }))
  }
  const slowFinger = [...fingers].sort((x, y) => y.avgMs - x.avgMs)[0]
  if (slowFinger && fingers.length > 2) {
    out.push(t('tips.slowFinger', { finger: fingerName(slowFinger.finger), ms: Math.round(slowFinger.avgMs) }))
  }
  if (a.consistency < 55) out.push(t('tips.uneven'))
  const worst = a.chars.filter((c) => c.char !== ' ' && c.errors > 0).slice(0, 3)
  if (worst.length) {
    out.push(t('tips.hardLetters', { letters: worst.map((c) => `«${displayChar(c.char)}»`).join(', ') }))
  }
  return out.slice(0, 4)
}

export function ResultsView({ run, analysis: a, modeLabel, isRecord, history, onNext, onRetry, onDrill, onClearHistory, paused }: Props) {
  const { t } = useTranslation()
  const unit = run.settings.unit
  const otherUnit = unit === 'cpm' ? 'wpm' : 'cpm'

  useEffect(() => {
    if (paused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        onNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onRetry()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext, onRetry, paused])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [run.id])

  const advice = tips(a, t)

  return (
    <div className="flex flex-col gap-4">
      {/* summary */}
      <section className="grid gap-4 rounded-3xl bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{modeLabel}</span>
            {isRecord && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
                <Trophy className="size-3.5" />
                {t('results.newRecord')}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-7xl leading-none font-semibold tracking-tight text-accent tabular-nums sm:text-8xl">
              {formatSpeed(a.cpm, unit)}
            </span>
            <span className="text-lg font-medium text-muted">{unitLabel(unit)}</span>
          </div>
          <div className="mt-2 text-sm text-muted">
            {t('results.secondary', { other: formatSpeed(a.cpm, otherUnit), otherUnit: unitLabel(otherUnit), raw: formatSpeed(a.rawCpm, unit) })}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onNext}
              className="flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-transform active:scale-[0.98]"
            >
              <SkipForward className="size-4" />
              {t('results.next')}
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="flex h-11 items-center gap-2 rounded-xl bg-sunken px-4 text-sm font-medium text-ink hover:bg-line"
            >
              <RotateCcw className="size-4" />
              {t('results.retry')}
            </button>
            {onDrill && (
              <button
                type="button"
                onClick={onDrill}
                className="flex h-11 items-center gap-2 rounded-xl bg-sunken px-4 text-sm font-medium text-ink hover:bg-line"
              >
                <Dumbbell className="size-4" />
                {t('results.drill')}
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Kbd>Tab</Kbd> {t('results.nextKey')}
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd> {t('results.retryKey')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
           <Metric label={t('results.accuracy')} value={pct(a.accuracy, 1)} tone={a.accuracy >= 0.95 ? 'good' : a.accuracy < 0.9 ? 'bad' : undefined} />
          <Metric label={t('results.time')} value={formatDuration(a.durationMs)} />
          <Metric label={t('results.consistency')} value={pct(a.consistency / 100)} hint={t('results.consistencyHint')} />
          <Metric label={t('results.correctChars')} value={String(a.correctChars)} tone="good" />
          <Metric label={t('results.wrongKeys')} value={String(a.wrongKeystrokes)} tone={a.wrongKeystrokes ? 'bad' : undefined} />
          <Metric
            label={run.settings.strict ? t('results.totalKeys') : t('results.corrections')}
            value={String(run.settings.strict ? a.keystrokes : a.backspaces)}
            hint={run.settings.strict ? undefined : t('results.correctionsHint')}
          />
          {a.incorrectChars > 0 && <Metric label={t('results.leftWrong')} value={String(a.incorrectChars)} tone="bad" />}
          {a.missedChars > 0 && <Metric label={t('results.missed')} value={String(a.missedChars)} />}
        </div>
      </section>

      {advice.length > 0 && (
        <section className="flex gap-4 rounded-2xl bg-accent-soft/70 p-5 text-sm text-ink">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" />
          <ul className="flex flex-col gap-1.5">
            {advice.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <Panel title={t('results.speedBySecond')}>
        <SpeedChart timeline={a.timeline} unit={unit} />
      </Panel>

      <Panel
        title={t('results.replay')}
        aside={
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <ArrowRightLeft className="size-3.5" />
            {t('results.replayHint')}
          </span>
        }
      >
        <Replay run={run} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <KeyHeatmap run={run} analysis={a} />
        <FingerPanel analysis={a} />
      </div>

      <LetterGrid analysis={a} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ConfusionPanel analysis={a} />
        <WordsPanel analysis={a} unit={unit} />
      </div>

      <Panel title={t('history.title')}>
        <HistoryPanel history={history} unit={unit} highlightId={run.id} onClear={onClearHistory} limit={8} />
      </Panel>
    </div>
  )
}

function Metric({ label, value, tone, hint }: { label: string; value: string; tone?: 'good' | 'bad'; hint?: string }) {
  return (
    <div className="rounded-2xl bg-sunken/70 p-4" title={hint}>
      <div className={`font-mono text-2xl font-medium tabular-nums ${tone === 'good' ? 'text-good' : tone === 'bad' ? 'text-bad' : 'text-ink'}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  )
}
