import { Instagram, Facebook, Mail, MessageCircle } from 'lucide-react'
import { logoLockupOnDark, LOCKUP_ALT } from '@/assets/brand'
import { addOnServices, business, formatBusinessPhone, services } from '@/config/business'

// Content below follows the approved Claude Design homepage footer exactly
// where it specifies real values (navigation labels, service names, address,
// email, copyright line). Where the design itself marks a value pending
// confirmation (phone number) or doesn't specify one (policy page links have
// no route yet), that is shown as an explicit placeholder rather than
// invented. See design-reference/ for the source file.
const NAV_LINKS = [
  { label: 'Home', href: '#accueil' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'About', href: '#histoire' },
  { label: 'Policies', href: '#policies' },
  { label: 'Contact', href: '#contact' },
]
const SERVICE_LINKS = [...services, ...addOnServices].map((service) => service.name)

const Footer = () => {
  return (
    <footer className="bg-brand-black font-brand-ui text-brand-on-dark">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 lg:px-14">
        <div className="grid gap-10 border-b border-brand-rule-dark pb-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand — the full official lockup */}
          <div className="lg:col-span-1">
            <img
              src={logoLockupOnDark}
              alt={LOCKUP_ALT}
              width="2172"
              height="724"
              className="h-auto w-[190px] max-w-full"
            />
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="flex flex-col gap-2 text-[12px] text-brand-on-dark-muted">
            <span className="mb-1 text-[10px] tracking-[.14em] text-brand-champagne uppercase">
              Navigation
            </span>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="w-fit text-brand-on-dark-muted hover:text-brand-champagne">
                {label}
              </a>
            ))}
          </nav>

          {/* Services */}
          <div className="flex flex-col gap-2 text-[12px] text-brand-on-dark-muted">
            <span className="mb-1 text-[10px] tracking-[.14em] text-brand-champagne uppercase">
              Services
            </span>
            {SERVICE_LINKS.map((label) => (
              <a key={label} href="#services" className="w-fit text-brand-on-dark-muted hover:text-brand-champagne">
                {label}
              </a>
            ))}
          </div>

          {/* Contact — target of the header's #contact nav link now that
              the standalone ContactSection is gone. */}
          <div id="contact" className="flex flex-col gap-2 text-[12px] text-brand-on-dark-muted">
            <span className="mb-1 text-[10px] tracking-[.14em] text-brand-champagne uppercase">
              Contact
            </span>
            <span>{business.location.full}</span>
            <a
              href={`mailto:${business.contact.email}`}
              className="link-underline text-brand-on-dark-muted hover:text-brand-champagne"
            >
              {business.contact.email}
            </a>
            <a
              href={`mailto:${business.contact.bridalEmail}`}
              className="link-underline text-brand-on-dark-muted hover:text-brand-champagne"
            >
              Bridal: {business.contact.bridalEmail}
            </a>
            {(business.contact.phones ?? [business.contact.phone]).filter(Boolean).map((phone) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className="link-underline text-brand-on-dark-muted hover:text-brand-champagne"
              >
                {formatBusinessPhone(phone)}
              </a>
            ))}
            <span>{business.contact.responseTime}</span>
            <div className="mt-2 flex gap-4">
              <a
                href={business.social.instagram[0]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-brand-on-dark-muted transition-colors hover:text-brand-champagne"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={business.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-brand-on-dark-muted transition-colors hover:text-brand-champagne"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={business.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-brand-on-dark-muted transition-colors hover:text-brand-champagne"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${business.contact.email}`}
                aria-label="Email"
                className="text-brand-on-dark-muted transition-colors hover:text-brand-champagne"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Portfolio photo grid — deferred: the design specifies four real
              portfolio photos here. Importing production photography belongs
              with the portfolio/gallery milestone (with proper resizing),
              not this brand pass, so this slot is left out rather than
              filled with unoptimized placeholder images. */}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-[10.5px] text-brand-taupe md:flex-row">
          {/* The lockup above already carries the mark; a second, 24px
              emblem here just read as an illegible smudge in QA. */}
          <span>© 2026 {business.name}. All rights reserved.</span>
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
