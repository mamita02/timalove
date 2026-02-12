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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ✅ Charger utilisateur + likes + demandes
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data: likes } = await supabase
        .from('notifications')
        .select('to_user_id')
        .eq('from_user_id', user.id)
        .eq('type', 'like');

      if (likes) setFavorites(likes.map(l => l.to_user_id));

      const { data: requests } = await supabase
        .from('requests')
        .select('receiver_id')
        .eq('sender_id', user.id);

      if (requests) setSentRequests(requests.map(r => r.receiver_id));
    };

    init();
  }, []);

  // ✅ Charger membres
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);

      const dbGender = targetSexe === 'femme' ? 'female' : 'male';
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('registrations')
        .select('*')
        .eq('gender', dbGender)
        .eq('status', 'approved')
        .neq('role', 'admin');

      if (filters?.country) query = query.eq('city', filters.country);
      if (filters?.religion) query = query.eq('religion', filters.religion);
      if (filters?.ageRange) query = query.gte('age', parseInt(filters.ageRange));

      const { data } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data) setMembers(data);

      setLoading(false);
    };

    fetchProfiles();
  }, [targetSexe, currentPage, filters?.country, filters?.religion, filters?.ageRange]);

  const [showNetFinal, setShowNetFinal] = useState(forceShowNet);

useEffect(() => {
  setShowNetFinal(forceShowNet);
}, [forceShowNet]);


  const displayedMembers = showNetFinal ? members : members.slice(0, 3);

  const toggleFavorite = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUserId) return;

    const isLiked = favorites.includes(targetId);

    if (isLiked) {
      await supabase
        .from('notifications')
        .delete()
        .eq('from_user_id', currentUserId)
        .eq('to_user_id', targetId)
        .eq('type', 'like');

      setFavorites(prev => prev.filter(id => id !== targetId));
    } else {
      await supabase.from('notifications').insert({
        from_user_id: currentUserId,
        to_user_id: targetId,
        message: "vous a envoyé un coup de cœur !",
        type: 'like'
      });

      setFavorites(prev => [...prev, targetId]);
      toast({ title: "Coup de cœur envoyé 💖" });
    }
  };

  const handleDemande = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUserId || sentRequests.includes(targetId)) return;

    await supabase.from('requests').insert({
      sender_id: currentUserId,
      receiver_id: targetId,
      status: 'pending'
    });

    setSentRequests(prev => [...prev, targetId]);
    toast({ title: "Demande envoyée 🚀" });
  };

  const handleUnlockPayment = async () => {
  try {
    setPaymentLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Utilisateur non connecté",
        variant: "destructive"
      });
      setPaymentLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("naboo-create", {
      body: { userId: user.id }
    });

    if (error) throw new Error(error.message);

    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    if (!parsed?.url) {
      setPaymentLoading(false);
      throw new Error("URL manquante");
    }

    // 🔥 Redirection vers Naboo
    window.location.href = parsed.url;
    return; // 👈 on stoppe proprement la fonction ici

  } catch (err: any) {
    toast({
      title: "Erreur paiement",
      description: err.message,
      variant: "destructive"
    });
    setPaymentLoading(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#EAB308]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {displayedMembers.map((member) => {
          const isRequested = sentRequests.includes(member.id);
          const isLiked = favorites.includes(member.id);

          return (
            <div
              key={member.id}
              onClick={() => navigate(`/profile/${member.id}`)}
              className="group relative bg-white rounded-[2rem] overflow-hidden border border-rose-50 shadow-sm hover:shadow-xl cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={member.photo_url || "/placeholder.jpg"}
                  className={`w-full h-full object-cover transition ${
                    showNetFinal ? "" : "blur-lg scale-90"
                  }`}
                  alt={member.first_name}
                />

                {!showNetFinal && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Lock className="text-white" size={32} />
                  </div>
                )}

                {showNetFinal && (
                  <button
                    onClick={(e) => toggleFavorite(e, member.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center"
                  >
                    <Heart
                      size={16}
                      className={isLiked ? "fill-rose-500 text-rose-500" : "text-slate-300"}
                    />
                  </button>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-serif font-bold">
                  {member.first_name}, {member.age}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={10} />
                  {member.city}
                </p>

                {showNetFinal && (
                  <Button
                    onClick={(e) => handleDemande(e, member.id)}
                    size="sm"
                    disabled={isRequested}
                    className="mt-2"
                  >
                    {isRequested ? <Check size={14} /> : <Send size={14} />}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!showNetFinal && (
        <div className="text-center mt-8">
          <Button onClick={handleUnlockPayment} disabled={paymentLoading}>
            {paymentLoading ? "Chargement..." : "Débloquer les profils 🚀"}
          </Button>
        </div>
      )}
    </div>
  );
};
