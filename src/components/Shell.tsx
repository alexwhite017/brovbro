/* =========================================================================
   Shell — the poster frame every screen sits inside.

   This file is your DESIGN REFERENCE: it shows the Tailwind patterns the
   rest of the app should follow. Things to notice:
     - color/font utilities come from the @theme tokens (bg-paper, font-display)
     - `.poster`, `.grain`, `.label`, `.rule` are the shared CSS classes
     - layout/spacing stays inline as utilities (one-offs don't earn a class)
     - the entrance stagger is animation-delay, nothing more
   ========================================================================= */

import type { ReactNode } from 'react'

type ShellProps = {
  /** Small line above the title, e.g. "MATCH 3 OF 5". */
  eyebrow?: string
  title: string
  children: ReactNode
  /** Rendered bottom-right of the frame (reset, edit games...). */
  footer?: ReactNode
}

export function Shell({ eyebrow, title, children, footer }: ShellProps) {
  return (
    <div className="min-h-dvh bg-ink px-4 py-6 sm:px-8 sm:py-12">
      {/* Marquee: endless boxing-promo ticker. The string is duplicated and
          the track slides exactly -50%, which makes the loop seamless. */}
      <div className="mb-6 overflow-hidden border-y-2 border-paper/25 py-1.5">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }, (_, i) => (
            <span key={i} className="label flex gap-10 !text-paper/55">
              {Array.from({ length: 6 }, (_, j) => (
                <span key={j}>
                  Best of five · Loser picks next · No excuses · Bragging rights
                  only
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <main className="poster grain animate-rise mx-auto w-full max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
        <header className="mb-8">
          {eyebrow && (
            <p className="label animate-rise mb-3" style={{ animationDelay: '80ms' }}>
              {eyebrow}
            </p>
          )}

          {/* The wordmark. Oversized, negative tracking, a blood-red VS
              dropped between two ink words — the one thing you remember. */}
          <h1
            className="animate-rise flex flex-wrap items-baseline gap-x-3 text-5xl sm:text-7xl"
            style={{ animationDelay: '140ms' }}
          >
            <span>Bro</span>
            <span className="relative text-blood">
              vs
              {/* Decorative slash behind the VS; aria-hidden since it carries
                  no meaning for a screen reader. */}
              <span
                aria-hidden
                className="slash absolute -inset-x-2 inset-y-0 -z-10 -skew-x-12 opacity-30"
              />
            </span>
            <span>Bro</span>
          </h1>

          <hr className="rule mt-6" />
          <h2
            className="animate-rise mt-5 text-2xl sm:text-3xl"
            style={{ animationDelay: '200ms' }}
          >
            {title}
          </h2>
        </header>

        <div className="animate-rise" style={{ animationDelay: '260ms' }}>
          {children}
        </div>

        {footer && (
          <>
            <hr className="rule mt-10" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="label">Bro Vs Bro · house rules apply</p>
              <div className="flex gap-2">{footer}</div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
