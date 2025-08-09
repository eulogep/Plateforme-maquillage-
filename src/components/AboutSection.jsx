import { MapPin, Heart, Star } from 'lucide-react'

const AboutSection = () => {
  const timelineEvents = [
    {
      year: "Brazzaville",
      title: "Les racines qui nourrissent",
      description: "C'est dans les rues animées de Brazzaville qu'Emma développe son amour pour les couleurs, les textures et les histoires que portent les visages. Un univers riche en traditions africaines et en créativité.",
      icon: <MapPin className="w-5 h-5" />
    },
    {
      year: "France",
      title: "L'éducation européenne",
      description: "Au Lycée Agricole Privé Anne Marie Javouhey en Bourgogne, elle découvre le mélange des cultures et apprend à naviguer entre rigueur européenne et créativité africaine.",
      icon: <Heart className="w-5 h-5" />
    },
    {
      year: "États-Unis",
      title: "L'envol vers de nouveaux horizons",
      description: "Son voyage la conduit à Stafford, Virginie, où elle poursuit ses études à NOVA Community College, perfectionnant sa maîtrise du français, anglais et espagnol.",
      icon: <Star className="w-5 h-5" />
    },
    {
      year: "Aujourd'hui",
      title: "L'art de sublimer",
      description: "Pour Emma, le maquillage n'est pas un masque. C'est une signature personnelle, une façon de raconter qui l'on est sans dire un mot, puisant dans la culture africaine et la mode contemporaine.",
      icon: <Heart className="w-5 h-5" />
    }
  ]

  return (
    <section id="histoire" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Mon <span className="text-gradient">Histoire</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Un parcours de résilience, d'authenticité et de passion pour révéler la beauté sous toutes ses formes
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary transform md:-translate-x-1/2"></div>
            
            {timelineEvents.map((event, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background transform md:-translate-x-1/2 z-10">
                </div>
                
                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}>
                  <div className="bg-card p-6 rounded-lg shadow-lg border border-border card-hover">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        {event.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-primary">{event.year}</h3>
                    </div>
                    <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Ma <span className="text-gradient">Mission</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg border border-border card-hover">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">Révéler</h4>
              <p className="text-muted-foreground">
                La beauté naturelle de chaque femme, sans masque, avec authenticité
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border card-hover">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h4 className="text-xl font-bold mb-3">Honorer</h4>
              <p className="text-muted-foreground">
                Mes racines africaines dans un univers cosmétique mondial
              </p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-lg border border-border card-hover">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">Inspirer</h4>
              <p className="text-muted-foreground">
                Confiance, élégance et fierté culturelle chez toutes les femmes
              </p>
            </div>
          </div>
          
          {/* Introduction section */}
          <div className="mt-16 bg-card p-8 rounded-lg border border-border">
            <h4 className="text-xl font-bold mb-4 text-center">L'essence du personnage</h4>
            <p className="text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
              Emma n'est pas simplement une passionnée de beauté : c'est une femme qui incarne l'audace de ses origines 
              et l'élégance de son parcours. Née à Brazzaville, elle a grandi entre la chaleur des traditions africaines 
              et une curiosité insatiable pour le monde.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

