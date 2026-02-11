import TimaImg from "@/assets/Tima.png";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-[#fdf8f4] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
          
          {/* PHOTO : À droite */}
          <div className="w-full md:w-[55%] flex justify-center relative">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-200/10 rounded-full blur-3xl -z-10" />
              <img
                src={TimaImg}
                alt="Mariage TimaLove"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* TEXTE : À gauche avec espacement réduit */}
          <div className="w-full md:w-[45%]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-[1px] bg-primary/40" />
                <span className="text-primary font-medium text-[10px] tracking-[0.4em] uppercase">
                  La Visionnaire
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif text-slate-800 leading-tight">
                L'âme derrière <br />
                <span className="italic text-primary/80">TimaLove</span>
              </h2>
            </div>
            
            {/* Conteneur des paragraphes avec espace réduit (space-y-3) */}
            <div className="space-y-3">
              <p className="text-xl font-serif italic text-slate-700 border-l-2 border-primary/20 pl-4 py-1 mb-4">
                "Je m’appelle Fatimata, mais pour vous, ce sera simplement Tima."
              </p>
              
              <div className="text-base md:text-lg text-slate-600 font-light leading-snug space-y-2">
                <p>
                  TimaLove est né d’une conviction <span className="text-slate-800 font-normal">simple mais profonde</span> : l’amour mérite d’être vécu avec sincérité, respect et intention.
                </p>
                
                <p>
                  Depuis toujours, j’aime écouter et comprendre les autres. Je prends le temps d’entendre ce qui est dit… <span className="italic font-serif text-primary/70">et surtout ce qui ne l’est pas.</span>
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/qui-suis-je">
                <Button 
                  variant="outline" 
                  className="px-8 py-6 text-xs tracking-widest uppercase rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-sm"
                >
                  Découvrir mon histoire
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};