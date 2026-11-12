import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { LANGUAGE_BY_ID } from '../../data/languages'
import { LAYOUTS, type Finger } from '../../data/layouts'
import { displayChar, formatSpeed, pct, unitLabel } from '../../lib/format'
import type { Analysis } from '../../lib/stats'
import type { TestRun } from '../../lib/types'
import { Keyboard, type HeatCell } from '../Keyboard'
import { Panel, Segmented } from '../ui'

export function KeyHeatmap({ run, analysis }: { run: TestRun; analysis: Analysis }) {
  const { t } = useTranslation()
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
      title={t('heatmap.title')}
      aside={
        <Segmented
          label={t('heatmap.metric')}
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'errors', label: t('heatmap.errors') },
            { value: 'speed', label: t('heatmap.speed') },
          ]}
        />
      }
    >
      <div className="overflow-x-auto pb-1">
        <Keyboard layout={layout} heat={heat} className="mx-auto max-w-[640px] min-w-[520px]" />
      </div>
      <p className="mt-3 text-sm text-muted">
        {metric === 'errors'
          ? t('heatmap.errorsHint')
          : t('heatmap.speedHint')}
      </p>
    </Panel>
  )
}

export function LetterGrid({ analysis }: { analysis: Analysis }) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<'accuracy' | 'speed' | 'alpha'>('accuracy')
  const chars = [...analysis.chars]
  if (sort === 'speed') chars.sort((a, b) => b.avgMs - a.avgMs)
  if (sort === 'alpha') chars.sort((a, b) => a.char.localeCompare(b.char))
  const maxMs = Math.max(1, ...chars.map((c) => c.avgMs))

  return (
    <Panel
      title={t('letters.title')}
      aside={
        <Segmented
          label={t('letters.sort')}
          value={sort}
          onChange={setSort}
          options={[
            { value: 'accuracy', label: t('letters.byErrors') },
            { value: 'speed', label: t('letters.bySpeed') },
            { value: 'alpha', label: t('letters.byAlpha') },
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
              title={t('letters.tooltip', { char: displayChar(c.char), count: c.count, errors: c.errors, ms: Math.round(c.avgMs) })}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-mono text-2xl font-medium ${bad ? 'text-bad' : 'text-ink'}`}>{displayChar(c.char)}</span>
                <span className="font-mono text-xs text-muted">×{c.count}</span>
              </div>
              <div className={`mt-1 font-mono text-sm font-medium ${bad ? 'text-bad' : 'text-good'}`}>{pct(c.accuracy)}</div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-muted" style={{ width: `${(c.avgMs / maxMs) * 100}%` }} />
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted">{c.avgMs ? t('units.ms', { n: Math.round(c.avgMs) }) : '—'}</div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export function FingerPanel({ analysis }: { analysis: Analysis }) {
  const { t } = useTranslation()
  const rows = analysis.fingers.filter((f) => f.count > 0)
  const maxShare = Math.max(0.01, ...rows.map((r) => r.share))
  return (
    <Panel title={t('fingerPanel.title')}>
      <div className="flex flex-col gap-2.5">
        {rows.map((f) => (
          <div key={f.finger} className="grid grid-cols-[8.5rem_1fr_3.2rem_3.6rem] items-center gap-3 text-sm sm:grid-cols-[10.5rem_1fr_3.5rem_4rem]">
            <span className="flex items-center gap-2 truncate text-ink">
              <span className="size-3 shrink-0 rounded-full" style={{ background: `var(--f${f.finger as Finger})` }} />
              {t(`fingers.${f.finger}`)}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full"
                style={{ width: `${(f.share / maxShare) * 100}%`, background: `var(--f${f.finger})` }}
              />
            </div>
            <span className={`text-right font-mono ${f.errors ? 'text-bad' : 'text-good'}`}>{pct(f.accuracy)}</span>
            <span className="text-right font-mono text-muted">{f.avgMs ? t('units.ms', { n: Math.round(f.avgMs) }) : '—'}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{t('fingerPanel.hint')}</p>
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
  const { t } = useTranslation()
  const list = analysis.confusions.slice(0, 8)
  return (
    <Panel title={t('confusions.title')}>
      {list.length === 0 ? (
        <p className="text-sm text-muted">{t('confusions.none')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((c) => (
            <li key={c.expected + c.typed} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-muted">{t('confusions.expected')}</span>
              <Cap ch={c.expected} tone="ok" />
              <span className="text-muted">{t('confusions.typed')}</span>
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
  const { t } = useTranslation()
  const words = analysis.words.filter((w) => w.word.length > 1)
  const slow = [...words].sort((a, b) => a.cpm - b.cpm).slice(0, 6)
  const withErrors = words.filter((w) => w.errors > 0)
  const maxCpm = Math.max(1, ...words.map((w) => w.cpm))
  return (
    <Panel title={t('words.title')}>
      {words.length === 0 ? (
        <p className="text-sm text-muted">{t('words.tooShort')}</p>
      ) : (
        <>
          <h3 className="mb-2 text-sm font-medium text-muted">{t('words.slowest')}</h3>
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
              <h3 className="mt-5 mb-2 text-sm font-medium text-muted">{t('words.withErrors')}</h3>
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
