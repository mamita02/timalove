import { supabase } from "@/lib/supabase";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestimonials();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          id,
          content,
          created_at,
          rating,
          names,
          author:registrations (
            first_name,
            role,
            age
          )
        `)
        // J'ai SUPPRIMÉ la ligne .eq('is_verified', true) -> Tout s'affiche !
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login'); 
    }
  };

  // On double la liste pour créer l'effet de boucle infinie sans coupure
  const scrollingTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="temoignages" className="py-24 bg-white overflow-hidden relative">
      
      {/* CSS pour l'animation (Directement ici pour que ça marche tout de suite) */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused; /* Pause quand on passe la souris */
        }
      `}</style>

      <div className="container-fluid mx-auto px-4"> {/* Container fluid pour utiliser toute la largeur */}
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-sm uppercase tracking-[0.3em] text-primary font-bold mb-4">
            Témoignages
          </h2>
          <p className="font-serif text-4xl md:text-5xl text-slate-800 mb-6 italic">
            Ils ont trouvé <span className="text-primary">l'amour</span> avec nous
          </p>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full" />
        </div>

        {/* --- ZONE DE DÉFILEMENT --- */}
        <div className="relative w-full overflow-hidden mask-gradient">
           {/* Masque dégradé sur les côtés pour faire joli */}
           <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {loading ? (
             <p className="text-center text-slate-400 py-10">Chargement des belles histoires...</p>
          ) : testimonials.length === 0 ? (
             <p className="text-center text-slate-400 italic py-10">Aucun témoignage pour le moment.</p>
          ) : (
            
            // Le conteneur qui bouge
            <div className="flex gap-8 animate-scroll w-max py-4">
              {scrollingTestimonials.map((testi, index) => (
                <div 
                  key={`${testi.id}-${index}`} 
                  className="w-[350px] md:w-[450px] flex-shrink-0 bg-[#FFF5F5] p-8 rounded-[30px] border border-rose-100/50 shadow-sm relative group flex flex-col"
                >
                  {/* Contenu de la carte */}
                  <div className="absolute -top-4 -left-2 bg-primary text-white p-2 rounded-xl shadow-lg rotate-6">
                    <Quote size={16} fill="currentColor" />
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(testi.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-slate-700 leading-relaxed mb-6 italic font-light text-base flex-grow">
                    "{testi.content}"
                  </p>

                  <div className="flex items-center gap-3 border-t border-primary/10 pt-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary border border-primary/20 font-bold shadow-inner uppercase text-sm">
                      {testi.names ? testi.names.charAt(0) : (testi.author?.first_name?.charAt(0) || "❤")}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                          {testi.names || testi.author?.first_name || "Membre TimaLove"}
                      </h4>
                      <p className="text-[10px] text-primary/70 font-medium uppercase tracking-widest">
                        {testi.author?.age ? `${testi.author.age} ans` : "Membre"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4">Vous avez trouvé votre moitié via TimaLove ?</p>
          <button 
            onClick={handleShareClick}
            className="text-primary font-serif italic text-lg hover:underline underline-offset-8 transition-all"
          >
            {user ? "Partagez votre histoire →" : "Connectez-vous pour partager votre histoire →"}
          </button>
        </div>
      </div>
    </section>
  );
};