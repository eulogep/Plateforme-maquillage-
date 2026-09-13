import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

// Destructured so JSX below reads as plain component usage (`<MotionDiv>`)
// rather than a member expression (`<motion.div>`) — this repo's eslint
// config has no JSX/react plugin, so `no-unused-vars` can't see `motion`
// itself as "used" through a member expression.
const MotionDiv = motion.div

// Elements that should visibly "wake up" the cursor (a plain size/opacity
// bump) even when they don't opt into a text label.
const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, summary'

// A restrained, brand-toned replacement for the system pointer: a small gold
// dot that tracks the mouse exactly, trailed by a ring that eases into place.
// Hovering anything interactive grows the ring; an element carrying
// `data-cursor-label="…"` (see the portfolio grid) swaps the ring for a
// filled pill with that word inside it instead.
//
// Only ever mounts for visitors who both have a precise pointer (so it never
// touches touch/tablet visitors) and haven't asked for reduced motion — and
// even then, the system cursor is never actually removed from the page
// unless this effect successfully attaches, so a script error never leaves
// anyone without a visible pointer.
const CustomCursor = () => {
  const prefersReducedMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState(null)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.4 })
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.4 })

  useEffect(() => {
    if (prefersReducedMotion) return
    if (!window.matchMedia?.('(pointer: fine)').matches) return

    setEnabled(true)
    document.documentElement.classList.add('custom-cursor-active')

    const handleMove = (event) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    const handleOver = (event) => {
      const labelTarget = event.target.closest?.('[data-cursor-label]')
      if (labelTarget) {
        setLabel(labelTarget.dataset.cursorLabel)
        setHovering(true)
        return
      }
      setLabel(null)
      setHovering(!!event.target.closest?.(HOVER_SELECTOR))
    }
    // Only clear on a real exit to document (relatedTarget null), so moving
    // between two nested hoverable elements doesn't flicker the cursor off.
    const handleOut = (event) => {
      if (!event.relatedTarget) {
        setHovering(false)
        setLabel(null)
      }
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [prefersReducedMotion, x, y])

  if (!enabled) return null

  return (
    <>
      <MotionDiv
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 rounded-full bg-brand-champagne"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: label ? 0 : 1, scale: hovering && !label ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <MotionDiv
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center whitespace-nowrap rounded-full border border-brand-gold text-[10px] tracking-[.14em] text-brand-champagne uppercase"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: label ? 68 : hovering ? 52 : 30,
          height: label ? 68 : hovering ? 52 : 30,
          backgroundColor: label
            ? 'rgba(11,11,10,0.92)'
            : hovering
              ? 'rgba(194,144,80,0.14)'
              : 'rgba(194,144,80,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        {label}
      </MotionDiv>
    </>
  )
}

export default CustomCursor
