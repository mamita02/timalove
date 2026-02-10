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
        {/* Section avec la nouvelle nuance #ffffff */}
        <section className="relative w-full min-h-[90vh] lg:h-[95vh] overflow-hidden bg-[#ffffff]">
          
          {/* IMAGE DE DROITE : Intégration douce */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 flex items-center justify-end pr-4 lg:pr-12 pointer-events-none">
            <img 
              src="src/assets/A PROPOS1Plan de travail 5.png" 
              alt="Fatimata Ba - TimaLove" 
              className="w-auto h-[60%] lg:h-[75%] object-contain opacity-90" 
            />
          </div>

          <div className="container mx-auto h-full px-4 relative z-10 flex items-center">
            
            {/* ZONE DE TEXTE SANS BLOC AVEC AUTO-SCROLL */}
            <div className="w-full lg:w-[45%] flex flex-col gap-6 py-12 lg:py-0">
              
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")} 
                className="w-fit text-primary bg-white/40 backdrop-blur-sm hover:bg-primary hover:text-white mb-4 shadow-sm rounded-full transition-all border border-white/20"
              >
                <ArrowLeft className="mr-2" size={18} /> Retour
              </Button>

              <div className="relative">
                <h1 className="text-4xl md:text-5xl font-serif mb-2 text-primary leading-tight">
                  À propos de <span className="italic">TIMA</span>
                </h1>
                <div className="w-20 h-1 bg-primary/20 mb-8" />

                {/* Conteneur de l'animation avec fondu progressif */}
                <div className="h-[450px] overflow-hidden relative mask-edge">
                  <div className="animate-auto-scroll space-y-8 text-slate-700 text-lg md:text-xl leading-relaxed">
                    <p className="text-primary font-medium italic text-2xl">
                      "Je m’appelle Fatimata, que beaucoup appellent Tima."
                    </p>
                    
                    <p>
                      TimaLove est né d’une conviction simple mais profonde : l’amour mérite d’être vécu avec sincérité, respect et intention.
                    </p>

                    <p>
                      Depuis toujours, j’aime écouter, aider et comprendre les autres. Je prends le temps d’entendre ce qui est dit… mais aussi ce qui ne l’est pas.
                    </p>

                    <h2 className="text-2xl font-serif text-primary pt-4 italic">
                      Une histoire humaine
                    </h2>
                    <p>
                      Je suis née dans une famille nombreuse... Grandir dans cet environnement m’a appris une chose : aimer, ce n’est pas seulement ressentir, c’est comprendre.
                    </p>

                    <h2 className="text-2xl font-serif text-primary pt-4 italic">
                      La naissance de TimaLove
                    </h2>
                    <p>
                      TimaLove est né du besoin de créer un espace où l’on prend le temps. Où chaque personne est respectée et chaque rencontre réfléchie.
                    </p>

                    {/* Bloc "Ma Vision" en mode Glassmorphism */}
                    <div className="bg-white/30 backdrop-blur-md p-8 rounded-[30px] border border-white/40 shadow-sm">
                      <h3 className="text-primary font-bold mb-4 uppercase tracking-[0.2em] text-xs">Ma Vision</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">❤ L’amour avec intention</li>
                        <li className="flex items-center gap-3">❤ La communication essentielle</li>
                        <li className="flex items-center gap-3">❤ Le respect comme base</li>
                      </ul>
                    </div>

                    <p className="pt-6 font-serif text-xl text-primary/80 italic">
                      TimaLove, c’est une main tendue vers ceux qui veulent construire avec le cœur.
                    </p>
                    
                    {/* Espace pour finir le scroll proprement */}
                    <div className="h-[150px]" />
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