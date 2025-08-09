import { ArrowDown } from 'lucide-react'
import { useEffect } from 'react'
import emmaProfile from '../assets/emma-profile.jpg'

const HeroSection = () => {
  useEffect(() => {
    // Preload critical image
    const img = new Image();
    img.src = emmaProfile;
  }, []);

  return (
    <section id="accueil" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Floating elements for ambiance - optimized with will-change */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-luxury opacity-20 floating" style={{willChange: 'transform'}}></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-sunset opacity-30 floating" style={{animationDelay: '1s', willChange: 'transform'}}></div>
      <div className="absolute bottom-40 left-1/4 w-12 h-12 rounded-full bg-gradient-warm opacity-25 floating" style={{animationDelay: '2s', willChange: 'transform'}}></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 african-pattern opacity-30"></div>
      
      {/* Hero Gradient Background */}
      <div className="absolute inset-0 hero-gradient opacity-60"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left soft-reveal">
            {/* Welcoming message */}
            <div className="mb-8 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 warm-glow">
              <p className="text-lg font-medium text-muted-foreground italic font-heading">
                Bienvenue chez vous. Ici, la beauté épouse votre histoire.
              </p>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-heading">
              Révélez votre{' '}
              <span className="text-gradient">beauté authentique</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed italic font-heading">
              "Révéler la beauté, honorer les racines, inspirer la confiance."
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Des cosmétiques inspirés de l'Afrique, créés aux États-Unis avec passion et authenticité. 
              Une histoire qui commence à Brazzaville et se raconte aujourd'hui en Virginie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button className="cta-emotional btn-breathe" aria-label="Découvrir les produits">
                Je me fais plaisir
              </button>
              <button className="btn-luxury" aria-label="En savoir plus sur Emma">
                Découvrir mon histoire
              </button>
            </div>
            
            {/* Emotional indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-luxury rounded-full"></div>
                <span>Formules naturelles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-sunset rounded-full"></div>
                <span>Héritage africain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-warm rounded-full"></div>
                <span>Créé avec amour</span>
              </div>
            </div>
            
            {/* Quote */}
            <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 texture-overlay warm-glow">
              <blockquote className="text-lg italic text-center lg:text-left mb-3 font-heading">
                "La beauté n'est pas universelle par hasard — elle est le reflet de nos histoires. 
                Et la mienne commence toujours par un sourire et une touche d'Afrique."
              </blockquote>
              <cite className="text-sm text-muted-foreground block text-center lg:text-left font-medium">
                - Emmanuelle Singani
              </cite>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto soft-reveal" style={{animationDelay: '0.3s'}}>
              {/* Decorative elements with warm colors */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-luxury opacity-20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-sunset opacity-20 rounded-full blur-xl"></div>
              
              {/* Main image with optimization */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-border/30 warm-glow">
                <img 
                  src={emmaProfile} 
                  alt="Emmanuelle Singani, fondatrice de la marque de cosmétiques authentiques" 
                  className="w-full h-auto object-cover img-warm"
                  loading="eager"
                  decoding="async"
                  width="400"
                  height="400"
                  style={{aspectRatio: '1 / 1'}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              
              {/* Floating info cards with emotional design */}
              <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-sm p-3 rounded-xl border border-border/50 floating warm-glow" style={{willChange: 'transform'}}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-luxury rounded-full"></div>
                  <span className="text-sm font-medium">Brazzaville → Virginia</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-sm p-3 rounded-xl border border-border/50 floating warm-glow" style={{animationDelay: '1s', willChange: 'transform'}}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-sunset rounded-full"></div>
                  <span className="text-sm font-medium">Cosmétiques authentiques</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Emotional scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Découvrez mon univers</span>
            <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
              <div className="w-1 h-3 bg-current rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

