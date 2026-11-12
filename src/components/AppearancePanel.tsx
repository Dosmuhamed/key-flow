import { Check, Monitor, Moon, RotateCcw, Sun, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_BY_ID, type LanguageId } from '../data/languages'
import { LAYOUTS } from '../data/layouts'
import {
  ACCENTS,
  COLORWAYS,
  DEFAULT_APPEARANCE,
  FONTS,
  colorwaySwatch,
  preloadFonts,
  type AccentId,
  type Appearance,
  type CaretStyle,
  type Colorway,
  type KeyStyle,
  type RadiusId,
  type ThemeMode,
  type TypeFont,
  type TypeSize,
} from '../lib/appearance'
import { Keyboard } from './Keyboard'
import { TextView } from './TextView'
import { IconButton, Segmented } from './ui'

interface Props {
  appearance: Appearance
  dark: boolean
  onChange: (patch: Partial<Appearance>) => void
  showKeyboard: boolean
  onShowKeyboard: (v: boolean) => void
  language: LanguageId
  onClose: () => void
}

const SAMPLE: Record<LanguageId, string> = {
  ru: 'Съешь же ещё этих мягких французских булок',
  en: 'The quick brown fox jumps over the lazy dog',
  kk: 'Қазақ тілі әліпбиінде қырық екі әріп бар',
  de: 'Zwölf Boxkämpfer jagen Viktor quer über den Sylter Deich',
  es: 'El veloz murciélago hindú comía feliz cardillo y kiwi',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-6 py-5 first:border-t-0">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </div>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 text-left text-sm text-ink"
    >
      {label}
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}>
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  )
}

export function AppearancePanel({ appearance: a, dark, onChange, showKeyboard, onShowKeyboard, language, onClose }: Props) {
  const { t } = useTranslation()
  const layout = LAYOUTS[LANGUAGE_BY_ID[language].layoutId]
  const sample = SAMPLE[language]

  useEffect(() => {
    preloadFonts()
  }, [])

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="absolute inset-0 bg-ink/15" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('appearance.title')}
        className="panel-in absolute inset-y-0 right-0 flex w-[400px] max-w-[92vw] flex-col bg-surface shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{t('appearance.title')}</h2>
            <p className="text-xs text-muted">{t('appearance.preview')}</p>
          </div>
          <IconButton title={t('app.close')} onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Section title={t('appearance.site')}>
            <Field label={t('appearance.themeMode')}>
              <Segmented<ThemeMode>
                label={t('appearance.themeMode')}
                value={a.mode}
                onChange={(mode) => onChange({ mode })}
                options={[
                  { value: 'light', label: <><Sun className="size-4" />{t('appearance.light')}</> },
                  { value: 'dark', label: <><Moon className="size-4" />{t('appearance.dark')}</> },
                  { value: 'system', label: <><Monitor className="size-4" />{t('appearance.system')}</> },
                ]}
              />
            </Field>
            <Field label={t('appearance.accent')}>
              <div className="flex flex-wrap gap-2.5">
                {(Object.keys(ACCENTS) as AccentId[]).map((id) => {
                  const tone = ACCENTS[id][dark ? 'dark' : 'light']
                  const active = a.accent === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChange({ accent: id })}
                      title={t(`accents.${id}`)}
                      aria-label={t(`accents.${id}`)}
                      aria-pressed={active}
                      className={`grid size-9 place-items-center rounded-full transition-transform hover:scale-105 ${active ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`}
                      style={{ background: tone.accent, color: tone.ink }}
                    >
                      {active && <Check className="size-4" />}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label={t('appearance.radius')}>
              <Segmented<RadiusId>
                label={t('appearance.radius')}
                value={a.radius}
                onChange={(radius) => onChange({ radius })}
                options={[
                  { value: 'sharp', label: t('appearance.radiusSharp') },
                  { value: 'normal', label: t('appearance.radiusNormal') },
                  { value: 'round', label: t('appearance.radiusRound') },
                ]}
              />
            </Field>
          </Section>

          <Section title={t('appearance.text')}>
            <div className="rounded-xl bg-page px-4 pt-2">
              <TextView target={sample} typed={sample.slice(0, 12)} lines={2} idle />
            </div>
            <Field label={t('appearance.font')}>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FONTS) as TypeFont[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChange({ font: id })}
                    aria-pressed={a.font === id}
                    className={`rounded-xl px-3 py-2 text-left transition-colors ${
                      a.font === id ? 'bg-accent-soft text-accent ring-1 ring-accent' : 'bg-sunken text-ink hover:bg-line'
                    }`}
                  >
                    <span className="block text-base" style={{ fontFamily: FONTS[id].family }}>
                      Aa Яя 123
                    </span>
                    <span className="block text-[11px] text-muted">{FONTS[id].name}</span>
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex flex-wrap gap-4">
              <Field label={t('appearance.fontSize')}>
                <Segmented<TypeSize>
                  label={t('appearance.fontSize')}
                  value={a.size}
                  onChange={(size) => onChange({ size })}
                  options={[
                    { value: 's', label: t('appearance.sizeS') },
                    { value: 'm', label: t('appearance.sizeM') },
                    { value: 'l', label: t('appearance.sizeL') },
                  ]}
                />
              </Field>
              <Field label={t('appearance.caret')}>
                <Segmented<CaretStyle>
                  label={t('appearance.caret')}
                  value={a.caret}
                  onChange={(caret) => onChange({ caret })}
                  options={[
                    { value: 'line', label: t('appearance.caretLine') },
                    { value: 'block', label: t('appearance.caretBlock') },
                    { value: 'underline', label: '_', title: t('appearance.caretUnderline') },
                  ]}
                />
              </Field>
            </div>
            <Switch checked={a.smoothCaret} onChange={(smoothCaret) => onChange({ smoothCaret })} label={t('appearance.smoothCaret')} />
          </Section>

          <Section title={t('appearance.keyboard')}>
            <Switch checked={showKeyboard} onChange={onShowKeyboard} label={t('appearance.showKeyboard')} />
            <div className="rounded-xl bg-page p-3">
              <Keyboard layout={layout} nextChar={layout.chars.KeyF?.[0]} />
            </div>
            <Field label={t('appearance.keyStyle')}>
              <Segmented<KeyStyle>
                label={t('appearance.keyStyle')}
                value={a.keyStyle}
                onChange={(keyStyle) => onChange({ keyStyle })}
                options={[
                  { value: 'sculpted', label: t('appearance.styleSculpted') },
                  { value: 'flat', label: t('appearance.styleFlat') },
                  { value: 'outline', label: t('appearance.styleOutline') },
                ]}
              />
            </Field>
            <Field label={t('appearance.colorway')}>
              {a.keyStyle === 'outline' && <p className="-mt-1 text-xs text-muted">{t('appearance.colorwayOutline')}</p>}
              <div className={`grid grid-cols-4 gap-2 ${a.keyStyle === 'outline' ? 'pointer-events-none opacity-40' : ''}`}>
                {(['auto', ...Object.keys(COLORWAYS)] as Colorway[]).map((id) => {
                  const [caseColor, alpha, mod] = colorwaySwatch(id)
                  const active = a.colorway === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChange({ colorway: id })}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors ${active ? 'bg-accent-soft ring-1 ring-accent' : 'hover:bg-sunken'}`}
                    >
                      <span className="flex h-7 w-full items-center justify-center gap-1 rounded-md" style={{ background: caseColor }}>
                        <span className="size-3.5 rounded-[3px]" style={{ background: alpha }} />
                        <span className="size-3.5 rounded-[3px]" style={{ background: alpha }} />
                        <span className="size-3.5 rounded-[3px]" style={{ background: mod }} />
                      </span>
                      <span className={`text-[11px] ${active ? 'text-accent' : 'text-muted'}`}>{t(`colorways.${id}`)}</span>
                    </button>
                  )
                })}
              </div>
            </Field>
            <Switch checked={a.highlightNext} onChange={(highlightNext) => onChange({ highlightNext })} label={t('appearance.highlightNext')} />
            <Switch checked={a.fingerZones} onChange={(fingerZones) => onChange({ fingerZones })} label={t('appearance.fingerZones')} />
          </Section>
        </div>

        <footer className="border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onChange(DEFAULT_APPEARANCE)
              onShowKeyboard(true)
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <RotateCcw className="size-4" />
            {t('appearance.reset')}
          </button>
        </footer>
      </aside>
    </div>
  )
}
