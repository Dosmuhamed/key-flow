import { Trash2 } from 'lucide-react'
import { LANGUAGE_BY_ID } from '../data/languages'
import { formatDuration, formatSpeed, pct, unitLabel } from '../lib/format'
import type { HistoryEntry } from '../lib/storage'
import type { Settings } from '../lib/types'

interface Props {
  history: HistoryEntry[]
  unit: Settings['unit']
  onClear?: () => void
  highlightId?: string
  limit?: number
}

function Sparkline({ values, highlight }: { values: number[]; highlight?: number }) {
  const w = 320
  const h = 64
  if (values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const x = (i: number) => (i / (values.length - 1)) * (w - 8) + 4
  const y = (v: number) => h - 6 - ((v - min) / span) * (h - 12)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="var(--kf-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {highlight !== undefined && <circle cx={x(highlight)} cy={y(values[highlight])} r="4" fill="var(--kf-accent)" />}
    </svg>
  )
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function HistoryPanel({ history, unit, onClear, highlightId, limit = 12 }: Props) {
  if (history.length === 0) {
    return <p className="text-sm text-muted">Здесь появятся ваши результаты после первого теста.</p>
  }
  const recent = history.slice(0, 30).reverse()
  const best = history.reduce((a, b) => (b.cpm > a.cpm ? b : a))
  const avg = history.slice(0, 10).reduce((a, b) => a + b.cpm, 0) / Math.min(10, history.length)
  const avgAcc = history.slice(0, 10).reduce((a, b) => a + b.accuracy, 0) / Math.min(10, history.length)
  const hiIndex = highlightId ? recent.findIndex((h) => h.id === highlightId) : -1

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-sunken/70 p-3">
          <div className="font-mono text-xl font-medium">{formatSpeed(best.cpm, unit)}</div>
          <div className="text-xs text-muted">рекорд, {unitLabel(unit)}</div>
        </div>
        <div className="rounded-xl bg-sunken/70 p-3">
          <div className="font-mono text-xl font-medium">{formatSpeed(avg, unit)}</div>
          <div className="text-xs text-muted">в среднем за 10</div>
        </div>
        <div className="rounded-xl bg-sunken/70 p-3">
          <div className="font-mono text-xl font-medium">{pct(avgAcc)}</div>
          <div className="text-xs text-muted">точность за 10</div>
        </div>
      </div>
      <div className="mt-3">
        <Sparkline values={recent.map((h) => h.cpm)} highlight={hiIndex >= 0 ? hiIndex : undefined} />
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-2 font-medium">Когда</th>
              <th className="py-2 font-medium">Режим</th>
              <th className="py-2 text-right font-medium">Скорость</th>
              <th className="py-2 text-right font-medium">Точность</th>
              <th className="py-2 text-right font-medium">Время</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, limit).map((h) => (
              <tr key={h.id} className={`border-t border-line ${h.id === highlightId ? 'text-accent' : ''}`}>
                <td className="py-2 whitespace-nowrap text-muted">{dateFmt.format(h.date)}</td>
                <td className="py-2">
                  <span className="mr-1.5 rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-muted">
                    {LANGUAGE_BY_ID[h.language]?.short}
                  </span>
                  {h.modeLabel}
                </td>
                <td className="py-2 text-right font-mono">{formatSpeed(h.cpm, unit)}</td>
                <td className="py-2 text-right font-mono">{pct(h.accuracy)}</td>
                <td className="py-2 text-right font-mono text-muted">{formatDuration(h.durationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-bad-soft hover:text-bad"
        >
          <Trash2 className="size-4" />
          Очистить историю
        </button>
      )}
    </div>
  )
}
