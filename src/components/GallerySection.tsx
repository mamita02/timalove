import { supabase } from "@/lib/supabase";
import { Briefcase, Heart, Loader2, Lock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

// Interface mise à jour pour correspondre à TON supabase.ts
interface Profile {
  id: string;
  first_name: string;
  age: number;
  city: string;
  profession: string; // C'était 'job_title' avant, corrigé en 'profession'
  presentation: string;
  photo_url: string | null; // Peut être null
  gender: string;
}

export const GallerySection = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        // CORRECTION ICI : On utilise les vrais noms de colonnes de ta DB
        const { data, error } = await supabase
          .from('registrations')
          .select('id, first_name, age, city, profession, presentation, photo_url, gender')
          .limit(6)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erreur Supabase:", error.message);
        } else if (data) {
          setProfiles(data);
        }
      } catch (err) {
        console.error("Erreur inattendue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <section id="galerie" className="py-20 md:py-32 bg-gradient-to-br from-[#FFF1F2] via-[#FFF1F2] to-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-primary font-medium text-sm tracking-wider uppercase mb-4">
            Nos profils ({profiles.length})
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6 text-slate-900">
            Découvrez nos membres
          </h2>
          <p className="text-lg text-muted-foreground">
            Tous nos profils sont vérifiés et validés. Les photos sont floutées 
            pour protéger la vie privée de nos membres.
          </p>
        </div>

        {/* État de chargement */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : profiles.length === 0 ? (
          // État vide (si aucun client trouvé)
          <div className="text-center py-10 text-slate-500">
            <p>Aucun profil public pour le moment.</p>
          </div>
        ) : (
          /* Grille des profils */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-card hover-lift border border-white/50"
                onMouseEnter={() => setHoveredId(profile.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Conteneur Photo */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  
                  {/* Image ou Dégradé si pas d'image */}
                  {profile.photo_url ? (
                    <img 
                      src={profile.photo_url} 
                      alt={profile.first_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter blur-xl scale-110" 
                    />
                  ) : (
                    // Fallback : Gradient abstrait si l'utilisateur n'a pas de photo
                    <div className="w-full h-full bg-gradient-to-br from-rose-200 via-slate-100 to-rose-100 blur-lg opacity-80" />
                  )}

                  {/* Cadenas (Toujours visible) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                    <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center mb-3 border border-rose-100">
                      <Lock size={28} className="text-rose-500" />
                    </div>
                    <p className="text-sm font-bold text-white drop-shadow-md">Photo protégée</p>
                  </div>

                  {/* Badge Vérifié */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-20">
                    <Heart size={14} className="text-primary fill-primary" />
                    <span className="text-xs font-medium">Vérifié</span>
                  </div>
                </div>

                {/* Infos Profil */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-xl font-medium text-slate-800">
                      {profile.first_name}, {profile.age} ans
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin size={14} />
                      {/* Affichage de la ville */}
                      <span>{profile.city || "Ville non renseignée"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Briefcase size={14} />
                      {/* Utilisation correcte de PROFESSION */}
                      <span>{profile.profession || "Membre"}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic h-10">
                    "{profile.presentation || "Je recherche une relation sérieuse..."}"
                  </p>

                  <Button 
                    variant="romantic" 
                    size="sm" 
                    className="w-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                  >
                    Voir le profil complet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Débloquez l'accès complet aux photos pour seulement <span className="text-primary font-semibold">50€</span>
          </p>
          <Button variant="romantic" size="lg" className="shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
            Accéder à la galerie complète
          </Button>
        </div>
      </div>
    </section>
  );
};