import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND IMAGE avec OVERLAY SOMBRE */}
      <div className="absolute inset-0 z-0">
        <img
          src="images/couple.png"
          alt="Mariage TimaLove"
          className="w-full h-full object-cover" 
        />
        {/* Couche noire pour l'opacité et dégradé pour la profondeur */}
        <div className="absolute inset-0 bg-black/50" /> 
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Decorative Elements (ajustés pour le thème sombre) */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 animate-fade-up border border-white/20 shadow-sm">
            <Heart size={16} className="text-primary fill-primary" />
            <span className="text-sm font-medium text-white">
              Mise en relation sérieuse vers le mariage
            </span>
          </div>

          {/* Main Heading (Tout en blanc) */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 animate-fade-up text-white">
            Trouvez l'amour <br />
            <span className="italic text-primary">authentique</span>
          </h1>

          {/* Subtitle (Passé en blanc avec légère opacité pour l'élégance) */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 animate-fade-up font-light">
            TimaLove vous accompagne dans votre recherche d'une relation sérieuse. 
            Chaque profil est <span className="font-medium text-white">validé manuellement</span> pour garantir l'authenticité.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-up">
            
            {/* Bouton redirigeant vers l'ID de la section d'inscription */}
            <a href="#registration">
              <Button variant="romantic" size="lg" className="group rounded-full px-10 py-7 text-lg shadow-xl">
                Commencer mon inscription
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>

            <a href="#concept" className="text-white hover:text-primary transition-colors font-medium text-lg underline underline-offset-8 decoration-primary/50">
              Découvrir le concept
            </a>
          </div>

          {/* Trust Indicators (Cartes semi-transparentes avec texte blanc) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-up">
            {[
              { icon: Shield, title: "Profils vérifiés", sub: "Validation manuelle" },
              { icon: Users, title: "Accompagnement", sub: "100% personnalisé" },
              { icon: Heart, title: "Objectif mariage", sub: "Relations sérieuses" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <item.icon size={24} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-white/70">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
