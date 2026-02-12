import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Check,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Send
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MemberGalleryProps {
  forceShowNet: boolean;
  targetSexe: 'homme' | 'femme';
  filters?: {
    country: string;
    religion: string;
    ageRange: string;
  };
}

export const MemberGallery = ({ forceShowNet, targetSexe, filters }: MemberGalleryProps) => {
  const navigate = useNavigate();
  const itemsPerPage = 15;

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]); // Liste des IDs likés
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // --- ÉTAPE 1 : Charger l'état depuis la base au démarrage ---
  useEffect(() => {
  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setCurrentUserId(user.id);

      // 1. Récupérer les LIKES
      const { data: likes } = await supabase
        .from('notifications')
        .select('to_user_id')
        .eq('from_user_id', user.id)
        .eq('type', 'like');

      if (likes) {
        setFavorites(likes.map(l => l.to_user_id));
      }

      // 2. Récupérer les DEMANDES
      const { data: requests } = await supabase
        .from('requests')
        .select('receiver_id')
        .eq('sender_id', user.id);
      
      if (requests) {
        setSentRequests(requests.map(r => r.receiver_id));
      }

      // 3. Vérifier abonnement (on force la vérification)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_end_date')
        .eq('id', user.id)
        .maybeSingle();

      const active = profile?.subscription_status === 'active' && 
                     new Date(profile.subscription_end_date) > new Date();
      
      // Si l'utilisateur vient de devenir premium, on lui fait un petit toast
      if (active && !isPremium) {
        toast({
          title: "Accès Premium activé ! ✨",
          description: "Toutes les photos sont désormais visibles.",
        });
      }

      setIsPremium(active);
    }
  };

  // --- LE SECRET POUR LE RETOUR DE PAIEMENT ---
  // Cette fonction se déclenche dès que l'utilisateur revient sur l'onglet
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkStatus();
    }
  };

  checkStatus();
  
  // On écoute quand l'utilisateur revient sur la page
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Nettoyage de l'écouteur quand on quitte le composant
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [isPremium]); // On ajoute isPremium ici pour pouvoir comparer l'ancien et le nouveau statut

  // --- ÉTAPE 2 : Charger les membres ---
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const dbGender = targetSexe === 'femme' ? 'female' : 'male';
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('gender', dbGender)
        .eq('status', 'approved')
        .neq('role', 'admin');

      if (filters?.country) query = query.eq('city', filters.country);
      if (filters?.religion) query = query.eq('religion', filters.religion);
      if (filters?.ageRange) query = query.gte('age', parseInt(filters.ageRange));

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        setTotalCount(count || 0);
        setMembers(data);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [targetSexe, currentPage, filters]);

  // --- ÉTAPE 3 : Gérer le clic sur le coeur (Toggle) ---
  const toggleFavorite = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUserId) return;

    const isAlreadyLiked = favorites.includes(targetId);

    if (isAlreadyLiked) {
      // Désactiver le like : Supprimer de la table notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('from_user_id', currentUserId)
        .eq('to_user_id', targetId)
        .eq('type', 'like');

      if (!error) {
        setFavorites(prev => prev.filter(id => id !== targetId));
      }
    } else {
      // Activer le like : Ajouter dans la table notifications
      const { error } = await supabase.from('notifications').insert({
        from_user_id: currentUserId,
        to_user_id: targetId,
        message: "vous a envoyé un coup de cœur !",
        type: 'like'
      });

      if (!error) {
        setFavorites(prev => [...prev, targetId]);
        toast({ title: "Coup de cœur envoyé ! 💖" });
      }
    }
  };

  const handleDemande = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUserId || sentRequests.includes(targetId)) return;

    const { error } = await supabase.from('requests').insert({
      sender_id: currentUserId,
      receiver_id: targetId,
      status: 'pending'
    });

    if (!error) {
      await supabase.from('notifications').insert({
        from_user_id: currentUserId,
        to_user_id: targetId,
        message: "souhaite entrer en contact avec vous !",
        type: 'request_received'
      });
      setSentRequests(prev => [...prev, targetId]);
      toast({ title: "Demande envoyée ! 🚀" });
    }
  };

  const showNetFinal = forceShowNet || isPremium;

  if (loading && members.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EAB308]" size={40} /></div>;
  }
// On affiche tout si Premium, sinon seulement les 3 premiers



const handleUnlockPayment = async () => {
  try {
    setPaymentLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({ 
        title: "Erreur", 
        description: "Utilisateur non connecté.", 
        variant: "destructive" 
      });
      setPaymentLoading(false);
      return;
    }

    // CORRECTIF : On extrait data et error directement ici
    const { data, error } = await supabase.functions.invoke("naboo-create", {
      body: { 
        userId: user.id,
        // On définit l'URL actuelle pour le retour après paiement
        return_url: window.location.origin + window.location.pathname 
      }
    });

    // On vérifie l'erreur de l'invocation
    if (error) throw new Error(error.message);

    // On parse la réponse si c'est une chaîne, sinon on prend l'objet
    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    if (!parsed?.url) {
      throw new Error("URL de redirection manquante dans la réponse Naboo");
    }

    // Redirection directe vers la page de paiement Orange Money / Wave
    window.location.href = parsed.url;

  } catch (err: any) {
    console.error("Erreur paiement:", err);
    toast({ 
      title: "Paiement impossible", 
      description: err.message || "Impossible de contacter le service de paiement.", 
      variant: "destructive" 
    });
    setPaymentLoading(false);
  }
};
  // On définit displayedMembers juste avant le return pour qu'il bascule entre "les 3 premiers" et "tous"
  const displayedMembers = showNetFinal ? members : members.slice(0, 3);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {displayedMembers.map((member) => {
          // ON DÉFINIT LES VARIABLES ICI POUR ÉVITER LES ERREURS TS
          const isRequested = sentRequests.includes(member.id);
          const isLiked = favorites.includes(member.id);

          return (
            <div
              key={member.id}
              // 1. On enlève "showNetFinal &&" pour permettre le clic à tout le monde
              onClick={() => navigate(`/profile/${member.id}`)} 
              
              // 2. On met "cursor-pointer" pour tout le monde (puisque tout le monde peut cliquer)
              className="group relative bg-white rounded-[2rem] overflow-hidden border border-rose-50 shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={member.photo_url || "/placeholder.jpg"}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  showNetFinal
                    ? "blur-0 scale-100 group-hover:scale-100"
                    : "blur-lg scale-80"
                }`}
                alt={member.first_name}
              />
              {!showNetFinal && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
                )}
                {/* SI PAS PREMIUM : ON AFFICHE LE CADENAS */}
                {!showNetFinal && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                    <Lock className="text-white/90" size={32} />
                  </div>
                )}

                {/* SI PREMIUM : ON AFFICHE LE COEUR */}
                {showNetFinal && (
                  <button
                    onClick={(e) => toggleFavorite(e, member.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm z-10"
                  >
                    <Heart
                      size={16}
                      className={`transition-colors ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-300 fill-white'}`}
                    />
                  </button>
                )}
              </div>

              <div className="p-4 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-serif font-bold text-slate-800 truncate">
                      {member.first_name}, {member.age}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} className="text-[#EAB308]/60" />
                      {member.city}
                    </p>
                  </div>

                  {/* BOUTON DEMANDE : SEULEMENT SI PREMIUM */}
                  {showNetFinal && (
                    <Button
                      onClick={(e) => handleDemande(e, member.id)}
                      size="sm"
                      disabled={isRequested}
                      className={`h-8 px-3 text-[9px] font-black rounded-xl ${isRequested ? "bg-slate-100 text-slate-400" : "bg-[#EAB308] text-white"}`}
                    >
                      {isRequested ? <Check size={10} /> : <Send size={10} />}
                      {isRequested ? " Envoyé" : " Demande"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BANNIÈRE DÉBLOQUER : SEULEMENT SI PAS PREMIUM */}
      {!showNetFinal && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-white/50 rounded-[3rem] border-2 border-dashed border-rose-100 mt-8">
          <div className="bg-rose-100 p-4 rounded-full mb-4">
            <Lock className="text-rose-500" size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 text-center">
            Envie de voir qui sont ces membres ?
          </h3>
          <p className="text-slate-500 text-center mt-2 max-w-md">
            Débloquez l'accès complet pour voir tous les profils et trouver votre moitié.
          </p>
          <Button 
            onClick={handleUnlockPayment}
            disabled={paymentLoading}
            className="mt-6 h-14 px-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            {paymentLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Initialisation...
              </span>
            ) : (
              "Débloquer les profils 🚀"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
