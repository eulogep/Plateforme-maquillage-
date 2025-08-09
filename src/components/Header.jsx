import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
            <span className="text-xl font-bold text-gradient">Emmanuelle Singani</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-foreground hover:text-primary transition-colors">
              Accueil
            </a>
            <a href="#histoire" className="text-foreground hover:text-primary transition-colors">
              Mon Histoire
            </a>
            <a href="#collection" className="text-foreground hover:text-primary transition-colors">
              Ma Collection
            </a>
            <a href="#galerie" className="text-foreground hover:text-primary transition-colors">
              Galerie
            </a>
            <a href="#rendez-vous" className="text-foreground hover:text-primary transition-colors">
              Rendez-vous
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Découvrir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="#accueil" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Accueil
              </a>
              <a 
                href="#histoire" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Mon Histoire
              </a>
              <a 
                href="#collection" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Ma Collection
              </a>
              <a 
                href="#galerie" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Galerie
              </a>
              <a 
                href="#rendez-vous" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Rendez-vous
              </a>
              <a 
                href="#contact" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Contact
              </a>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                Découvrir
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header

