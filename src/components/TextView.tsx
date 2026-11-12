import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useAppearance } from '../hooks/useAppearance'
import { TYPE_SIZES } from '../lib/appearance'

interface Props {
  target: string
  typed: string
  /** positions where a mistake happened at least once */
  errorPositions?: Set<number>
  /** blink the caret (when idle) */
  idle?: boolean
  /** show a short-lived error highlight on the current char */
  flashError?: number | null
  lines?: number
  className?: string
  size?: 'lg' | 'md'
}

interface Word {
  start: number
  chars: string[]
}

function splitWords(text: string): Word[] {
  const words: Word[] = []
  let cur: Word | null = null
  Array.from(text).forEach((ch, i) => {
    if (!cur) cur = { start: i, chars: [] }
    cur.chars.push(ch)
    if (ch === ' ') {
      words.push(cur)
      cur = null
    }
  })
  if (cur) words.push(cur)
  return words
}

const Char = memo(function Char({
  ch,
  state,
  hadError,
  shakeId,
  setRef,
}: {
  ch: string
  state: 'pending' | 'ok' | 'bad' | 'current'
  hadError: boolean
  shakeId: number | null
  setRef: (el: HTMLSpanElement | null) => void
}) {
  const isSpace = ch === ' '
  let cls = 'text-faint'
  if (state === 'ok') cls = hadError
      ? "text-ink after:absolute after:inset-x-[3px] after:bottom-[7px] after:h-[2px] after:rounded-full after:bg-warn after:content-['']"
      : 'text-ink'
  if (state === 'bad') cls = isSpace ? 'bg-bad-soft text-bad rounded-sm' : 'text-bad bg-bad-soft/70 rounded-sm'
  if (shakeId != null) cls = 'text-bad bg-bad-soft rounded-sm'
  return (
    <span ref={setRef} className={`relative inline-block whitespace-pre ${cls}`}>
      <span key={shakeId ?? 'still'} className={shakeId != null ? 'shake inline-block' : 'inline-block'}>
        {isSpace ? '\u00a0' : ch}
      </span>
    </span>
  )
})

export function TextView({
  target,
  typed,
  errorPositions,
  idle,
  flashError,
  lines = 3,
  className = '',
  size = 'lg',
}: Props) {
  const appearance = useAppearance()
  const words = useMemo(() => splitWords(target), [target])
  const refs = useRef<(HTMLSpanElement | null)[]>([])
  const [caret, setCaret] = useState({ left: 0, top: 0, height: 0, width: 0 })
  const [offset, setOffset] = useState(0)
  const [fontTick, setFontTick] = useState(0)
  const metrics = size === 'lg' ? TYPE_SIZES[appearance.size] : { fontSize: '1.25rem', lineHeight: 40 }
  const lineHeight = metrics.lineHeight

  const caretIndex = typed.length

  // web fonts load asynchronously — re-measure once they arrive
  useEffect(() => {
    if (!document.fonts) return
    const bump = () => setFontTick((n) => n + 1)
    document.fonts.addEventListener('loadingdone', bump)
    return () => document.fonts.removeEventListener('loadingdone', bump)
  }, [])

  useLayoutEffect(() => {
    const el = refs.current[caretIndex] ?? null
    const prev = refs.current[caretIndex - 1] ?? null
    let left = 0
    let top = 0
    let height = lineHeight * 0.62
    let width = 12
    if (el) {
      left = el.offsetLeft
      top = el.offsetTop
      height = el.offsetHeight
      width = el.offsetWidth
    } else if (prev) {
      left = prev.offsetLeft + prev.offsetWidth
      top = prev.offsetTop
      height = prev.offsetHeight
      width = prev.offsetWidth
    }
    setCaret({ left, top, height, width })
    const lineNo = Math.round(top / lineHeight)
    setOffset(Math.max(0, lineNo - 1) * lineHeight)
  }, [caretIndex, target, lineHeight, appearance.font, fontTick])

  const setters = useMemo(
    () => Array.from({ length: target.length }, (_, i) => (el: HTMLSpanElement | null) => (refs.current[i] = el)),
    [target],
  )

  let caretStyle: CSSProperties
  let caretClass = 'bg-accent'
  if (appearance.caret === 'block') {
    caretStyle = { left: caret.left, top: caret.top + caret.height * 0.14, height: caret.height * 0.72, width: caret.width }
    caretClass = 'bg-accent/30 rounded-[3px]'
  } else if (appearance.caret === 'underline') {
    caretStyle = { left: caret.left, top: caret.top + caret.height * 0.84, height: 3, width: caret.width }
    caretClass = 'bg-accent rounded-full'
  } else {
    caretStyle = { left: caret.left - 1, top: caret.top + caret.height * 0.18, height: caret.height * 0.64, width: 3 }
    caretClass = 'bg-accent rounded-full'
  }
  const caretMotion = appearance.smoothCaret ? 'transition-[left,top,width] duration-100 ease-out' : ''

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: lineHeight * lines, fontFamily: 'var(--kf-type-font)', fontSize: metrics.fontSize }}
    >
      <div
        className="relative flex flex-wrap transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${-offset}px)`, lineHeight: `${lineHeight}px` }}
      >
        {words.map((w) => (
          <span key={w.start} className="inline-flex">
            {w.chars.map((ch, j) => {
              const i = w.start + j
              let state: 'pending' | 'ok' | 'bad' | 'current' = 'pending'
              if (i < typed.length) state = typed[i] === ch ? 'ok' : 'bad'
              else if (i === typed.length) state = 'current'
              return (
                <Char
                  key={i}
                  ch={ch}
                  state={state}
                  hadError={!!errorPositions?.has(i)}
                  shakeId={state === 'current' && flashError != null ? flashError : null}
                  setRef={setters[i]}
                />
              )
            })}
          </span>
        ))}
        <span
          aria-hidden
          className={`pointer-events-none absolute ${caretClass} ${caretMotion} ${idle ? 'caret-idle' : ''}`}
          style={caretStyle}
        />
      </div>
    </div>
  )
}
