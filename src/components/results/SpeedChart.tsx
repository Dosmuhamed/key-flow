import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { speedValue, unitLabel } from '../../lib/format'
import type { TimelinePoint } from '../../lib/stats'
import type { Settings } from '../../lib/types'

interface Props {
  timeline: TimelinePoint[]
  unit: Settings['unit']
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function niceMax(v: number) {
  if (v <= 0) return 10
  const step = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= v) return m * step
  return 10 * step
}

export function SpeedChart({ timeline, unit }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const height = 240
  const pad = { l: 44, r: 12, t: 16, b: 28 }
  const w = Math.max(200, width)
  const iw = w - pad.l - pad.r
  const ih = height - pad.t - pad.b

  const pts = timeline.map((p) => ({ ...p, speed: speedValue(p.cpm, unit), rawV: speedValue(p.raw, unit) }))
  const yMax = niceMax(Math.max(1, ...pts.map((p) => Math.max(p.speed, p.rawV))) * 1.08)
  const n = pts.length
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v: number) => pad.t + ih - (v / yMax) * ih

  const line = (key: 'speed' | 'rawV') => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join('')
  const area = `${line('speed')}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const maxErr = Math.max(1, ...pts.map((p) => p.errors))

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax)
  const xEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 56))))

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const i = Math.round(((px - pad.l) / iw) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  const hp = hover !== null ? pts[hover] : null

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={w}
        height={height}
        className="block touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="График скорости по секундам"
      >
        <defs>
          <linearGradient id="kf-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--kf-accent)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--kf-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--kf-line)" strokeDasharray={t === 0 ? undefined : '2 4'} />
            <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {pts.map((p, i) =>
          i % xEvery === 0 || i === n - 1 ? (
            <text key={p.sec} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">
              {p.sec}
            </text>
          ) : null,
        )}
        {n > 1 && <path d={area} fill="url(#kf-area)" />}
        <path d={line('rawV')} fill="none" stroke="var(--kf-faint)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={line('speed')} fill="none" stroke="var(--kf-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) =>
          p.errors ? (
            <g key={`e${p.sec}`} transform={`translate(${x(i)},${pad.t + 4})`}>
              <circle r={3 + (p.errors / maxErr) * 4} fill="var(--kf-bad)" opacity="0.85" />
            </g>
          ) : null,
        )}
        {hp && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--kf-ink)" strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(hp.speed)} r="4.5" fill="var(--kf-surface)" stroke="var(--kf-accent)" strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hp && hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-xl bg-ink px-3 py-2 text-xs text-page shadow-lg"
          style={{ left: Math.min(Math.max(x(hover) - 72, 0), w - 150) }}
        >
          <div className="mb-1 font-semibold">{hp.sec}-я секунда</div>
          <div className="flex justify-between gap-3">
            <span className="opacity-70">Скорость</span>
            <span className="font-mono">{Math.round(hp.speed)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="opacity-70">Темп в моменте</span>
            <span className="font-mono">{Math.round(hp.rawV)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="opacity-70">Ошибки</span>
            <span className="font-mono">{hp.errors}</span>
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 pl-11 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="h-[3px] w-5 rounded-full bg-accent" />
          Средняя скорость, {unitLabel(unit)}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-dashed border-faint" />
          Темп в моменте
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-bad" />
          Ошибки
        </span>
      </div>
    </div>
  )
}
