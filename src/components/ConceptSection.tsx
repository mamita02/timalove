import mainsmariesImg from "@/assets/mainsmaries.png";
import { Heart, MessageCircle, Search, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Inscription",
    description: "Remplissez notre formulaire détaillé. Chaque profil est examiné personnellement par notre équipe.",
  },
  {
    icon: Search,
    number: "02", 
    title: "Validation",
    description: "Nous vérifions l'authenticité et le sérieux de votre démarche. Seuls les profils sincères sont acceptés.",
  },
  {
    icon: Heart,
    number: "03",
    title: "Mise en relation",
    description: "Notre administratrice vous propose des profils compatibles, sélectionnés avec soin selon vos critères.",
  },
  {
    icon: MessageCircle,
    number: "04",
    title: "Accompagnement",
    description: "Nous vous guidons à chaque étape jusqu'à la rencontre. Un suivi humain et bienveillant.",
  },
];

export const ConceptSection = () => {
  return (
    <section id="concept" className="relative py-24 md:py-32 overflow-hidden flex items-center justify-center min-h-[800px] bg-black">
      
      {/* IMAGE DE FOND - VISIBILITÉ MAXIMUM */}
      <div className="absolute inset-0 z-0">
        <img
                src={mainsmariesImg}
                alt="Mariage TimaLove"
                className="w-full h-full object-cover"
              />
        {/* Overlay Noir très léger (2% comme tu as suggéré ou presque transparent) */}
        <div className="absolute inset-0 bg-black/5" /> 
        
        {/* Dégradés subtils uniquement en haut et en bas pour la transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header avec ombre portée sur le texte pour garantir la lecture sur l'image claire */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-4 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 shadow-sm">
            Notre approche
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-white font-medium drop-shadow-md">
            Contrairement aux applications de rencontre classiques, TimaLove mise sur 
            l'humain. Chaque étape est accompagnée par notre équipe dédiée.
          </p>
        </div>

        {/* Steps Grid - Flou plus intense pour détacher les blocs de l'image nette */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="group relative">
              {/* BLOC GLASSMORPHISM - Légèrement plus sombre pour créer du contraste avec l'image claire */}
              <div className="relative bg-black/40 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/10 hover:border-primary/50 transition-all duration-500 text-center h-full flex flex-col items-center group-hover:-translate-y-2">
                
                <span className="mb-4 bg-primary text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full">
                  {step.number}
                </span>

                <div className="w-16 h-16 mb-6 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <step.icon size={28} className="text-primary" />
                </div>

                <h3 className="font-serif text-xl font-bold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="#inscription"
            className="inline-block bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Découvrir nos profils →
          </a>
        </div>
      </div>
    </section>
  );
};