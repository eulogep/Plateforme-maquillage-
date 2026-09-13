import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

// See CustomCursor.jsx for why these are destructured rather than used as
// `<motion.div>` / `<motion.figure>` member expressions directly.
const MotionDiv = motion.div
const MotionFigure = motion.figure

// Shared "open full-size on click" behavior for any image grid (portfolio,
// services, …). One call per section: `useLightbox()` gives you `open`
// (wire it to each tile's onClick, passing the tile's data and the click
// event) and `item`/`close` to hand straight to <Lightbox>.
//
// Escape closes it, and closing (by any means) returns focus to whichever
// tile opened it — the event's `currentTarget` is captured at open time
// rather than tracked by index, so callers don't need to manage their own
// ref arrays.
export function useLightbox() {
  const [item, setItem] = useState(null)
  const triggerRef = useRef(null)

  const open = useCallback((value, event) => {
    triggerRef.current = event?.currentTarget ?? null
    setItem(value)
  }, [])
  const close = useCallback(() => setItem(null), [])

  useEffect(() => {
    if (!item) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Captured now, not read off the ref inside the cleanup — by the time
    // cleanup runs, `item` may already refer to a different tile.
    const trigger = triggerRef.current
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      trigger?.focus()
    }
  }, [item, close])

  return { item, open, close }
}

// `item` is `{ src, alt, label }` or null — render once per section,
// alongside whatever grid feeds it via `useLightbox()`.
export function Lightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      {item ? (
        <MotionDiv
          role="dialog"
          aria-modal="true"
          aria-label={`${item.label} — full size`}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-black/92 px-6 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <MotionFigure
            className="relative m-0 max-h-full max-w-3xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={item.src} alt={item.alt} className="max-h-[80vh] w-auto max-w-full object-contain" />
            <figcaption className="pt-3 text-center text-[11px] tracking-[.14em] text-brand-on-dark-muted uppercase">
              {item.label}
            </figcaption>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full border border-brand-on-dark/70 bg-brand-black text-brand-on-dark transition-colors hover:border-brand-champagne hover:text-brand-champagne"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </MotionFigure>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  )
}
