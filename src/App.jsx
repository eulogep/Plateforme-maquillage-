import './App.css'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import SelectedLooks from './components/SelectedLooks'
import ServicesSection from './components/ServicesSection'
import ArtistrySection from './components/ArtistrySection'
import AboutSection from './components/AboutSection'
import PoliciesSection from './components/PoliciesSection'
import FinalCta from './components/FinalCta'
import BookingFlow from './components/booking/BookingFlow'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SelectedLooks />
        <ServicesSection />
        <ArtistrySection />
        <AboutSection />
        <PoliciesSection />
        <FinalCta />
        <BookingFlow />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
