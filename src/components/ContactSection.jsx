import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, Phone, Send } from 'lucide-react'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <section id="contact" className="bg-brand-ivory-soft py-20 font-brand-ui">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="mb-3 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
            Contact
          </div>
          <h2 className="font-brand-display text-[26px] text-brand-text lg:text-[32px]">
            Restons en <span className="italic text-brand-copper">contact</span>
          </h2>
          <div className="rule-gold mx-auto mt-4 mb-6 w-20" />
          <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-brand-text-muted">
            Une question sur mes produits ? Envie de collaborer ? N'hésitez pas à me contacter !
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="mb-8 font-brand-display text-[19px] text-brand-text">Informations de contact</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-brand-rule bg-brand-ivory">
                  <MapPin className="h-5 w-5 text-brand-copper-deep" />
                </div>
                <div>
                  <h4 className="mb-1 text-[13px] font-medium text-brand-text">Localisation</h4>
                  <p className="text-[13px] text-brand-text-muted">Stafford, Virginie, États-Unis</p>
                  <p className="text-[12px] text-brand-text-faint">Originaire de Brazzaville, Congo</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-brand-rule bg-brand-powder-pink/40">
                  <Mail className="h-5 w-5 text-brand-copper-deep" />
                </div>
                <div>
                  <h4 className="mb-1 text-[13px] font-medium text-brand-text">Email</h4>
                  <p className="text-[13px] text-brand-text-muted">emmanuellesingani23@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-brand-rule bg-brand-ivory">
                  <Phone className="h-5 w-5 text-brand-copper-deep" />
                </div>
                <div>
                  <h4 className="mb-1 text-[13px] font-medium text-brand-text">Réseaux sociaux</h4>
                  <p className="text-[13px] text-brand-text-muted">@emma_sing84 • @emma_sing2</p>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="border border-brand-rule bg-brand-ivory p-6">
              <h4 className="mb-3 font-brand-display text-[17px] text-brand-text">Ma Mission</h4>
              <p className="mb-4 text-[13px] leading-relaxed text-brand-text-muted">
                À travers ma marque, je veux révéler la beauté naturelle de chaque femme, 
                honorer mes racines africaines dans un univers cosmétique mondial, 
                et inspirer confiance, élégance et fierté culturelle.
              </p>
              <div className="border-l-2 border-brand-gold bg-brand-ivory-soft p-4">
                <blockquote className="text-center font-brand-display text-[14px] leading-relaxed text-brand-text-muted italic">
                  "La beauté n'est pas universelle par hasard — elle est le reflet de nos histoires. 
                  Et la mienne commence toujours par un sourire et une touche d'Afrique."
                </blockquote>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="mb-8 font-brand-display text-[19px] text-brand-text">Envoyez-moi un message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-[11px] tracking-[.1em] text-brand-text-faint uppercase">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-brand-rule bg-brand-ivory px-4 py-3 text-[13px] text-brand-text placeholder:text-brand-text-faint focus:border-brand-gold focus:outline-none"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="mb-2 block text-[11px] tracking-[.1em] text-brand-text-faint uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-brand-rule bg-brand-ivory px-4 py-3 text-[13px] text-brand-text placeholder:text-brand-text-faint focus:border-brand-gold focus:outline-none"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="mb-2 block text-[11px] tracking-[.1em] text-brand-text-faint uppercase">
                  Sujet
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-brand-rule bg-brand-ivory px-4 py-3 text-[13px] text-brand-text placeholder:text-brand-text-faint focus:border-brand-gold focus:outline-none"
                  required
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="products">Questions sur les produits</option>
                  <option value="collaboration">Proposition de collaboration</option>
                  <option value="press">Demande presse</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="mb-2 block text-[11px] tracking-[.1em] text-brand-text-faint uppercase">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full resize-none border border-brand-rule bg-brand-ivory px-4 py-3 text-[13px] text-brand-text placeholder:text-brand-text-faint focus:border-brand-gold focus:outline-none"
                  placeholder="Votre message..."
                  required
                ></textarea>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-none bg-brand-black text-[12px] tracking-[.1em] text-brand-champagne uppercase hover:bg-brand-charcoal"
              >
                <Send className="w-5 h-5 mr-2" />
                Envoyer le message
              </Button>
            </form>
            
            <p className="mt-4 text-center text-[12px] text-brand-text-faint">
              Je réponds généralement dans les 24-48 heures
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection

