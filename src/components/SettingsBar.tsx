import { ChevronDown, FileText, GraduationCap, Hash, Lock, Quote, Timer, Type } from 'lucide-react'
import { LANGUAGES, type LanguageId } from '../data/languages'
import { TIME_OPTIONS, WORD_OPTIONS, type LessonId, type Mode, type Settings } from '../lib/types'
import { Segmented, Toggle } from './ui'

interface Props {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  hasWeakLetters: boolean
}

const LESSONS: { value: LessonId; label: string; title: string }[] = [
  { value: 'home', label: 'Основной ряд', title: 'Буквы под пальцами в исходной позиции' },
  { value: 'top', label: 'Верхний ряд', title: 'Буквы верхнего ряда' },
  { value: 'bottom', label: 'Нижний ряд', title: 'Буквы нижнего ряда' },
  { value: 'all', label: 'Все буквы', title: 'Случайные сочетания всех букв' },
  { value: 'weak', label: 'Мои ошибки', title: 'Слова с буквами, в которых вы чаще ошибаетесь' },
]

export function SettingsBar({ settings, update, hasWeakLetters }: Props) {
  const { mode } = settings
  const wordish = mode === 'time' || mode === 'words'

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <label className="relative flex h-10 items-center rounded-xl bg-sunken pr-8 pl-3 text-sm font-medium text-ink">
        <span className="sr-only">Язык</span>
        <select
          value={settings.language}
          onChange={(e) => update({ language: e.target.value as LanguageId })}
          className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted" />
      </label>

      <Segmented<Mode>
        label="Режим"
        value={mode}
        onChange={(m) => update({ mode: m })}
        options={[
          { value: 'time', label: <><Timer className="size-4" />Время</>, title: 'Печатайте, пока не закончится время' },
          { value: 'words', label: <><Type className="size-4" />Слова</>, title: 'Фиксированное количество слов' },
          { value: 'text', label: <><FileText className="size-4" />Текст</>, title: 'Связный текст с пунктуацией' },
          { value: 'lesson', label: <><GraduationCap className="size-4" />Уроки</>, title: 'Упражнения по рядам клавиатуры' },
        ]}
      />

      {mode === 'time' && (
        <Segmented<number>
          label="Длительность"
          value={settings.time}
          onChange={(t) => update({ time: t })}
          options={TIME_OPTIONS.map((t) => ({ value: t, label: t < 60 ? `${t} с` : `${t / 60} мин` }))}
        />
      )}
      {mode === 'words' && (
        <Segmented<number>
          label="Количество слов"
          value={settings.words}
          onChange={(w) => update({ words: w })}
          options={WORD_OPTIONS.map((w) => ({ value: w, label: String(w) }))}
        />
      )}
      {mode === 'lesson' && (
        <Segmented<LessonId>
          label="Урок"
          value={settings.lesson}
          onChange={(l) => update({ lesson: l })}
          options={LESSONS.map((l) => ({
            ...l,
            disabled: l.value === 'weak' && !hasWeakLetters,
            title: l.value === 'weak' && !hasWeakLetters ? 'Пройдите пару тестов — и здесь появятся ваши трудные буквы' : l.title,
          }))}
        />
      )}

      {wordish && (
        <>
          <Toggle checked={settings.punctuation} onChange={(v) => update({ punctuation: v })} title="Заглавные буквы и знаки препинания">
            <Quote className="size-4" />
            Знаки
          </Toggle>
          <Toggle
            checked={settings.numbers && settings.language !== 'kk'}
            disabled={settings.language === 'kk'}
            onChange={(v) => update({ numbers: v })}
            title={settings.language === 'kk' ? 'В казахской раскладке цифровой ряд занят буквами' : 'Добавлять числа'}
          >
            <Hash className="size-4" />
            Цифры
          </Toggle>
        </>
      )}
      <Toggle checked={settings.strict} onChange={(v) => update({ strict: v })} title="Курсор не двинется дальше, пока не нажата верная клавиша">
        <Lock className="size-4" />
        Без ошибок
      </Toggle>
    </div>
  )
}
