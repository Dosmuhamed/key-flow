import { useTranslation } from 'react-i18next'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LANGUAGE_BY_ID } from '../../data/languages'
import { LAYOUTS } from '../../data/layouts'
import { formatSpeed, unitLabel } from '../../lib/format'
import { typedAt } from '../../lib/stats'
import type { TestRun } from '../../lib/types'
import { Keyboard } from '../Keyboard'
import { TextView } from '../TextView'

const SPEEDS = [0.5, 1, 2, 4]

export function Replay({ run }: { run: TestRun }) {
  const { t: tr } = useTranslation()
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  const tRef = useRef(0)
  const duration = Math.max(run.duration, 1)
  const strict = run.settings.strict
  const layout = LAYOUTS[LANGUAGE_BY_ID[run.settings.language].layoutId]

  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    if (!playing) return
    const tick = (now: number) => {
      const dt = last.current === null ? 0 : now - last.current
      last.current = now
      const next = Math.min(duration, tRef.current + dt * rate)
      tRef.current = next
      setT(next)
      if (next >= duration) {
        setPlaying(false)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      last.current = null
    }
  }, [playing, rate, duration])

  const { typed, lastEvent } = useMemo(() => typedAt(run, t, strict), [run, t, strict])

  const { errorPositions, correct, keystrokes, wrong } = useMemo(() => {
    const errs = new Set<number>()
    let ks = 0
    let wr = 0
    for (const ev of run.events) {
      if (ev.t > t || t <= 0) break
      if (ev.kind === 'char') {
        ks++
        if (!ev.correct) {
          wr++
          errs.add(ev.index)
        }
      }
    }
    let c = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === run.target[i]) c++
    return { errorPositions: errs, correct: c, keystrokes: ks, wrong: wr }
  }, [run, t, typed])

  const pressed: Record<string, 'ok' | 'bad' | 'neutral'> = {}
  if (lastEvent?.code && t - lastEvent.t < 140 / Math.max(rate, 1)) {
    pressed[lastEvent.code] = lastEvent.kind === 'back' ? 'neutral' : lastEvent.correct ? 'ok' : 'bad'
  }

  const cpm = t > 500 ? (correct / t) * 60000 : 0
  // only show the slice of text the user reached, plus a little context
  const shownTarget = run.settings.mode === 'time' ? run.target.slice(0, run.typed.length + 40) : run.target

  const toggle = () => {
    if (!playing && t >= duration) setT(0)
    setPlaying((p) => !p)
  }

  return (
    <div>
      <div className="rounded-2xl bg-page/60 px-4 py-4 sm:px-6">
        <TextView target={shownTarget} typed={typed} errorPositions={errorPositions} size="md" lines={3} idle={!playing} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="grid size-11 place-items-center rounded-full bg-accent text-accent-ink transition-transform active:scale-95"
          aria-label={playing ? tr('replay.pause') : tr('replay.play')}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-[1px]" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setT(0)
            setPlaying(true)
          }}
          className="grid size-9 place-items-center rounded-full text-muted hover:bg-sunken hover:text-ink"
          aria-label={tr('replay.fromStart')}
          title={tr('replay.fromStart')}
        >
          <RotateCcw className="size-4" />
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={10}
          value={t}
          onChange={(e) => {
            setPlaying(false)
            setT(Number(e.target.value))
          }}
          className="h-2 min-w-40 flex-1 cursor-pointer accent-[var(--kf-accent)]"
          aria-label={tr('replay.position')}
        />
        <span className="w-28 text-right font-mono text-sm whitespace-nowrap text-muted tabular-nums">
          {(t / 1000).toFixed(1)} / {(duration / 1000).toFixed(1)} {tr('replay.sec')}
        </span>
        <div className="flex gap-0.5 rounded-lg bg-sunken p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRate(s)}
              className={`h-7 rounded-md px-2 font-mono text-xs ${rate === s ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-6 text-sm">
          <div>
            <div className="font-mono text-xl font-medium tabular-nums">{formatSpeed(cpm, run.settings.unit)}</div>
            <div className="text-xs text-muted">{unitLabel(run.settings.unit)}</div>
          </div>
          <div>
            <div className="font-mono text-xl font-medium tabular-nums">{keystrokes}</div>
            <div className="text-xs text-muted">{tr('replay.keystrokes')}</div>
          </div>
          <div>
            <div className="font-mono text-xl font-medium text-bad tabular-nums">{wrong}</div>
            <div className="text-xs text-muted">{tr('replay.errors')}</div>
          </div>
        </div>
        <Keyboard layout={layout} pressed={pressed} className="max-w-[520px]" />
      </div>
    </div>
  )
}
