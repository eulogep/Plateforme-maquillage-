import { useState } from 'react'
import { Calendar, Clock, Video, MapPin, Star, Check } from 'lucide-react'

const BookingSection = () => {
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingStep, setBookingStep] = useState(1)

  const services = [
    {
      id: 1,
      name: "Consultation Beauté Personnalisée",
      duration: "60 min",
      price: "85€",
      description: "Analyse de votre peau, conseils personnalisés et création de votre routine beauté idéale",
      type: "video",
      icon: "💄",
      features: ["Analyse de peau", "Conseils personnalisés", "Routine sur-mesure", "Guide produits"]
    },
    {
      id: 2,
      name: "Séance Maquillage Signature",
      duration: "90 min",
      price: "120€",
      description: "Maquillage professionnel avec mes techniques signature et mes produits exclusifs",
      type: "presential",
      icon: "✨",
      features: ["Maquillage complet", "Techniques signature", "Photos incluses", "Conseils application"]
    },
    {
      id: 3,
      name: "Masterclass Maquillage",
      duration: "45 min",
      price: "65€",
      description: "Apprenez mes techniques de maquillage en visioconférence avec support personnalisé",
      type: "video",
      icon: "🎓",
      features: ["Techniques avancées", "Support vidéo", "Guide PDF", "Suivi 7 jours"]
    },
    {
      id: 4,
      name: "Transformation Complète",
      duration: "2h30",
      price: "200€",
      description: "Expérience complète : consultation, maquillage, shooting photo et conseils lifestyle",
      type: "presential",
      icon: "👑",
      features: ["Consultation complète", "Maquillage signature", "Shooting photo", "Conseils lifestyle"]
    }
  ]

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ]

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setBookingStep(2)
  }

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setBookingStep(3)
    }
  }

  return (
    <section id="rendez-vous" className="py-20 section-warm">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 soft-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
            Réservez votre{' '}
            <span className="text-gradient">moment beauté</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Offrez-vous une expérience beauté personnalisée avec Emma. 
            Consultations en ligne ou en présentiel à Stafford, Virginie.
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.9/5 satisfaction client</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>200+ transformations réussies</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Disponibilités flexibles</span>
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="max-w-6xl mx-auto">
          {/* Step Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    bookingStep >= step 
                      ? 'bg-gradient-luxury text-white' 
                      : 'bg-card border-2 border-border text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all ${
                      bookingStep > step ? 'bg-gradient-luxury' : 'bg-border'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {bookingStep === 1 && (
            <div className="soft-reveal">
              <h3 className="text-2xl font-bold text-center mb-8 font-heading">
                Choisissez votre expérience beauté
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="card-hover p-6 rounded-2xl cursor-pointer warm-glow border-soft"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient">{service.price}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-3 font-heading">{service.name}</h4>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {service.type === 'video' ? (
                        <><Video className="w-4 h-4 text-blue-500" /><span className="text-sm">Visioconférence</span></>
                      ) : (
                        <><MapPin className="w-4 h-4 text-green-500" /><span className="text-sm">Stafford, VA</span></>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full mt-6 cta-emotional btn-breathe">
                      Choisir cette expérience
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {bookingStep === 2 && selectedService && (
            <div className="soft-reveal">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 font-heading">
                  Choisissez votre créneau
                </h3>
                <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 inline-block border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedService.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{selectedService.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedService.duration} • {selectedService.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Calendar */}
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sélectionnez une date
                  </h4>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                {/* Time Slots */}
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Choisissez l'heure
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'bg-gradient-luxury text-white border-accent'
                            : 'bg-background border-border hover:border-accent hover:bg-secondary/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={handleDateTimeSelect}
                  disabled={!selectedDate || !selectedTime}
                  className={`cta-emotional btn-breathe px-12 py-4 text-lg ${
                    !selectedDate || !selectedTime ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Confirmer le créneau
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {bookingStep === 3 && (
            <div className="soft-reveal">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 font-heading">
                  Finalisez votre réservation
                </h3>
                <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto border border-border/50">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span>Service :</span>
                      <span className="font-semibold">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date :</span>
                      <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heure :</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-3">
                      <span>Total :</span>
                      <span className="font-bold text-gradient">{selectedService.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notes spéciales (optionnel)</label>
                  <textarea
                    rows="3"
                    className="w-full p-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Allergies, préférences, questions..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full cta-emotional btn-breathe py-4 text-lg"
                >
                  Confirmer ma réservation
                </button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Vous recevrez une confirmation par email avec les détails de connexion ou l'adresse du rendez-vous.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 texture-overlay">
          <h3 className="text-xl font-semibold mb-4 font-heading">
            Besoin d'aide pour choisir ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Contactez-moi directement pour discuter de vos besoins et trouver l'expérience parfaite pour vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-luxury">
              📧 Envoyer un message
            </button>
            <button className="btn-luxury">
              📱 Appeler maintenant
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingSection

