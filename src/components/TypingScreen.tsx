import { AlertTriangle, MousePointerClick, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_BY_ID } from '../data/languages'
import { KEY_BY_CODE, LAYOUTS, keysForChar, type Finger } from '../data/layouts'
import type { useTypingTest } from '../hooks/useTypingTest'
import type { Settings } from '../lib/types'
import { formatSpeed, unitLabel } from '../lib/format'
import { OS } from '../lib/platform'
import { Keyboard } from './Keyboard'
import { TextView } from './TextView'
import { Kbd } from './ui'

type Test = ReturnType<typeof useTypingTest>

interface Props {
  settings: Settings
  test: Test
  /** another layer (modal) is open — stop capturing keys */
  paused: boolean
}

export function TypingScreen({ settings, test, paused }: Props) {
  const { t } = useTranslation()
  const { target, typed, status, elapsed, errorPositions, flash, wrongLayout, stats, handleKey, reset, title } = test
  const lang = LANGUAGE_BY_ID[settings.language]
  const layout = LAYOUTS[lang.layoutId]
  const [pressed, setPressed] = useState<Record<string, 'ok' | 'bad' | 'neutral'>>({})
  const [focused, setFocused] = useState(true)
  const areaRef = useRef<HTMLDivElement>(null)

  const nextChar = target[typed.length]

  // capture keys globally
  const stateRef = useRef({ target, typed, handleKey, reset, paused })
  useEffect(() => {
    stateRef.current = { target, typed, handleKey, reset, paused }
  })

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const st = stateRef.current
      if (st.paused) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return

      if (e.key === 'Tab') {
        e.preventDefault()
        st.reset(false)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        st.reset(true)
        return
      }
      if (el && el.tagName === 'BUTTON') el.blur()

      const expected = st.target[st.typed.length]
      const isChar = e.key.length === 1
      setPressed((p) => ({ ...p, [e.code]: isChar ? (e.key === expected ? 'ok' : 'bad') : 'neutral' }))
      if (st.handleKey(e)) {
        e.preventDefault()
        setFocused(true)
      }
    }
    const onUp = (e: KeyboardEvent) => {
      setPressed((p) => {
        if (!(e.code in p)) return p
        const next = { ...p }
        delete next[e.code]
        return next
      })
    }
    const onBlur = () => {
      setPressed({})
      setFocused(false)
    }
    const onFocus = () => setFocused(true)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // live numbers
  const seconds = elapsed / 1000
  let correct = 0
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++
  const cpm = seconds > 0.5 ? (correct / seconds) * 60 : 0
  const accuracy = stats.keystrokes ? (stats.keystrokes - stats.wrong) / stats.keystrokes : 1

  let progressLabel: string
  let progress: number
  if (settings.mode === 'time') {
    const left = Math.max(0, settings.time - seconds)
    progressLabel = `${Math.ceil(left)}`
    progress = Math.min(1, seconds / settings.time)
  } else {
    progress = target.length ? typed.length / target.length : 0
    if (settings.mode === 'words') {
      const done = typed.split(' ').length - 1
      progressLabel = `${done}/${settings.words}`
    } else {
      progressLabel = `${Math.round(progress * 100)}%`
    }
  }

  // finger hint
  let hintFinger: Finger | undefined
  if (nextChar === ' ') hintFinger = 8
  else if (nextChar) {
    const keys = keysForChar(layout, nextChar)
    const last = keys[keys.length - 1]
    if (last) hintFinger = KEY_BY_CODE[last.code]?.finger
  }
  const needsShift = nextChar ? keysForChar(layout, nextChar).some((k) => k.shift) : false

  const strictFlash = settings.strict && flash && !flash.ok ? flash.id : null

  return (
    <div className="flex flex-col items-center">
      {/* live stats */}
      <div className="mb-4 flex w-full max-w-4xl items-end justify-between gap-4 px-1">
        <div className="flex items-end gap-6 sm:gap-8">
          <div>
            <div className="font-mono text-4xl leading-none font-semibold text-accent tabular-nums sm:text-5xl">{progressLabel}</div>
            <div className="mt-1.5 text-xs text-muted">{settings.mode === 'time' ? t('typing.secondsLeft') : settings.mode === 'words' ? t('typing.wordsTyped') : t('typing.done')}</div>
          </div>
          <div className={`transition-opacity ${status === 'running' ? 'opacity-100' : 'opacity-40'}`}>
            <div className="font-mono text-2xl leading-none font-medium tabular-nums">{formatSpeed(cpm, settings.unit)}</div>
            <div className="mt-1.5 text-xs text-muted">{unitLabel(settings.unit)}</div>
          </div>
          <div className={`transition-opacity ${status === 'running' ? 'opacity-100' : 'opacity-40'}`}>
            <div className="font-mono text-2xl leading-none font-medium tabular-nums">{Math.round(accuracy * 100)}%</div>
            <div className="mt-1.5 text-xs text-muted">{t('typing.accuracy')}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => reset(false)}
          className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
          title={t('typing.newTextTitle')}
        >
          <RotateCcw className="size-4" />
          <span className="hidden sm:inline">{t('typing.restart')}</span>
        </button>
      </div>

      {/* text */}
      <div
        ref={areaRef}
        className="relative w-full max-w-4xl rounded-3xl bg-surface px-5 pt-5 pb-4 sm:px-9 sm:pt-7 sm:pb-5"
        onClick={() => setFocused(true)}
      >
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-3xl">
          <div className="h-full bg-accent transition-[width] duration-150 ease-linear" style={{ width: `${progress * 100}%` }} />
        </div>
        {title && <div className="mb-2 text-sm font-medium text-muted">{title}</div>}
        <TextView
          target={target}
          typed={typed}
          errorPositions={errorPositions}
          idle={status === 'idle'}
          flashError={strictFlash}
          className={focused ? '' : 'blur-[3px] select-none'}
        />
        {!focused && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl text-sm font-medium text-ink">
            <span className="flex items-center gap-2 rounded-xl bg-surface/90 px-4 py-2">
              <MousePointerClick className="size-4" />
              {t('typing.clickToContinue')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-6 items-center justify-center px-2 text-center text-sm">
        {wrongLayout ? (
          <span className="flex items-center gap-2 font-medium text-warn">
            <AlertTriangle className="size-4" />
            {t('typing.wrongLayout', { layout: layout.name })}
          </span>
        ) : status === 'idle' ? (
          <span className="text-muted">{t('typing.startHint')}</span>
        ) : nextChar ? (
          <span className="text-muted">
            {nextChar === ' ' ? t('typing.space') : `«${nextChar}»`}
            {hintFinger !== undefined && <> — {t(`fingers.${hintFinger}`).toLocaleLowerCase()}</>}
            {needsShift && t('typing.withShift')}
          </span>
        ) : null}
      </div>

      {settings.showKeyboard && (
        <div className="mt-4 w-full max-w-[860px]">
          <Keyboard layout={layout} nextChar={nextChar} pressed={pressed} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Kbd>Tab</Kbd> {t('typing.newText')}
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd> {t('typing.restartText')}
        </span>
        {!settings.strict && (
          <span className="flex items-center gap-1.5">
            <Kbd>{OS === 'mac' ? '⌥ option' : 'Ctrl'}</Kbd>+<Kbd>{OS === 'mac' ? '⌫ delete' : 'Backspace'}</Kbd> {t('typing.deleteWord')}
          </span>
        )}
      </div>
    </div>
  )
}
