import coupleDesktop from "@/assets/couple.png";
import coupleMobile from "@/assets/couplemobile.png";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { Button } from "./ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-20 md:pt-0">

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">

        {/* Image MOBILE */}
        <img
          src={coupleMobile}
          alt="Mariage TimaLove"
          className="w-full h-full object-cover block md:hidden"
        />

        {/* Image DESKTOP */}
        <img
          src={coupleDesktop}
          alt="Mariage TimaLove"
          className="w-full h-full object-cover hidden md:block"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      </div>

      {/* Decorative blur (desktop only) */}
      <div className="hidden md:block absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
      <div
        className="hidden md:block absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 md:mb-8 border border-white/20 shadow-sm">
            <Heart size={14} className="text-primary fill-primary md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium text-white">
              Mise en relation sérieuse vers le mariage
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-6 md:mb-8 text-white">
            Trouvez l'amour <br />
            <span className="italic text-primary">authentique</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto mb-10 md:mb-12 font-light px-2">
            TimaLove vous accompagne dans votre recherche d'une relation sérieuse.
            Chaque profil est{" "}
            <span className="font-medium text-white">
              validé manuellement
            </span>{" "}
            pour garantir l'authenticité.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 md:mb-20">
            <a href="#registration" className="w-full sm:w-auto">
              <Button
                variant="romantic"
                size="lg"
                className="w-full group rounded-full px-8 md:px-10 py-6 md:py-7 text-base md:text-lg shadow-xl"
              >
                Commencer mon inscription
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>

            <a
              href="#concept"
              className="text-white hover:text-primary transition-colors font-medium text-base md:text-lg underline underline-offset-8 decoration-primary/50"
            >
              Découvrir le concept
            </a>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Profils vérifiés", sub: "Validation manuelle" },
              { icon: Users, title: "Accompagnement", sub: "100% personnalisé" },
              { icon: Heart, title: "Objectif mariage", sub: "Relations sérieuses" }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 md:p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm"
              >
                <div className="p-2.5 md:p-3 bg-primary/20 rounded-xl">
                  <item.icon size={20} className="text-primary md:w-6 md:h-6" />
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
