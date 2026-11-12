import { ChevronDown, FileText, Gauge, GraduationCap, Hash, Lock, Quote, Timer, Type } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_BY_ID, LANGUAGES, type LanguageId } from '../data/languages'
import { DIFFICULTIES, TIME_OPTIONS, WORD_OPTIONS, type Difficulty, type LessonId, type Mode, type Settings } from '../lib/types'
import { Segmented, Toggle } from './ui'

interface Props {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  hasWeakLetters: boolean
}

const LESSONS: LessonId[] = ['home', 'top', 'bottom', 'all', 'weak']

function Select<T extends string | number>({
  value,
  onChange,
  label,
  icon,
  children,
}: {
  value: T
  onChange: (v: string) => void
  label: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <label className="relative flex h-10 max-w-full items-center gap-2 rounded-xl bg-sunken pr-8 pl-3 text-sm font-medium text-ink">
      {icon}
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-1 outline-none"
        title={label}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted" />
    </label>
  )
}

/**
 * Two fixed rows laid out on a three-column grid. The middle column never changes width,
 * so switching modes only changes what grows to the left of the centre line — the
 * toggles on the right stay exactly where they were.
 */
export function SettingsBar({ settings, update, hasWeakLetters }: Props) {
  const { t } = useTranslation()
  const { mode, difficulty, language } = settings
  const wordish = mode === 'time' || mode === 'words'
  const expert = wordish && difficulty === 'expert'
  const kk = language === 'kk'

  let modeOptions: ReactNode
  if (mode === 'time') {
    modeOptions = (
      <Segmented<number>
        label={t('bar.duration')}
        value={settings.time}
        onChange={(v) => update({ time: v })}
        options={TIME_OPTIONS.map((v) => ({
          value: v,
          label: v < 60 ? t('units.sec', { n: v }) : t('units.min', { n: v / 60 }),
        }))}
      />
    )
  } else if (mode === 'words') {
    modeOptions = (
      <Segmented<number>
        label={t('bar.wordCount')}
        value={settings.words}
        onChange={(v) => update({ words: v })}
        options={WORD_OPTIONS.map((v) => ({ value: v, label: String(v) }))}
      />
    )
  } else if (mode === 'lesson') {
    modeOptions = (
      <Segmented<LessonId>
        label={t('bar.lesson')}
        value={settings.lesson}
        onChange={(v) => update({ lesson: v })}
        options={LESSONS.map((l) => {
          const off = l === 'weak' && !hasWeakLetters
          return {
            value: l,
            label: t(`lessons.${l}`),
            title: off ? t('lessons.weakDisabled') : t(`lessons.${l}Title`),
            disabled: off,
          }
        })}
      />
    )
  } else {
    const texts = LANGUAGE_BY_ID[language].texts
    modeOptions = (
      <Select
        label={t('bar.passage')}
        value={settings.textId}
        onChange={(v) => update({ textId: Number(v) })}
        icon={<FileText className="size-4 shrink-0 text-muted" />}
      >
        <option value={-1}>{t('bar.randomText')}</option>
        {texts.map((tx, i) => (
          <option key={tx.title} value={i}>
            {tx.title}
          </option>
        ))}
      </Select>
    )
  }

  const numbersTitle = kk ? t('bar.numbersKk') : !wordish ? t('bar.onlyWordModes') : expert ? t('bar.forcedByExpert') : t('bar.numbersTitle')
  const punctTitle = !wordish ? t('bar.onlyWordModes') : expert ? t('bar.forcedByExpert') : t('bar.punctuationTitle')

  return (
    <div className="flex flex-col gap-2.5">
      {/* row 1: what to type — never changes shape */}
      <div className="flex flex-wrap items-center justify-center gap-2 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 justify-end">
          <Select label={t('bar.textLanguage')} value={language} onChange={(v) => update({ language: v as LanguageId, textId: -1 })}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
        <Segmented<Mode>
          label={t('bar.mode')}
          value={mode}
          onChange={(m) => update({ mode: m })}
          options={[
            { value: 'time', label: <><Timer className="size-4" />{t('modes.time')}</>, title: t('modes.timeTitle') },
            { value: 'words', label: <><Type className="size-4" />{t('modes.words')}</>, title: t('modes.wordsTitle') },
            { value: 'text', label: <><FileText className="size-4" />{t('modes.text')}</>, title: t('modes.textTitle') },
            { value: 'lesson', label: <><GraduationCap className="size-4" />{t('modes.lesson')}</>, title: t('modes.lessonTitle') },
          ]}
        />
        <div className="flex min-w-0 justify-start">
          <Segmented<Difficulty>
            label={t('difficulty.label')}
            value={difficulty}
            onChange={(d) => update({ difficulty: d })}
            options={DIFFICULTIES.map((d, i) => ({
              value: d,
              label: (
                <>
                  {i === 0 && <Gauge className="size-4" />}
                  {t(`difficulty.${d}`)}
                </>
              ),
              title: wordish ? t(`difficulty.${d}Title`) : t('difficulty.onlyWords'),
              disabled: !wordish,
            }))}
          />
        </div>
      </div>

      {/* row 2: options of the chosen mode grow left of the divider, toggles stay put on the right */}
      <div className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="flex min-w-0 justify-end">{modeOptions}</div>
        <span className="mx-1 h-6 w-px bg-line" aria-hidden />
        <div className="flex min-w-0 items-center justify-start gap-2">
          <Toggle
            checked={wordish && (settings.punctuation || expert)}
            disabled={!wordish || expert}
            onChange={(v) => update({ punctuation: v })}
            title={punctTitle}
          >
            <Quote className="size-4" />
            {t('bar.punctuation')}
          </Toggle>
          <Toggle
            checked={wordish && !kk && (settings.numbers || expert)}
            disabled={!wordish || kk || expert}
            onChange={(v) => update({ numbers: v })}
            title={numbersTitle}
          >
            <Hash className="size-4" />
            {t('bar.numbers')}
          </Toggle>
          <Toggle checked={settings.strict} onChange={(v) => update({ strict: v })} title={t('bar.strictTitle')}>
            <Lock className="size-4" />
            {t('bar.strict')}
          </Toggle>
        </div>
      </div>
    </div>
  )
}
