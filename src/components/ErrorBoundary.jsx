import { Component } from 'react'
import { logoEmblem, EMBLEM_ALT } from '@/assets/brand'

// Production-safe error boundary. React error boundaries must be class
// components — there is no hook equivalent (getDerivedStateFromError /
// componentDidCatch have no useX() form as of this React version).
//
// Catches render-time errors anywhere below it in the tree and replaces
// the crashed subtree with a calm, branded fallback instead of a blank
// white screen. Never renders the actual error message or stack to the
// visitor — that's for the console/observability tooling only, where a
// developer (not a customer mid-checkout) can see it.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Intentionally minimal: the error object/message and component stack,
    // nothing about the visitor (no form values, no booking data, no PII).
    // This is the browser console only — there is no server-side error
    // tracking service wired up yet (see Milestone 7 audit).
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-brand-ivory px-6 py-16 text-center font-brand-ui"
      >
        <img src={logoEmblem} alt={EMBLEM_ALT} width="600" height="600" className="h-16 w-16" />
        <h1 className="font-brand-display text-[22px] text-brand-text">
          Something went <span className="italic text-brand-copper">wrong.</span>
        </h1>
        <p className="max-w-[420px] text-[13px] leading-[1.7] text-brand-text-muted">
          We're sorry — this page ran into a problem. Nothing has been charged, and no booking
          was affected. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-1 bg-brand-black px-8 py-4 text-[12px] tracking-[.1em] text-brand-champagne uppercase transition-opacity hover:opacity-90"
        >
          Reload page
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
