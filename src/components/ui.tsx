import { useState, type ReactNode } from 'react'

export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md bg-ink-900 text-ink-50 ${className}`}>
      {/* The V doubles as a checkmark: short left arm, long rising right arm. */}
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-[70%] w-[70%]">
        <path
          d="M7 14.5 14.5 25 25.5 7"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** Initials badge for a person. */
const EU_EEA = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO'])
export const isEuEea = (code?: string) => Boolean(code && EU_EEA.has(code.toUpperCase()))

/**
 * Inline EU flag. Windows renders flag emoji as plain letters, so the badge
 * needs a real SVG.
 */
export function EuFlag({ className = 'h-3 w-4' }: { className?: string }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2
    return { x: 15 + 8 * Math.cos(a), y: 10 + 8 * Math.sin(a) }
  })
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
      <rect width="30" height="20" fill="#003399" rx="2" />
      {stars.map((s, i) => (
        <path
          key={i}
          transform={`translate(${s.x} ${s.y})`}
          d="M0-1.6 0.47-0.49 1.52-0.49 0.66 0.19 0.94 1.29 0-0.37 -0.94 1.29 -0.66 0.19 -1.52-0.49 -0.47-0.49Z"
          fill="#FFCC00"
        />
      ))}
    </svg>
  )
}

export function Tip({
  text,
  children,
  className = '',
  underline = false,
}: {
  text?: string
  children: ReactNode
  className?: string
  /** Dotted underline as a "there's an explanation here" affordance. */
  underline?: boolean
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  if (!text) return <>{children}</>
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setPos({ top: r.top - 8, left: Math.max(130, r.left + r.width / 2) })
  }
  return (
    <span
      className={`${underline ? 'cursor-help underline decoration-ink-300 decoration-dotted underline-offset-4' : ''} ${className}`}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setPos(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={() => setPos(null)}
    >
      {children}
      {pos && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[70] w-max max-w-64 -translate-x-1/2 -translate-y-full rounded-lg bg-inverse px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-xl"
          style={{ top: pos.top, left: pos.left }}
        >
          {text}
        </span>
      )}
    </span>
  )
}

