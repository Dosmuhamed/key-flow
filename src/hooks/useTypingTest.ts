import { useCallback, useEffect, useRef, useState } from 'react'
import { LANGUAGE_BY_ID } from '../data/languages'
import { generate, moreWords } from '../lib/generator'
import { weakLetters } from '../lib/storage'
import type { KeyEvent, Settings, TestRun } from '../lib/types'

export type Status = 'idle' | 'running' | 'done'

export interface KeyInput {
  key: string
  code: string
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

export interface Flash {
  id: number
  ok: boolean
}

const CYRILLIC = /\p{Script=Cyrillic}/u
const LATIN = /\p{Script=Latin}/u

export function useTypingTest(settings: Settings, onFinish: (run: TestRun) => void) {
  const [target, setTarget] = useState('')
  const [title, setTitle] = useState<string | undefined>()
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [errorPositions, setErrorPositions] = useState<Set<number>>(() => new Set())
  const [flash, setFlash] = useState<Flash | null>(null)
  const [wrongLayout, setWrongLayout] = useState(false)
  const [stats, setStats] = useState({ keystrokes: 0, wrong: 0 })

  const targetRef = useRef('')
  const typedRef = useRef('')
  const statusRef = useRef<Status>('idle')
  const eventsRef = useRef<KeyEvent[]>([])
  const startRef = useRef(0)
  const settingsRef = useRef(settings)
  const onFinishRef = useRef(onFinish)
  const flashId = useRef(0)

  useEffect(() => {
    settingsRef.current = settings
    onFinishRef.current = onFinish
  })

  const setStatusBoth = (s: Status) => {
    statusRef.current = s
    setStatus(s)
  }

  const reset = useCallback((keepText = false) => {
    if (!keepText) {
      const s = settingsRef.current
      const gen = generate(s, weakLetters(s.language))
      targetRef.current = gen.text
      setTarget(gen.text)
      setTitle(gen.title)
    }
    typedRef.current = ''
    eventsRef.current = []
    setTyped('')
    setElapsed(0)
    setErrorPositions(new Set())
    setFlash(null)
    setWrongLayout(false)
    setStats({ keystrokes: 0, wrong: 0 })
    setStatusBoth('idle')
  }, [])

  // regenerate text whenever the test-shaping settings change
  const { language, mode, time, words, lesson, punctuation, numbers, difficulty, textId } = settings
  useEffect(() => {
    reset()
  }, [language, mode, time, words, lesson, punctuation, numbers, difficulty, textId, reset])

  const finish = useCallback(() => {
    if (statusRef.current !== 'running') return
    const s = settingsRef.current
    const now = performance.now() - startRef.current
    const events = eventsRef.current
    const lastT = events.length ? events[events.length - 1].t : 0
    const duration = s.mode === 'time' ? Math.min(now, s.time * 1000) : Math.max(lastT, 1)
    setStatusBoth('done')
    setElapsed(duration)
    onFinishRef.current({
      id: `${Date.now()}`,
      date: Date.now(),
      settings: s,
      target: targetRef.current,
      typed: typedRef.current,
      events: [...events],
      duration,
      title,
    })
  }, [title])

  // timer
  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => {
      const now = performance.now() - startRef.current
      setElapsed(now)
      const s = settingsRef.current
      if (s.mode === 'time' && now >= s.time * 1000) finish()
    }, 100)
    return () => window.clearInterval(id)
  }, [status, finish])

  const handleKey = useCallback(
    (e: KeyInput): boolean => {
      if (statusRef.current === 'done') return false
      const s = settingsRef.current
      const tgt = targetRef.current
      let cur = typedRef.current

      const now = () => (statusRef.current === 'running' ? performance.now() - startRef.current : 0)

      if (e.key === 'Backspace') {
        if (s.strict || cur.length === 0 || statusRef.current !== 'running') return true
        let next: string
        if (e.ctrlKey || e.altKey || e.metaKey) {
          const trimmed = cur.replace(/\s+$/, '')
          const cut = trimmed.lastIndexOf(' ')
          next = cut === -1 ? '' : cur.slice(0, cut + 1)
          if (e.metaKey) next = ''
        } else {
          next = cur.slice(0, -1)
        }
        eventsRef.current.push({ t: now(), kind: 'back', index: next.length, code: e.code })
        typedRef.current = next
        setTyped(next)
        return true
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return false

      if (statusRef.current === 'idle') {
        startRef.current = performance.now()
        setStatusBoth('running')
      }

      const index = cur.length
      const expected = tgt[index]
      if (expected === undefined) return true
      const correct = e.key === expected
      eventsRef.current.push({ t: now(), kind: 'char', typed: e.key, expected, index, correct, code: e.code })
      setStats((st) => ({ keystrokes: st.keystrokes + 1, wrong: st.wrong + (correct ? 0 : 1) }))
      setFlash({ id: ++flashId.current, ok: correct })

      if (!correct) {
        setErrorPositions((prev) => new Set(prev).add(index))
        const script = LANGUAGE_BY_ID[s.language].script
        const typedOther = script === 'cyrillic' ? LATIN.test(e.key) : CYRILLIC.test(e.key)
        setWrongLayout(typedOther)
      } else {
        setWrongLayout(false)
      }

      if (s.strict && !correct) return true

      cur += e.key
      typedRef.current = cur
      setTyped(cur)

      if (s.mode === 'time') {
        if (tgt.length - cur.length < 120) {
          const extended = `${tgt} ${moreWords(s)}`
          targetRef.current = extended
          setTarget(extended)
        }
      } else if (cur.length >= tgt.length) {
        finish()
      }
      return true
    },
    [finish],
  )

  return {
    target,
    title,
    typed,
    status,
    elapsed,
    errorPositions,
    flash,
    wrongLayout,
    stats,
    handleKey,
    reset,
    finish,
  }
}
