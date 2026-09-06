import { useState } from 'react'
import { Menu, X } from 'lucide-react'

// Navigation per the approved Claude Design homepage. "Services", "Portfolio"
// and "Policies" don't have a built section yet (Milestone 2) — their hrefs
// point at ids that will exist once those sections are rebuilt, so the links
// are inert (no scroll) rather than pointing at a mismatched old section.
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
    <header className="sticky top-0 z-50 bg-brand-ink font-brand-ui">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-14">
        <a
          href="#accueil"
          className="font-brand-display text-lg italic tracking-wide text-brand-cream no-underline"
        >
          Emmanuelle Singani
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 text-[11.5px] tracking-[.06em] text-[#E8E1D8] uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="pb-1 no-underline transition-colors hover:text-brand-cream"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#rendez-vous"
            className="whitespace-nowrap bg-brand-cream px-6 py-3 text-[11px] tracking-[.06em] text-brand-ink no-underline uppercase transition-opacity hover:opacity-90"
          >
            Book Now
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          className="p-2 text-brand-cream md:hidden"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav className="border-t border-[#F7F1E9]/10 px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-4 pt-4 text-[13px] tracking-[.04em] text-[#E8E1D8] uppercase">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="no-underline transition-colors hover:text-brand-cream"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#rendez-vous"
              onClick={closeMenu}
              className="mt-2 bg-brand-cream px-6 py-3 text-center text-[11.5px] text-brand-ink no-underline uppercase"
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
