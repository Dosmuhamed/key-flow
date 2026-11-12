import type { ReactNode } from 'react'
import { KEY_ROWS, keysForChar, shiftSideFor, type KeyDef, type Layout } from '../data/layouts'
import { OS } from '../lib/platform'

export interface HeatCell {
  /** 0 = perfect, 1 = worst */
  value: number
  label?: string
}

interface Props {
  layout: Layout
  nextChar?: string
  pressed?: Record<string, 'ok' | 'bad' | 'neutral'>
  heat?: Record<string, HeatCell>
  className?: string
}

/* ---------- geometry (SVG user units) ---------- */

const U = 54 // key pitch
const G = 6 // gap between caps
const PAD = 16 // case padding
const KB_W = PAD * 2 + 15 * U - G
const KB_H = PAD * 2 + 5 * U - G
const MAC = OS === 'mac'

interface KeyGeo {
  key: KeyDef
  x: number
  y: number
  w: number
  h: number
}

const GEO: KeyGeo[] = []
KEY_ROWS.forEach((row, r) => {
  let x = PAD
  for (const key of row) {
    const units = key.w ?? 1
    const w = units * U - G
    let y = PAD + r * U
    let h = U - G
    if (key.half) {
      h = (U - G) / 2 - 1.5
      if (key.half === 'bottom') y += (U - G) / 2 + 1.5
    }
    GEO.push({ key, x, y, w, h })
    if (!key.stack) x += units * U
  }
})

/* ---------- helpers ---------- */

const isLetter = (c?: string) => !!c && /\p{L}/u.test(c)

export function targetCodes(layout: Layout, char?: string): Set<string> {
  const out = new Set<string>()
  if (!char) return out
  if (char === ' ') {
    out.add('Space')
    return out
  }
  for (const k of keysForChar(layout, char)) {
    out.add(k.code)
    if (k.shift) out.add(shiftSideFor(k.code))
  }
  return out
}

/* ---------- key cap ---------- */

function KeyCap({
  g,
  layout,
  target,
  state,
  heat,
}: {
  g: KeyGeo
  layout: Layout
  target: boolean
  state?: 'ok' | 'bad' | 'neutral'
  heat?: HeatCell
}) {
  const { key: k, x, y, w, h } = g
  const chars = layout.chars[k.code]
  const isSpace = k.code === 'Space'
  const isMod = k.label !== undefined && !isSpace
  const isArrow = !!k.half

  let face = isMod ? 'var(--kb-mod-face)' : 'var(--kb-face)'
  let skirt = isMod ? 'var(--kb-mod-skirt)' : 'var(--kb-skirt)'
  let legend = isMod ? 'var(--kb-mod-legend)' : 'var(--kb-legend)'

  if (heat && heat.value > 0) {
    face = `color-mix(in oklab, var(--kf-bad) ${Math.round(18 + heat.value * 70)}%, var(--kb-face))`
    skirt = `color-mix(in oklab, var(--kf-bad) ${Math.round(30 + heat.value * 60)}%, var(--kb-skirt))`
  } else if (target) {
    face = 'var(--kf-accent)'
    skirt = 'var(--kb-accent-skirt)'
    legend = 'var(--kf-accent-ink)'
  } else if (state === 'bad') {
    face = 'var(--kf-bad)'
    skirt = 'color-mix(in oklab, var(--kf-bad) 65%, black)'
    legend = '#fff'
  }

  const down = !!state
  const inset = isArrow ? 3 : 4
  const faceX = x + inset
  const faceW = w - inset * 2
  const faceY = y + (isArrow ? 1 : 2)
  const faceH = h - (isArrow ? 5 : 9)
  const lx = faceX + 6
  const rx = isArrow ? 4 : MAC ? 6.5 : 5.5

  let legends: ReactNode = null
  if (isArrow) {
    legends = (
      <text x={faceX + faceW / 2} y={faceY + faceH / 2 + 3} textAnchor="middle" fontSize="8" fill={legend}>
        {k.label}
      </text>
    )
  } else if (isMod) {
    // Mac keys: symbol top-right, lowercase word bottom; PC keys: word bottom-left
    const rightSide = MAC && (k.code === 'MetaRight' || k.code === 'AltRight' || k.code === 'Enter' || k.code === 'Backspace' || k.code === 'ShiftRight')
    legends = (
      <>
        {k.symbol && (
          <text x={rightSide ? lx : faceX + faceW - 6} y={faceY + 14} textAnchor={rightSide ? 'start' : 'end'} fontSize="12" fill={legend}>
            {k.symbol}
          </text>
        )}
        <text
          x={rightSide ? faceX + faceW - 6 : lx}
          y={faceY + faceH - 6}
          textAnchor={rightSide ? 'end' : 'start'}
          fontSize={MAC ? 9.5 : 10.5}
          fontWeight="500"
          fill={legend}
        >
          {k.label}
        </text>
      </>
    )
  } else if (chars && !isSpace) {
    if (isLetter(chars[0])) {
      legends = (
        <text x={faceX + faceW / 2} y={faceY + faceH / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="500" fill={legend}>
          {chars[0].toLocaleUpperCase()}
        </text>
      )
    } else {
      legends = (
        <>
          <text x={lx} y={faceY + 14} fontSize="11.5" fill={legend} opacity="0.6">
            {chars[1]}
          </text>
          <text x={lx} y={faceY + faceH - 6} fontSize="14" fontWeight="500" fill={legend}>
            {chars[0]}
          </text>
        </>
      )
    }
  }

  return (
    <g style={{ transform: `translateY(${down ? 2.5 : 0}px)`, transition: 'transform 70ms ease' }}>
      <rect x={x} y={y} width={w} height={h} rx={rx + 1.5} fill={skirt} style={{ transition: 'fill 120ms ease' }} />
      <rect x={faceX} y={faceY} width={faceW} height={down ? faceH + 2 : faceH} rx={rx} fill={face} style={{ transition: 'fill 120ms ease' }} />
      {!isArrow && <rect x={faceX + 4} y={faceY + 1} width={faceW - 8} height="1.5" rx="0.75" fill="#fff" style={{ opacity: 'var(--kb-gloss)' }} />}
      {legends}
      {k.bump && <rect x={faceX + faceW / 2 - 6} y={faceY + faceH - 6} width="12" height="2" rx="1" fill={legend} opacity="0.5" />}
      {heat && heat.value >= 0 && heat.label && (
        <text x={faceX + faceW - 4} y={faceY + 11} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill={legend} opacity="0.8">
          {heat.label}
        </text>
      )}
    </g>
  )
}

/* ---------- keyboard ---------- */

export function Keyboard({ layout, nextChar, pressed = {}, heat, className = '' }: Props) {
  const targets = heat ? new Set<string>() : targetCodes(layout, nextChar)

  return (
    <svg
      viewBox={`0 0 ${KB_W} ${KB_H}`}
      className={`block h-auto w-full select-none ${className}`}
      style={{ fontFamily: 'var(--font-sans)' }}
      role="img"
      aria-label={nextChar ? `Клавиатура, следующая клавиша: ${nextChar === ' ' ? 'пробел' : nextChar}` : 'Клавиатура'}
    >
      <defs>
        <linearGradient id="kf-case" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--kb-case-top)" />
          <stop offset="1" stopColor="var(--kb-case-bottom)" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width={KB_W - 1} height={KB_H - 1} rx="20" fill="url(#kf-case)" stroke="var(--kb-case-edge)" />
      <rect x={PAD - 5} y={PAD - 5} width={KB_W - 2 * PAD + 10} height={KB_H - 2 * PAD + 10} rx="11" fill="var(--kb-plate)" />

      {GEO.map((g) => (
        <KeyCap
          key={g.key.code}
          g={g}
          layout={layout}
          target={targets.has(g.key.code)}
          state={pressed[g.key.code]}
          heat={heat ? (heat[g.key.code] ?? { value: -1 }) : undefined}
        />
      ))}
    </svg>
  )
}
