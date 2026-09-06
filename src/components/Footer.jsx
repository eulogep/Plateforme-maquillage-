import { Instagram, Facebook, Mail } from 'lucide-react'

// Content below follows the approved Claude Design homepage footer exactly
// where it specifies real values (navigation labels, service names, address,
// email, copyright line). Where the design itself marks a value pending
// confirmation (phone number) or doesn't specify one (policy page links have
// no route yet), that is shown as an explicit placeholder rather than
// invented. See design-reference/ for the source file.
const NAV_LINKS = ['Home', 'Services', 'Portfolio', 'About', 'Policies', 'Contact']
const SERVICE_LINKS = [
  'Natural Glam',
  'Soft Glam',
  'Full Glam',
  'Bridal Makeup',
  'Special Event',
  'Makeup Lessons',
]

const Footer = () => {
  return (
    <footer className="bg-brand-ink font-brand-ui text-brand-cream">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 lg:px-14">
        <div className="grid gap-8 border-b border-[#F7F1E9]/10 pb-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="font-brand-display text-lg italic text-brand-cream">
              Emmanuelle Singani
            </span>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 text-[12px] text-[#C9BFB4]">
            <span className="mb-1 text-[10px] tracking-[.1em] text-[#8A7A6C] uppercase">
              Navigation
            </span>
            {NAV_LINKS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {/* Services */}
          <div className="flex flex-col gap-2 text-[12px] text-[#C9BFB4]">
            <span className="mb-1 text-[10px] tracking-[.1em] text-[#8A7A6C] uppercase">
              Services
            </span>
            {SERVICE_LINKS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2 text-[12px] text-[#C9BFB4]">
            <span className="mb-1 text-[10px] tracking-[.1em] text-[#8A7A6C] uppercase">
              Contact
            </span>
            <span>60 Susa Dr, Suite 121, Stafford, VA 22554</span>
            <a
              href="mailto:emmanuellesingani23@gmail.com"
              className="text-[#C9BFB4] no-underline hover:text-brand-cream"
            >
              emmanuellesingani23@gmail.com
            </a>
            <span className="italic text-[#8A7A6C]">Phone — to be confirmed</span>
            <div className="mt-1 flex gap-3">
              <a
                href="https://www.instagram.com/emma_sing84"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#C9BFB4] hover:text-brand-cream"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100008196917547"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#C9BFB4] hover:text-brand-cream"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:emmanuellesingani23@gmail.com"
                aria-label="Email"
                className="text-[#C9BFB4] hover:text-brand-cream"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Portfolio photo grid — deferred: the design specifies four real
              portfolio photos here. Importing production photography belongs
              with the portfolio/gallery milestone (with proper resizing),
              not this tokens/header/footer pass, so this slot is left out
              rather than filled with unoptimized placeholder images. */}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-5 text-[10.5px] text-[#8A7A6C] md:flex-row">
          <span>© 2026 Emmanuelle Singani Beauty. All rights reserved.</span>
          <div className="flex gap-5">
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
