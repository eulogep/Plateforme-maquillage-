import { Button } from '@/components/ui/button'
import { Eye, Palette, Sparkles, Leaf, Star, Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredProduct, setHoveredProduct] = useState(null)

  const categories = [
    { id: 'all', name: 'Toute la Collection', icon: '✨' },
    { id: 'lips', name: 'Lèvres', icon: '💋' },
    { id: 'eyes', name: 'Yeux', icon: '👁️' },
    { id: 'face', name: 'Teint', icon: '🌟' },
    { id: 'skincare', name: 'Soins', icon: '🌿' }
  ]

  const products = [
    {
      id: 1,
      name: "Palette Sunset Africain",
      category: "eyes",
      price: "45€",
      originalPrice: "55€",
      description: "12 teintes inspirées des couchers de soleil sur la savane",
      image: "/src/assets/eyeshadow-palette.jpg",
      badge: "BESTSELLER",
      rating: 4.8,
      reviews: 127,
      benefits: ["Longue tenue", "Pigments intenses", "Vegan & Cruelty-free"],
      isNew: false,
      isFavorite: true
    },
    {
      id: 2,
      name: "Rouge à Lèvres Brazzaville",
      category: "lips",
      price: "25€",
      description: "Rouge mat longue tenue aux pigments naturels",
      image: "/src/assets/lipstick-brazzaville.jpg",
      badge: "NOUVEAU",
      rating: 4.9,
      reviews: 89,
      benefits: ["Formule hydratante", "Tenue 8h", "Ingrédients naturels"],
      isNew: true,
      isFavorite: false
    },
    {
      id: 3,
      name: "Fond de Teint Universel",
      category: "face",
      price: "35€",
      description: "Couvrance modulable pour toutes les carnations",
      image: "/src/assets/foundation-universal.jpg",
      badge: "ÉDITEUR'S CHOICE",
      rating: 4.7,
      reviews: 203,
      benefits: ["40 teintes", "SPF 30", "Fini naturel"],
      isNew: false,
      isFavorite: true
    },
    {
      id: 4,
      name: "Sérum Éclat Baobab",
      category: "skincare",
      price: "42€",
      description: "Sérum illuminateur à l'huile de baobab du Sénégal",
      image: "/src/assets/serum.jpg",
      badge: "CLEAN BEAUTY",
      rating: 4.6,
      reviews: 156,
      benefits: ["100% naturel", "Anti-âge", "Éclat immédiat"],
      isNew: false,
      isFavorite: false
    },
    {
      id: 5,
      name: "Gloss Hydratant Kinshasa",
      category: "lips",
      price: "18€",
      description: "Gloss ultra-brillant aux reflets dorés",
      image: "/src/assets/lipstick-brazzaville.jpg",
      badge: "",
      rating: 4.5,
      reviews: 78,
      benefits: ["Hydratation 24h", "Effet volume", "Non collant"],
      isNew: false,
      isFavorite: false
    },
    {
      id: 6,
      name: "Mascara Volume Savane",
      category: "eyes",
      price: "28€",
      description: "Mascara volumateur pour un regard intense",
      image: "/src/assets/eyeshadow-palette.jpg",
      badge: "",
      rating: 4.4,
      reviews: 92,
      benefits: ["Volume x3", "Waterproof", "Brosse précision"],
      isNew: false,
      isFavorite: false
    }
  ]

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory)

  const getBadgeStyle = (badge) => {
    switch(badge) {
      case 'BESTSELLER': return 'bg-red-500 text-white'
      case 'NOUVEAU': return 'bg-green-500 text-white'
      case 'ÉDITEUR\'S CHOICE': return 'bg-purple-500 text-white'
      case 'CLEAN BEAUTY': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <section id="collection" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ma <span className="text-gradient">Collection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Des cosmétiques qui célèbrent la beauté africaine avec une touche moderne et sophistiquée
          </p>
        </div>

        {/* Category Filters - Premium Style */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 border ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                  : 'bg-card text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid - E-commerce Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl border border-border overflow-hidden card-hover relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeStyle(product.badge)}`}>
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Favorite Icon */}
              <div className="absolute top-4 right-4 z-10">
                <button className={`p-2 rounded-full transition-colors ${
                  product.isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                }`}>
                  <Heart className="w-4 h-4" fill={product.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-secondary/20 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Quick Actions Overlay */}
                <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Aperçu rapide
                  </button>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4" 
                        fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} avis)
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Benefits */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {product.benefits.slice(0, 2).map((benefit, index) => (
                    <span key={index} className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                      -18%
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full cta-emotional btn-breathe">
                    Ma touche de beauté
                  </button>
                  <button className="w-full border border-border py-2 px-4 rounded-lg font-medium hover:bg-secondary transition-colors warm-glow">
                    Découvrir les secrets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Signals & CTA */}
        <div className="text-center section-warm rounded-2xl p-8 mb-16 texture-overlay">
          <button className="cta-emotional btn-breathe mb-4 text-xl px-12 py-5">
            Révélez votre éclat naturel
          </button>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-luxury rounded-full"></div>
              Livraison gratuite dès 50€
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-sunset rounded-full"></div>
              Retours sous 30 jours
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-warm rounded-full"></div>
              Garantie satisfaction 100%
            </span>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="bg-secondary/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ingrédients <span className="text-gradient">Naturels</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nos produits sont formulés avec des ingrédients naturels africains, 
              respectueux de votre peau et de l'environnement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Beurre de Karité", origin: "Ghana", icon: <Leaf className="w-6 h-6" /> },
              { name: "Huile d'Argan", origin: "Maroc", icon: <Sparkles className="w-6 h-6" /> },
              { name: "Aloe Vera", origin: "Afrique du Sud", icon: <Heart className="w-6 h-6" /> },
              { name: "Huile de Baobab", origin: "Sénégal", icon: <Star className="w-6 h-6" /> }
            ].map((ingredient, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-lg border border-border card-hover">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                  {ingredient.icon}
                </div>
                <h4 className="font-semibold mb-1">{ingredient.name}</h4>
                <p className="text-sm text-muted-foreground">{ingredient.origin}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductsSection

