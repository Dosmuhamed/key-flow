import { ArrowRightLeft, Dumbbell, Lightbulb, RotateCcw, SkipForward, Trophy } from 'lucide-react'
import { useEffect } from 'react'
import { FINGER_NAMES } from '../../data/layouts'
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

function tips(a: Analysis): string[] {
  const out: string[] = []
  if (a.keystrokes < 10) return ['Слишком мало нажатий для советов — попробуйте пройти тест подольше.']
  if (a.accuracy < 0.92) {
    out.push('Точность ниже 92%. Сбавьте темп: исправление ошибок съедает больше времени, чем аккуратный набор.')
  } else if (a.accuracy >= 0.98) {
    out.push('Отличная точность. Можно понемногу прибавлять скорость.')
  }
  const fingers = a.fingers.filter((f) => f.count >= 5 && f.finger !== 8)
  const worstFinger = [...fingers].sort((x, y) => x.accuracy - y.accuracy)[0]
  if (worstFinger && worstFinger.accuracy < 0.95) {
    out.push(`Больше всего промахов у пальца «${FINGER_NAMES[worstFinger.finger].toLowerCase()}» — ${pct(1 - worstFinger.accuracy)} ошибок.`)
  }
  const slowFinger = [...fingers].sort((x, y) => y.avgMs - x.avgMs)[0]
  if (slowFinger && fingers.length > 2) {
    out.push(`Медленнее всего работает ${FINGER_NAMES[slowFinger.finger].toLowerCase()}: в среднем ${Math.round(slowFinger.avgMs)} мс на нажатие.`)
  }
  if (a.consistency < 55) {
    out.push('Темп скачет. Старайтесь печатать ровно, без рывков и пауз — ритм важнее разовых ускорений.')
  }
  const worst = a.chars.filter((c) => c.char !== ' ' && c.errors > 0).slice(0, 3)
  if (worst.length) {
    out.push(`Трудные буквы: ${worst.map((c) => `«${displayChar(c.char)}»`).join(', ')}. Урок «Мои ошибки» соберёт слова именно с ними.`)
  }
  return out.slice(0, 4)
}

export function ResultsView({ run, analysis: a, modeLabel, isRecord, history, onNext, onRetry, onDrill, onClearHistory, paused }: Props) {
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

  const advice = tips(a)

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
                Новый рекорд
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
            {formatSpeed(a.cpm, otherUnit)} {unitLabel(otherUnit)}, без учёта ошибок {formatSpeed(a.rawCpm, unit)}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onNext}
              className="flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-transform active:scale-[0.98]"
            >
              <SkipForward className="size-4" />
              Следующий тест
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="flex h-11 items-center gap-2 rounded-xl bg-sunken px-4 text-sm font-medium text-ink hover:bg-line"
            >
              <RotateCcw className="size-4" />
              Повторить текст
            </button>
            {onDrill && (
              <button
                type="button"
                onClick={onDrill}
                className="flex h-11 items-center gap-2 rounded-xl bg-sunken px-4 text-sm font-medium text-ink hover:bg-line"
              >
                <Dumbbell className="size-4" />
                Потренировать ошибки
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Kbd>Tab</Kbd> следующий
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd> повторить
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Точность" value={pct(a.accuracy, 1)} tone={a.accuracy >= 0.95 ? 'good' : a.accuracy < 0.9 ? 'bad' : undefined} />
          <Metric label="Время" value={formatDuration(a.durationMs)} />
          <Metric label="Ритмичность" value={pct(a.consistency / 100)} hint="Насколько ровным был темп от секунды к секунде" />
          <Metric label="Верных символов" value={String(a.correctChars)} tone="good" />
          <Metric label="Ошибочных нажатий" value={String(a.wrongKeystrokes)} tone={a.wrongKeystrokes ? 'bad' : undefined} />
          <Metric
            label={run.settings.strict ? 'Всего нажатий' : 'Исправлений'}
            value={String(run.settings.strict ? a.keystrokes : a.backspaces)}
            hint={run.settings.strict ? undefined : 'Сколько раз нажат Backspace'}
          />
          {a.incorrectChars > 0 && <Metric label="Осталось с ошибкой" value={String(a.incorrectChars)} tone="bad" />}
          {a.missedChars > 0 && <Metric label="Пропущено" value={String(a.missedChars)} />}
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

      <Panel title="Скорость по секундам">
        <SpeedChart timeline={a.timeline} unit={unit} />
      </Panel>

      <Panel
        title="Повтор прохождения"
        aside={
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <ArrowRightLeft className="size-3.5" />
            перетащите ползунок, чтобы перемотать
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

      <Panel title="История">
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
