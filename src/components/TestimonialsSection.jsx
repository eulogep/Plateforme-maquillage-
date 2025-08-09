import { Star, Quote } from 'lucide-react'

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      location: "New York, USA",
      rating: 5,
      text: "La palette Sunset Africain est absolument magnifique ! Les couleurs sont si riches et pigmentées. J'adore comment Emma a capturé l'essence de l'Afrique dans ses produits.",
      product: "Palette Sunset Africain",
      verified: true,
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      name: "Aminata K.",
      location: "Paris, France",
      rating: 5,
      text: "Enfin une marque qui comprend vraiment les peaux noires ! Le fond de teint universel est parfait pour ma carnation. Merci Emma pour cette authenticité.",
      product: "Fond de Teint Universel",
      verified: true,
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      name: "Jessica L.",
      location: "London, UK",
      rating: 5,
      text: "Le rouge à lèvres Brazzaville est devenu mon indispensable ! La tenue est exceptionnelle et la couleur sublime. Une vraie révélation beauté.",
      product: "Rouge à Lèvres Brazzaville",
      verified: true,
      image: "/api/placeholder/60/60"
    },
    {
      id: 4,
      name: "Marie-Claire D.",
      location: "Montréal, Canada",
      rating: 5,
      text: "J'ai découvert Emma sur Instagram et je ne regrette pas mon achat ! Ses produits sont de qualité professionnelle avec une âme authentique.",
      product: "Collection complète",
      verified: true,
      image: "/api/placeholder/60/60"
    }
  ]

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ce que disent nos <span className="text-gradient">Clientes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages authentiques de femmes qui ont adopté notre vision de la beauté
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-card p-6 rounded-xl border border-border card-hover">
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-primary/30" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 text-yellow-400" 
                    fill={i < testimonial.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                "{testimonial.text}"
              </p>

              {/* Product */}
              <div className="mb-4">
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {testimonial.product}
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{testimonial.name}</span>
                    {testimonial.verified && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{testimonial.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <p className="text-muted-foreground">Note moyenne</p>
            <p className="text-sm text-muted-foreground">Basée sur 500+ avis</p>
          </div>

          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">98%</div>
            <p className="text-muted-foreground">Clientes satisfaites</p>
            <p className="text-sm text-muted-foreground">Recommandent nos produits</p>
          </div>

          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">15K+</div>
            <p className="text-muted-foreground">Femmes conquises</p>
            <p className="text-sm text-muted-foreground">Dans le monde entier</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

