import type { ReactNode } from 'react'

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: ReactNode; title?: string; disabled?: boolean }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-sunken p-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              active ? 'bg-surface text-ink shadow-[0_1px_0_var(--kf-cap-edge)]' : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  children,
  title,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  title?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-accent-soft text-accent' : 'bg-sunken text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function IconButton({
  onClick,
  title,
  children,
  className = '',
}: {
  onClick: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-sunken hover:text-ink ${className}`}
    >
      {children}
    </button>
  )
}

export function Panel({ title, aside, children, className = '' }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-surface p-5 sm:p-6 ${className}`}>
      {(title || aside) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="keycap inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-sans text-xs font-medium text-ink">
      {children}
    </kbd>
  )
}
