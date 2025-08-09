import './App.css'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ProductsSection from './components/ProductsSection'
import TestimonialsSection from './components/TestimonialsSection'
import GallerySection from './components/GallerySection'
import BookingSection from './components/BookingSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductsSection />
        <TestimonialsSection />
        <GallerySection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
