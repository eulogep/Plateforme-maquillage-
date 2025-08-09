import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Instagram, Facebook } from 'lucide-react'

const GallerySection = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const galleryItems = [
    {
      id: 1,
      type: 'look',
      category: 'evening',
      title: 'Look Soirée Élégante',
      description: 'Maquillage sophistiqué pour une soirée spéciale',
      image: '/api/placeholder/400/500'
    },
    {
      id: 2,
      type: 'tutorial',
      category: 'day',
      title: 'Tutoriel Maquillage Jour',
      description: 'Un look naturel pour tous les jours',
      image: '/api/placeholder/400/500'
    },
    {
      id: 3,
      type: 'look',
      category: 'artistic',
      title: 'Art Africain Moderne',
      description: 'Création artistique inspirée des motifs traditionnels',
      image: '/api/placeholder/400/500'
    },
    {
      id: 4,
      type: 'before-after',
      category: 'transformation',
      title: 'Transformation Complète',
      description: 'Avant/après avec nos produits signature',
      image: '/api/placeholder/400/500'
    },
    {
      id: 5,
      type: 'look',
      category: 'evening',
      title: 'Glamour Doré',
      description: 'Éclat doré pour une occasion spéciale',
      image: '/api/placeholder/400/500'
    },
    {
      id: 6,
      type: 'tutorial',
      category: 'artistic',
      title: 'Technique Contouring',
      description: 'Maîtriser l\'art du contouring',
      image: '/api/placeholder/400/500'
    }
  ]

  const filters = [
    { id: 'all', label: 'Tout voir' },
    { id: 'look', label: 'Looks' },
    { id: 'tutorial', label: 'Tutoriels' },
    { id: 'before-after', label: 'Avant/Après' }
  ]

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.type === activeFilter)

  return (
    <section id="galerie" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ma <span className="text-gradient">Galerie</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez mes créations, tutoriels et transformations qui célèbrent la beauté sous toutes ses formes
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className={`${
                activeFilter === filter.id 
                  ? "bg-primary text-primary-foreground" 
                  : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredItems.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-card border border-border card-hover">
                {/* Image placeholder with gradient */}
                <div className="aspect-[4/5] bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 relative">
                  {/* Play button for tutorials */}
                  {item.type === 'tutorial' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-white/80 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Media Section */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            Suivez-moi sur les <span className="text-gradient">Réseaux</span>
          </h3>
          
          <div className="flex justify-center gap-6 mb-8">
            <a 
              href="https://www.instagram.com/emma_sing84" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border hover:border-primary transition-colors card-hover"
            >
              <Instagram className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <div className="font-semibold">@emma_sing84</div>
                <div className="text-sm text-muted-foreground">476 abonnés</div>
              </div>
            </a>
            
            <a 
              href="https://www.instagram.com/emma_sing2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border hover:border-primary transition-colors card-hover"
            >
              <Instagram className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <div className="font-semibold">@emma_sing2</div>
                <div className="text-sm text-muted-foreground">1003 abonnés</div>
              </div>
            </a>
            
            <a 
              href="https://www.facebook.com/profile.php?id=100008196917547" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border hover:border-primary transition-colors card-hover"
            >
              <Facebook className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold">Emmanuelle Singani</div>
                <div className="text-sm text-muted-foreground">Facebook</div>
              </div>
            </a>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Découvrez mes dernières créations, tutoriels et conseils beauté
          </p>
          
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
            Voir plus de contenu
          </Button>
        </div>
      </div>
    </section>
  )
}

export default GallerySection

