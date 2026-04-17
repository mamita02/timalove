import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap
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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showNetFinal, setShowNetFinal] = useState(forceShowNet);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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

  useEffect(() => {
    setShowNetFinal(forceShowNet);
  }, [forceShowNet]);

  // Reset page quand les filtres ou le sexe cible changent
  useEffect(() => {
    setCurrentPage(1);
  }, [targetSexe, filters?.country, filters?.religion, filters?.ageRange]);

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

      const { data, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data) setMembers(data);
      if (count !== null) setTotalCount(count);
      setLoading(false);
    };

    fetchProfiles();
  }, [targetSexe, currentPage, filters?.country, filters?.religion, filters?.ageRange]);

  const displayedMembers = showNetFinal ? members : members.slice(0, 5);

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
        toast({ title: "Utilisateur non connecté", variant: "destructive" });
        setPaymentLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("naboo-create", {
        body: { userId: user.id }
      });

      if (error) throw new Error(error.message);

      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (!parsed?.url) throw new Error("URL manquante");

      window.location.href = parsed.url;

    } catch (err: any) {
      toast({
        title: "Erreur paiement",
        description: err.message,
        variant: "destructive"
      });
      setPaymentLoading(false);
    }
  };

  // Génère les numéros de pages à afficher (max 5 boutons visibles)
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-rose-400" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* GRILLE MEMBRES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => navigate(`/profile/${member.id}`)}
            className="group relative bg-white rounded-[2rem] overflow-hidden border border-rose-50 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            {/* IMAGE & COUP DE COEUR */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={member.photo_url || "/placeholder.jpg"}
                className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${
                  showNetFinal ? "" : "blur-xl scale-110"
                }`}
                alt={member.first_name}
              />

              {showNetFinal && (
                <button
                  onClick={(e) => toggleFavorite(e, member.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
                    favorites.includes(member.id)
                      ? "bg-rose-500 text-white"
                      : "bg-white/50 text-slate-700 hover:bg-white hover:text-rose-500"
                  }`}
                >
                  <Heart size={18} className={favorites.includes(member.id) ? "fill-current" : ""} />
                </button>
              )}

              {!showNetFinal && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-2xl">
                    <Lock className="text-white drop-shadow-md" size={28} />
                  </div>
                </div>
              )}
            </div>

            {/* INFOS & BOUTON DEMANDE */}
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-slate-800 truncate">
                  {member.first_name}, {member.age}
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin size={10} />
                  {member.city}
                </p>
              </div>

              {showNetFinal && (
                <button
                  onClick={(e) => handleDemande(e, member.id)}
                  disabled={sentRequests.includes(member.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    sentRequests.includes(member.id)
                      ? "bg-slate-100 text-slate-400 cursor-default"
                      : "bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white active:scale-95"
                  }`}
                >
                  {sentRequests.includes(member.id) ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} /> Envoyée
                    </span>
                  ) : (
                    "Demande"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ PAGINATION — visible uniquement si premium et plusieurs pages */}
      {showNetFinal && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-8">
          {/* Bouton Précédent */}
          <button
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-rose-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={16} />
            Précédent
          </button>

          {/* Numéros de pages */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400 text-sm">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === page
                      ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                      : "bg-white border border-rose-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-rose-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Suivant
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Compteur total */}
      {showNetFinal && totalCount > 0 && (
        <p className="text-center text-xs text-slate-400 -mt-10">
          {totalCount} profil{totalCount > 1 ? 's' : ''} • Page {currentPage} / {totalPages}
        </p>
      )}

      {/* SECTION DÉBLOCAGE */}
      {!showNetFinal && (
        <div className="w-screen relative left-1/2 -translate-x-1/2 bg-slate-900 py-24 px-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center">

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-16 text-center">
              Votre histoire commence <span className="text-rose-400">ici</span>
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 w-full mb-20">

              <div className="w-full max-w-[280px] p-8 bg-[#F4B6C2] border border-white/20 rounded-[2.5rem] flex flex-col items-center text-center transition-all shadow-lg">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-4">
                  <CalendarDays size={28} />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Accès 3 mois</h4>
                <p className="text-slate-800 text-sm leading-relaxed">
                  Prenez le temps de faire des rencontres sérieuses sans pression.
                </p>
              </div>

              <div className="flex md:flex-col items-center gap-3 text-rose-400">
                <Heart size={22} className="fill-current animate-pulse" />
                <ArrowRight className="hidden md:block" size={26} />
                <ArrowRight className="md:hidden rotate-90" size={26} />
              </div>

              <div className="w-full max-w-[300px] p-8 bg-rose-500 rounded-[2.5rem] shadow-2xl shadow-rose-900/40 flex flex-col items-center text-center transform md:-translate-y-4 transition-all">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4">
                  <Zap size={28} />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Profils Illimités</h4>
                <p className="text-rose-90 text-sm leading-relaxed">
                  Zéro restriction. Contactez qui vous voulez, quand vous voulez.
                </p>
              </div>

              <div className="flex md:flex-col items-center gap-3 text-rose-400">
                <Heart size={22} className="fill-current animate-pulse" />
                <ArrowRight className="hidden md:block" size={26} />
                <ArrowRight className="md:hidden rotate-90" size={26} />
              </div>

              <div className="w-full max-w-[280px] p-8 bg-[#F4B6C2] border border-white/20 rounded-[2.5rem] flex flex-col items-center text-center transition-all shadow-lg">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
                  <ShieldCheck size={28} />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">100 % sécurisé</h4>
                <p className="text-slate-800 text-sm leading-relaxed">
                  Paiement crypté via NabooPay pour une discrétion totale.
                </p>
              </div>

            </div>

            <Button
              onClick={handleUnlockPayment}
              disabled={paymentLoading}
              className="px-12 py-8 rounded-full text-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-xl"
            >
              {paymentLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Sparkles className="mr-2" />
              )}
              Débloquer tout maintenant
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};
