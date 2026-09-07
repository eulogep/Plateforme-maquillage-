import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { logoLockupOnDark, logoEmblem, LOCKUP_ALT, EMBLEM_ALT } from '@/assets/brand'

// Navigation per the approved Claude Design homepage.
const NAV_LINKS = [
  { label: 'Home', href: '#accueil' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'About', href: '#histoire' },
  { label: 'Policies', href: '#policies' },
  { label: 'Contact', href: '#contact' },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((open) => !open)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-brand-black font-brand-ui">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-14 lg:py-5">
        {/*
         * Desktop carries the full lockup; below md its script wordmark
         * would be too small to read, so the circular emblem takes over.
         * Both are the official artwork — the mark is never re-typeset as
         * live text.
         */}
        <a href="#accueil" className="flex shrink-0 items-center no-underline" onClick={closeMenu}>
          <img
            src={logoLockupOnDark}
            alt={LOCKUP_ALT}
            width="2172"
            height="724"
            className="hidden h-[52px] w-auto md:block lg:h-[60px]"
          />
          <img
            src={logoEmblem}
            alt={EMBLEM_ALT}
            width="600"
            height="600"
            className="h-11 w-11 md:hidden"
          />
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 text-[11.5px] tracking-[.06em] text-brand-on-dark-muted uppercase lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="link-underline pb-1 transition-colors hover:text-brand-champagne"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#rendez-vous"
            className="whitespace-nowrap border border-brand-champagne px-6 py-3 text-[11px] tracking-[.1em] text-brand-champagne no-underline uppercase transition-colors hover:bg-brand-champagne hover:text-brand-black"
          >
            Book Now
          </a>
        </nav>

        {/* Tablet/mobile: Book Now stays reachable without opening the menu. */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#rendez-vous"
            onClick={closeMenu}
            className="border border-brand-champagne px-4 py-2.5 text-[10.5px] tracking-[.08em] text-brand-champagne no-underline uppercase"
          >
            Book
          </a>
          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            className="-mr-2 p-3 text-brand-on-dark"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav id="mobile-nav" className="border-t border-brand-rule-dark px-5 pb-6 lg:hidden">
          <div className="flex flex-col text-[13px] tracking-[.04em] text-brand-on-dark-muted uppercase">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-brand-rule-dark py-3.5 no-underline transition-colors hover:text-brand-champagne"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#rendez-vous"
              onClick={closeMenu}
              className="mt-5 bg-brand-champagne px-6 py-4 text-center text-[11.5px] tracking-[.08em] text-brand-black no-underline uppercase"
            >
              Book Now
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
