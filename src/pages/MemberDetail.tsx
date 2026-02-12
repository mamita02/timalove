import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Briefcase, Check, ChevronLeft, Globe, Heart, Loader2, MapPin, Moon, Send, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const MemberDetail = () => {
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
          const { data: memberData } = await supabase
            .from('registrations')
            .select('*')
            .eq('id', id)
            .single();

          if (memberData) {
            setMember(memberData);
            setActivePhoto(memberData.photo_url);

            if (userId) {
              const { data: request } = await supabase
                .from('requests')
                .select('id')
                .eq('sender_id', userId)
                .eq('receiver_id', id)
                .maybeSingle();
              if (request) setHasRequested(true);

              const { data: like } = await supabase
                .from('notifications')
                .select('id')
                .eq('from_user_id', userId)
                .eq('to_user_id', id)
                .eq('type', 'like')
                .maybeSingle();
              if (like) setHasLiked(true);
            }
          }
        }

        if (userId) {
          const { data: myProfile } = await supabase.from('registrations').select('gender').eq('id', userId).single();
          const { data: sub } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

          const isFemale = myProfile?.gender?.toLowerCase().startsWith('f');
          const isPremium = sub?.subscription_status === 'active' && new Date(sub.subscription_end_date) > new Date();
          
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

  const handleLike = async () => {
    if (!currentUserId) return toast.error("Connectez-vous pour aimer ce profil.");
    const previousState = hasLiked;
    setHasLiked(!previousState);

    if (!previousState) {
      const { error } = await supabase.from('notifications').insert({
        from_user_id: currentUserId,
        to_user_id: member.id,
        message: "vous a envoyé un coup de cœur !",
        type: 'like'
      });
      if (error) {
        setHasLiked(previousState);
        toast.error("Erreur lors de l'envoi");
      } else {
        toast.success("Coup de cœur envoyé ! 💖");
      }
    } else {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('from_user_id', currentUserId)
        .eq('to_user_id', member.id)
        .eq('type', 'like');
      if (error) {
        setHasLiked(previousState);
        toast.error("Erreur lors de la suppression");
      } else {
        toast.info("Coup de cœur retiré");
      }
    }
  };

  const handleDemande = async () => {
    if (!currentUserId) return toast.error("Connectez-vous pour envoyer une demande.");
    if (hasRequested) return;

    const { error } = await supabase.from('requests').insert({
      sender_id: currentUserId,
      receiver_id: member.id,
      status: 'pending'
    });

    if (!error) {
      await supabase.from('notifications').insert({
        from_user_id: currentUserId,
        to_user_id: member.id,
        message: "souhaite entrer en contact avec vous !",
        type: 'request_received'
      });
      setHasRequested(true);
      toast.success(`Demande envoyée à ${member.first_name} ! 🚀`);
    } else {
      toast.error("Erreur lors de l'envoi de la demande");
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
    <div className="min-h-screen bg-[#F7F3F0]"> {/* FOND DE PAGE BEIGE SABLE */}
      <Navbar />
      <main className="pt-28 pb-12 container mx-auto px-4 max-w-6xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-rose-500 mb-8 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Retour aux profils
        </button>

        {/* BLOC CENTRAL BLANC SUR FOND BEIGE */}
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
              {[member.photo_url, member.photo_url_2, member.photo_url_3].filter(Boolean).map((url, idx) => (
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