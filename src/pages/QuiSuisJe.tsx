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

            {/* Overlay uniquement mobile */}
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

                {/* Scroll animé uniquement desktop */}
                <div className="lg:h-[450px] lg:overflow-hidden relative lg:mask-edge">

                  <div className="space-y-8 text-white lg:text-slate-700 text-base md:text-lg lg:text-xl leading-relaxed lg:animate-auto-scroll">

                    <p className="text-white lg:text-primary font-medium italic text-xl md:text-2xl">
                      "Je m’appelle Fatimata, que beaucoup appellent Tima."
                    </p>

                    <p>
                      TimaLove est né d’une conviction simple mais profonde :
                      l’amour mérite d’être vécu avec sincérité, respect et intention.
                    </p>

                    <p>
                      Depuis toujours, j’aime écouter, aider et comprendre les autres.
                      Je prends le temps d’entendre ce qui est dit… mais aussi ce qui ne l’est pas.
                    </p>

                    <h2 className="text-2xl font-serif text-white lg:text-primary pt-4 italic">
                      Une histoire humaine
                    </h2>

                    <p>
                      Je suis née dans une famille nombreuse...
                      Grandir dans cet environnement m’a appris une chose :
                      aimer, ce n’est pas seulement ressentir, c’est comprendre.
                    </p>

                    <h2 className="text-2xl font-serif text-white lg:text-primary pt-4 italic">
                      La naissance de TimaLove
                    </h2>

                    <p>
                      TimaLove est né du besoin de créer un espace où l’on prend le temps.
                      Où chaque personne est respectée et chaque rencontre réfléchie.
                    </p>

                    {/* Vision */}
                    <div className="bg-white/20 lg:bg-white/30 backdrop-blur-md p-8 rounded-[30px] border border-white/30 shadow-sm">
                      <h3 className="text-white lg:text-primary font-bold mb-4 uppercase tracking-[0.2em] text-xs">
                        Ma Vision
                      </h3>
                      <ul className="space-y-3 text-white lg:text-slate-700">
                        <li>❤ L’amour avec intention</li>
                        <li>❤ La communication essentielle</li>
                        <li>❤ Le respect comme base</li>
                      </ul>
                    </div>

                    <p className="pt-6 font-serif text-lg md:text-xl text-white lg:text-primary/80 italic">
                      TimaLove, c’est une main tendue vers ceux qui veulent construire avec le cœur.
                    </p>

                    <div className="h-20 lg:h-[150px]" />
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
          0% { transform: translateY(0); }
          100% { transform: translateY(-68%); }
        }

        .animate-auto-scroll {
          animation: autoScroll 42s linear infinite;
        }

        .animate-auto-scroll:hover {
          animation-play-state: paused;
        }

        .mask-edge {
          mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
        }
      `}</style>
    </div>
  );
};

export default QuiSuisJe;
