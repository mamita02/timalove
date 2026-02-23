import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Briefcase, Check, ChevronLeft, Globe, Heart, Loader2, MapPin, Moon, Send, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const MemberDetail = () => {
  // id vient de l'URL (ex: /profile/123-abc) -> C'est le to_user_id
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;
        setCurrentUserId(userId);

        if (id) {
          // 1. On charge le profil du membre
          const { data: memberData } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', id)
          .single();

          if (memberData) {
            setMember(memberData);
            setActivePhoto(memberData.photo_url);

            // 2. Si on est connecté, on vérifie les interactions
            if (userId) {
              // Vérification des requêtes (Demandes d'amis)
              const { data: requests } = await supabase
                .from('requests')
                .select('id')
                .eq('sender_id', userId)
                .eq('receiver_id', id); // On utilise l'ID de l'URL
              
              if (requests && requests.length > 0) setHasRequested(true);

              // Vérification des likes (notifications existantes)
              const { data: likes } = await supabase
                .from('notifications')
                .select('id')
                .eq('from_user_id', userId)
                .eq('to_user_id', id) // On utilise l'ID de l'URL
                .eq('type', 'like');

              if (likes && likes.length > 0) setHasLiked(true);
            }
          }
        }

        // 3. Vérification du statut Premium de l'utilisateur connecté
        if (userId) {
          // On utilise maybeSingle pour éviter l'erreur 406 si le profil n'existe pas encore dans 'profiles'
          const { data: sub } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_end_date')
            .eq('id', userId)
            .maybeSingle();

          const { data: myProfile } = await supabase
            .from('registrations')
            .select('gender')
            .eq('id', userId)
            .maybeSingle();

          const isFemale = myProfile?.gender?.toLowerCase().startsWith('f');
          const isPremium = sub?.subscription_status === 'active' && 
                            sub?.subscription_end_date && 
                            new Date(sub.subscription_end_date) > new Date();
          
          setHasPaid(isFemale || isPremium);
        }
      } catch (err) {
        console.error("Erreur init:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [id]);

  // ✅ CORRECTION MAJEURE DU HANDLE LIKE
 const handleLike = async () => {
    if (!currentUserId || !id) return toast.error("Action impossible.");

    const previousState = hasLiked;
    setHasLiked(!previousState);

    try {
      if (!previousState) {
        // Insertion Coup de coeur (Type aligné sur notification.ts)
        const { error } = await supabase
          .from('notifications')
          .insert({
            from_user_id: currentUserId,
            to_user_id: id,
            message: "a eu un coup de cœur pour votre profil !",
            type: 'like',
            is_read: false
          });

        if (error) throw error;
        toast.success("Coup de cœur envoyé ! 💖");
      } else {
        // Suppression
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('from_user_id', currentUserId)
          .eq('to_user_id', id)
          .eq('type', 'admin_like');
        
        if (error) throw error;
        toast.info("Coup de cœur retiré.");
      }
    } catch (error: any) {
      setHasLiked(previousState);
      toast.error("Une erreur est survenue.");
    }
  };

  const handleDemande = async () => {
    if (!currentUserId || !id) return toast.error("Veuillez vous connecter.");
    if (currentUserId === id) return toast.error("Action impossible.");

    try {
      // 🚀 INSERTION SIMPLE
      // Le trigger SQL s'occupe de créer la notification 'admin_request_received'
      // L'ID est généré automatiquement par la DB
      const { error } = await supabase
        .from("requests")
        .insert({
          sender_id: currentUserId,
          receiver_id: id,
          status: "pending"
        });

      if (error) {
        if (error.code === '23505') { // Code d'erreur pour contrainte d'unicité (déjà envoyé)
            setHasRequested(true);
            return toast.info("Demande déjà envoyée.");
        }
        throw error;
      }

      setHasRequested(true);
      toast.success("Demande envoyée 🚀");

    } catch (err: any) {
      console.error("Erreur demande:", err);
      toast.error("Erreur lors de l'envoi.");
    }
  };

  if (loading || !member) {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-rose-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3F0]">
      <Navbar />
      <main className="pt-28 pb-12 container mx-auto px-4 max-w-6xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-rose-500 mb-8 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Retour aux profils
        </button>

        <div className="bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row p-4 md:p-12 gap-8 md:gap-16 items-start">
          
          {/* PHOTOS */}
          <div className="flex flex-col gap-4 w-full md:w-[380px] flex-shrink-0">
            <div className="aspect-[3/4] relative rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-lg border border-rose-100">
              <img 
                src={activePhoto || "/placeholder.jpg"} 
                className={`w-full h-full object-cover transition-all duration-500 ${
                  !hasPaid
                    ? "blur-lg scale-80"
                    : "blur-0 scale-100 group-hover:scale-100"
                }`} 
                alt={member.first_name} 
              />
              {!hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px]">
                  <div className="bg-white/60 p-4 rounded-full mb-4 text-rose-500 shadow-sm"><User size={32} /></div>
                  <h2 className="text-2xl font-serif font-bold text-slate-800">{member.first_name}, {member.age}</h2>
                  <p className="text-[10px] font-bold mt-2 tracking-widest uppercase bg-white/60 px-3 py-1 rounded-full text-rose-500">Photo Privée</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[member.photo_url, member.photo_url_2, member.photo_url_3].filter(Boolean).map((url: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActivePhoto(url)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activePhoto === url ? 'border-rose-500 ring-2 ring-rose-100' : 'border-transparent opacity-60'}`}
                >
                  <img src={url} className={`w-full h-full object-cover ${!hasPaid ? 'blur-md' : ''}`} alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* INFOS */}
          <div className="flex-1 w-full space-y-8 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-serif text-slate-900">{member.first_name}, {member.age}</h1>
                <div className="flex items-center gap-3 text-slate-400 font-medium text-sm mt-2">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-rose-300"/> {member.city}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-rose-300"/> Membre</span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-xl border border-green-100"><ShieldCheck className="text-green-500" size={24} /></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard label="Âge" value={`${member.age} ans`} icon={<User size={14}/>} />
              <InfoCard label="Ville" value={member.city} icon={<MapPin size={14}/>} />
              <InfoCard label="Origine" value={member.country} icon={<Globe size={14}/>} />
              <InfoCard label="Résidence" value={member.residence_country || member.country} icon={<MapPin size={14}/>} />
              <InfoCard label="Religion" value={member.religion || "Non spécifié"} icon={<Moon size={14}/>} />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <h2 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Présentation</h2>
              <p className="text-slate-500 italic font-serif text-lg leading-relaxed break-words">"{member.presentation || "..."}"</p>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Recherche</h2>
              <p className="text-slate-600 font-medium leading-relaxed bg-rose-50/10 p-4 rounded-2xl border border-rose-50/50 break-words">
                {member.looking_for || "Recherche une relation sérieuse."}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4 pt-6">
              <Button 
                onClick={handleLike} 
                className={`flex-1 h-16 rounded-[1.25rem] font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${hasLiked ? "bg-rose-600 text-white shadow-rose-200" : "bg-rose-400 text-white shadow-rose-100"}`}
              >
                <Heart size={22} className={hasLiked ? "fill-current" : ""} /> 
                {hasLiked ? "Coup de cœur envoyé" : "Envoyer un coup de cœur"}
              </Button>
              
              <Button 
                onClick={handleDemande}
                disabled={hasRequested}
                className={`w-20 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-all ${hasRequested ? "bg-slate-100 text-slate-400" : "bg-[#EAB308] text-white shadow-amber-100"}`}
              >
                {hasRequested ? <Check size={28} /> : <Send size={28} />}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div className="bg-white border border-stone-100 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow min-w-0">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="text-sm font-bold text-slate-700 capitalize truncate">{value}</p>
  </div>
);

export default MemberDetail;