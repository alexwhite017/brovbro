/* =========================================================================
   Shell — the frame every screen sits inside.

   Broadcast layout: a fixed header strip with the wordmark and the current
   phase, then one dark card holding the screen. No decoration that isn't
   carrying information.
   ========================================================================= */

import type { ReactNode } from 'react'

type ShellProps = {
  /** Metadata line, e.g. "Match 3 · best of 5". */
  eyebrow?: string
  title: string
  children: ReactNode
  /** Rendered in the card's footer bar. */
  footer?: ReactNode
  /** Back control. Omit `onBack` to hide it (the first screen has nowhere
   *  to go). The label is contextual — "Undo last match", "Change game" —
   *  because a generic "Back" would hide what is actually about to happen. */
  backLabel?: string
  onBack?: () => void
}

export function Shell({
  eyebrow,
  title,
  children,
  footer,
  backLabel,
  onBack,
}: ShellProps) {
  return (
    <div className="min-h-dvh px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-5 flex items-center justify-between gap-4">
          {/* Wordmark: the two sides as coloured blocks, which is the same
              language the scoreboard and draft board use. */}
          <div className="flex items-center gap-2.5">
            <span className="flex gap-1" aria-hidden>
              <span className="bg-team-a block h-5 w-2.5 rounded-sm" />
              <span className="bg-team-b block h-5 w-2.5 rounded-sm" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Bro Vs Bro
            </span>
          </div>
          {eyebrow && <p className="label">{eyebrow}</p>}
        </header>

        <main className="panel animate-rise px-5 py-7 sm:px-9 sm:py-10">
          {onBack && (
            <button
              onClick={onBack}
              className="text-muted hover:text-fg mb-3 flex items-center gap-1.5 text-sm transition-colors"
            >
              {/* Decorative: the label already says where this goes. */}
              <span aria-hidden>←</span>
              {backLabel}
            </button>
          )}
          <h2 className="mb-8 text-3xl sm:text-4xl">{title}</h2>

          <div className="animate-rise" style={{ animationDelay: '90ms' }}>
            {children}
          </div>

          {footer && (
            <>
              <hr className="rule mt-10" />
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="label">Best of 5 · loser picks next</p>
                <div className="flex gap-2">{footer}</div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
