import TimaImg from "@/assets/Tima.png";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuiSuisJe = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-20">
        <section className="relative w-full min-h-screen lg:h-[95vh] overflow-hidden bg-white">
          
          {/* IMAGE */}
          <div className="absolute inset-0 lg:inset-y-0 lg:right-0 lg:left-auto w-full lg:w-1/2 h-full pointer-events-none">
            <img
              src={TimaImg}
              alt="Tima"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/60 lg:hidden" />
          </div>

          {/* CONTENU */}
          <div className="container mx-auto h-full px-6 relative z-10 flex items-center">
            <div className="w-full lg:w-[45%] flex flex-col gap-6 py-16 lg:py-0">

              {/* Bouton retour */}
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="
                  w-fit 
                  bg-white/20 backdrop-blur-md 
                  text-white lg:text-primary 
                  hover:bg-primary hover:text-white 
                  mb-4 shadow-sm rounded-full border border-white/30
                "
              >
                <ArrowLeft className="mr-2" size={18} />
                Retour
              </Button>

              <div>
                <h1 className="text-4xl md:text-5xl font-serif mb-2 text-white lg:text-primary leading-tight">
                  À propos de <span className="italic">TIMA</span>
                </h1>

                <div className="w-20 h-1 bg-primary/40 mb-8" />

                {/* Fenêtre du scroll */}
                <div className="h-[70vh] lg:h-[500px] overflow-hidden relative mask-edge">
                  
                  {/* Bloc animé */}
                  <div className="space-y-8 text-white lg:text-slate-700 text-base md:text-lg lg:text-xl leading-relaxed animate-auto-scroll">

                    <p className="text-white lg:text-primary font-medium italic text-xl md:text-2xl">
                      "Je m’appelle Fatimata, que beaucoup appellent Tima."
                    </p>

                    <p>
                      Plus qu’une vocation, l’accompagnement amoureux est pour moi une évidence. J'ai fondé <strong>TimaLove</strong> sur une conviction profonde : l’amour véritable ne naît pas du hasard, mais de la sincérité, du respect et de l’intentionnalité.
                    </p>

                    <p>
                      Depuis toujours, ma force réside dans l’observation et l’empathie. Je ne me contente pas d’écouter les mots ; je perçois les silences, les attentes inexprimées et le potentiel de bonheur de chaque personne que je rencontre.
                    </p>

                    <h2 className="text-2xl font-serif text-white lg:text-primary pt-4 italic">
                      L'art de la rencontre authentique
                    </h2>

                    <p>
                      Issue d’une famille nombreuse et riche de parcours divers, j'ai très tôt compris que <strong>"aimer, c'est d'abord comprendre"</strong>. Cette école de la vie m'a appris à décrypter les dynamiques humaines pour transformer les incompréhensions en ponts vers l'autre.
                    </p>

                    <h2 className="text-2xl font-serif text-white lg:text-primary pt-4 italic">
                      La naissance de TimaLove
                    </h2>

                    <p>
                      TimaLove est né d'un besoin de créer un espace où l’on prend le temps. Dans un monde de rencontres superficielles et déshumanisées, je propose une alternative artisanale où chaque mise en relation est réfléchie avec soin.
                    </p>

                    {/* Bloc Vision */}
                    <div className="bg-white/20 lg:bg-white/10 backdrop-blur-md p-8 rounded-[30px] border border-white/30 shadow-sm">
                      <h3 className="text-white lg:text-primary font-bold mb-4 uppercase tracking-[0.2em] text-xs">
                        Ma Vision
                      </h3>
                      <ul className="space-y-3 text-white lg:text-slate-700">
                        <li>❤ L'amour se construit jour après jour</li>
                        <li>❤ La communication est le socle de la complicité</li>
                        <li>❤ Le respect est la base de toute relation durable</li>
                      </ul>
                    </div>

                    <p className="pt-6 font-serif text-lg md:text-xl text-white lg:text-primary/80 italic">
                      TimaLove, c’est une main tendue vers celles et ceux qui ne veulent plus jouer avec les sentiments, mais construire avec le cœur.
                    </p>

                    {/* espace pour permettre la sortie dans le fondu */}
                    <div className="h-40 lg:h-[300px]" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes autoScroll {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }

        .animate-auto-scroll {
          animation: autoScroll 50s linear infinite;
          will-change: transform;
        }

        .animate-auto-scroll:hover {
          animation-play-state: paused;
        }

        .mask-edge {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
    </div>
  );
};

export default QuiSuisJe;
