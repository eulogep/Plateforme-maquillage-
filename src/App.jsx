import { lazy, Suspense } from 'react'
import './App.css'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import SelectedLooks from './components/SelectedLooks'
import ServicesSection from './components/ServicesSection'
import ArtistrySection from './components/ArtistrySection'
import AboutSection from './components/AboutSection'
import PoliciesSection from './components/PoliciesSection'
import FaqSection from './components/FaqSection'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'

// Code-split: the booking flow pulls in react-hook-form, zod and
// react-day-picker on top of its own six step components — real weight
// that a visitor only browsing services/portfolio never needs to
// download. Same component, same props (none), same behavior; only
// *when* its code downloads changes. (PaymentStep is split again, one
// level deeper, inside BookingFlow itself — see its own comment.)
const BookingFlow = lazy(() => import('./components/booking/BookingFlow'))

// Reserves the "#rendez-vous" anchor target and roughly the real
// section's shape while the booking flow's chunk downloads, so a direct
// link to "/#rendez-vous" still scrolls to the right place and the page
// doesn't jump once the real content swaps in.
function BookingFlowFallback() {
  return (
    <section
      id="rendez-vous"
      role="status"
      aria-live="polite"
      className="flex min-h-[520px] flex-col items-center justify-center gap-3 bg-brand-ivory-soft px-6 py-14 font-brand-ui"
    >
      <span className="sr-only">Loading booking form…</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-rule border-t-brand-gold-deep motion-reduce:animate-none" />
    </section>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      {/*
       * Visually hidden until focused, then it jumps above the sticky
       * header — the first Tab stop on the page, so keyboard users can
       * bypass the full nav and land straight in <main>.
       */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-brand-black focus:px-5 focus:py-3 focus:text-[12px] focus:tracking-[.08em] focus:text-brand-champagne focus:uppercase focus:outline-2 focus:outline-brand-champagne"
      >
        Skip to main content
      </a>

      <ErrorBoundary>
        <Header />
        <main id="main-content">
          <HeroSection />
          <SelectedLooks />
          <ServicesSection />
          <ArtistrySection />
          <AboutSection />
          <PoliciesSection />
          <FaqSection />
          <FinalCta />
          <Suspense fallback={<BookingFlowFallback />}>
            <BookingFlow />
          </Suspense>
        </main>
        <Footer />
      </ErrorBoundary>
    </div>
  )
}

export default App
