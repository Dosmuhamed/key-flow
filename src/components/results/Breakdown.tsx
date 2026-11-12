import { useState } from 'react'
import { LANGUAGE_BY_ID } from '../../data/languages'
import { FINGER_NAMES, LAYOUTS, type Finger } from '../../data/layouts'
import { displayChar, formatSpeed, pct, unitLabel } from '../../lib/format'
import type { Analysis } from '../../lib/stats'
import type { TestRun } from '../../lib/types'
import { Keyboard, type HeatCell } from '../Keyboard'
import { Panel, Segmented } from '../ui'

export function KeyHeatmap({ run, analysis }: { run: TestRun; analysis: Analysis }) {
  const [metric, setMetric] = useState<'errors' | 'speed'>('errors')
  const layout = LAYOUTS[LANGUAGE_BY_ID[run.settings.language].layoutId]
  const entries = Object.entries(analysis.keys)

  const heat: Record<string, HeatCell> = {}
  if (metric === 'errors') {
    for (const [code, s] of entries) {
      const rate = s.count ? s.errors / s.count : 0
      heat[code] = { value: Math.min(1, rate * 3), label: s.errors ? `${s.errors}` : undefined }
    }
  } else {
    const times = entries.map(([, s]) => s.avgMs).filter((v) => v > 0)
    const lo = Math.min(...times)
    const hi = Math.max(...times)
    for (const [code, s] of entries) {
      if (!s.avgMs) continue
      heat[code] = { value: hi > lo ? (s.avgMs - lo) / (hi - lo) : 0, label: `${Math.round(s.avgMs)}` }
    }
  }

  return (
    <Panel
      title="Карта клавиатуры"
      aside={
        <Segmented
          label="Показатель"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'errors', label: 'Ошибки' },
            { value: 'speed', label: 'Время нажатия' },
          ]}
        />
      }
    >
      <div className="overflow-x-auto pb-1">
        <Keyboard layout={layout} heat={heat} className="mx-auto max-w-[640px] min-w-[520px]" />
      </div>
      <p className="mt-3 text-sm text-muted">
        {metric === 'errors'
          ? 'Чем краснее клавиша, тем чаще на ней ошибались. Цифра в углу — количество ошибок.'
          : 'Чем краснее клавиша, тем дольше вы до неё тянулись. Цифра — среднее время в миллисекундах.'}
      </p>
    </Panel>
  )
}

export function LetterGrid({ analysis }: { analysis: Analysis }) {
  const [sort, setSort] = useState<'accuracy' | 'speed' | 'alpha'>('accuracy')
  const chars = [...analysis.chars]
  if (sort === 'speed') chars.sort((a, b) => b.avgMs - a.avgMs)
  if (sort === 'alpha') chars.sort((a, b) => a.char.localeCompare(b.char))
  const maxMs = Math.max(1, ...chars.map((c) => c.avgMs))

  return (
    <Panel
      title="Точность по буквам"
      aside={
        <Segmented
          label="Сортировка"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'accuracy', label: 'Сначала ошибки' },
            { value: 'speed', label: 'Сначала медленные' },
            { value: 'alpha', label: 'По алфавиту' },
          ]}
        />
      }
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
        {chars.map((c) => {
          const bad = c.errors > 0
          return (
            <div
              key={c.char}
              className={`rounded-xl p-2.5 ${bad ? 'bg-bad-soft' : 'bg-sunken/70'}`}
              title={`${displayChar(c.char)}: ${c.count} раз, ошибок ${c.errors}, в среднем ${Math.round(c.avgMs)} мс`}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-mono text-2xl font-medium ${bad ? 'text-bad' : 'text-ink'}`}>{displayChar(c.char)}</span>
                <span className="font-mono text-xs text-muted">×{c.count}</span>
              </div>
              <div className={`mt-1 font-mono text-sm font-medium ${bad ? 'text-bad' : 'text-good'}`}>{pct(c.accuracy)}</div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-muted" style={{ width: `${(c.avgMs / maxMs) * 100}%` }} />
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted">{c.avgMs ? `${Math.round(c.avgMs)} мс` : '—'}</div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export function FingerPanel({ analysis }: { analysis: Analysis }) {
  const rows = analysis.fingers.filter((f) => f.count > 0)
  const maxShare = Math.max(0.01, ...rows.map((r) => r.share))
  return (
    <Panel title="Работа пальцев">
      <div className="flex flex-col gap-2.5">
        {rows.map((f) => (
          <div key={f.finger} className="grid grid-cols-[8.5rem_1fr_3.2rem_3.6rem] items-center gap-3 text-sm sm:grid-cols-[10.5rem_1fr_3.5rem_4rem]">
            <span className="flex items-center gap-2 truncate text-ink">
              <span className="size-3 shrink-0 rounded-full" style={{ background: `var(--f${f.finger as Finger})` }} />
              {FINGER_NAMES[f.finger]}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full"
                style={{ width: `${(f.share / maxShare) * 100}%`, background: `var(--f${f.finger})` }}
              />
            </div>
            <span className={`text-right font-mono ${f.errors ? 'text-bad' : 'text-good'}`}>{pct(f.accuracy)}</span>
            <span className="text-right font-mono text-muted">{f.avgMs ? `${Math.round(f.avgMs)}мс` : '—'}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">Полоса — доля нажатий на палец, справа — точность и среднее время нажатия.</p>
    </Panel>
  )
}

function Cap({ ch, tone }: { ch: string; tone: 'ok' | 'bad' }) {
  return (
    <span
      className={`keycap inline-grid size-9 place-items-center rounded-lg font-mono text-lg ${tone === 'bad' ? 'text-bad' : 'text-ink'}`}
    >
      {displayChar(ch)}
    </span>
  )
}

export function ConfusionPanel({ analysis }: { analysis: Analysis }) {
  const list = analysis.confusions.slice(0, 8)
  return (
    <Panel title="Частые промахи">
      {list.length === 0 ? (
        <p className="text-sm text-muted">Ни одного промаха — чистая работа.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((c) => (
            <li key={c.expected + c.typed} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-muted">нужна</span>
              <Cap ch={c.expected} tone="ok" />
              <span className="text-muted">нажата</span>
              <Cap ch={c.typed} tone="bad" />
              <span className="ml-auto font-mono text-muted">×{c.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function WordsPanel({ analysis, unit }: { analysis: Analysis; unit: TestRun['settings']['unit'] }) {
  const words = analysis.words.filter((w) => w.word.length > 1)
  const slow = [...words].sort((a, b) => a.cpm - b.cpm).slice(0, 6)
  const withErrors = words.filter((w) => w.errors > 0)
  const maxCpm = Math.max(1, ...words.map((w) => w.cpm))
  return (
    <Panel title="Слова">
      {words.length === 0 ? (
        <p className="text-sm text-muted">Слишком короткий заход, чтобы оценить слова.</p>
      ) : (
        <>
          <h3 className="mb-2 text-sm font-medium text-muted">Самые медленные</h3>
          <ul className="flex flex-col gap-1.5">
            {slow.map((w) => (
              <li key={w.start} className="grid grid-cols-[1fr_6rem_3.5rem] items-center gap-3 text-sm">
                <span className="truncate font-mono">{w.word}</span>
                <div className="h-2 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full rounded-full bg-warn" style={{ width: `${(w.cpm / maxCpm) * 100}%` }} />
                </div>
                <span className="text-right font-mono text-muted" title={unitLabel(unit)}>
                  {formatSpeed(w.cpm, unit)}
                </span>
              </li>
            ))}
          </ul>
          {withErrors.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 text-sm font-medium text-muted">С ошибками</h3>
              <div className="flex flex-wrap gap-1.5">
                {withErrors.slice(0, 24).map((w) => (
                  <span key={w.start} className="rounded-lg bg-bad-soft px-2 py-1 font-mono text-sm text-bad">
                    {w.word}
                    {w.errors > 1 && <sup className="ml-0.5 text-[10px]">{w.errors}</sup>}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Panel>
  )
}
