import { Heart, Instagram, Facebook, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
              <span className="text-xl font-bold text-gradient">Emmanuelle Singani</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Des cosmétiques authentiques qui célèbrent la beauté africaine avec une touche moderne. 
              De Brazzaville à la Virginie, une histoire de passion et de résilience.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/emma_sing84" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/emma_sing2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=100008196917547" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="mailto:emmanuellesingani23@gmail.com"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#accueil" className="text-muted-foreground hover:text-primary transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#histoire" className="text-muted-foreground hover:text-primary transition-colors">
                  Mon Histoire
                </a>
              </li>
              <li>
                <a href="#collection" className="text-muted-foreground hover:text-primary transition-colors">
                  Ma Collection
                </a>
              </li>
              <li>
                <a href="#galerie" className="text-muted-foreground hover:text-primary transition-colors">
                  Galerie
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Stafford, Virginie</li>
              <li>États-Unis</li>
              <li>emmanuellesingani23@gmail.com</li>
            </ul>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm italic text-center">
                "La beauté n'est pas universelle par hasard — elle est le reflet de nos histoires."
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Emmanuelle Singani. Tous droits réservés.
          </p>
          <p className="text-muted-foreground text-sm flex items-center mt-4 md:mt-0">
            Fait avec <Heart className="w-4 h-4 text-red-500 mx-1" /> pour célébrer la beauté authentique
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

