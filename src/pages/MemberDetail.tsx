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
  
  // --- ÉTATS DONNÉES ---
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // --- ÉTATS INTERFACE ---
  const [hasPaid, setHasPaid] = useState(false); // Mode flouté ou non
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  
  // --- ÉTATS INTERACTIONS ---
  const [hasRequested, setHasRequested] = useState(false); // Est-ce que j'ai déjà fait une demande ?

  // 1. Initialisation : User connecté + Profil visité + Vérification interactions
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);

      // A. Récupérer l'utilisateur connecté
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;
      setCurrentUserId(userId);

      // B. Récupérer le profil du membre visité
      if (id) {
        const { data: memberData, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && memberData) {
          setMember(memberData);
          setActivePhoto(memberData.photo_url);

          // C. Vérifier si une demande a DÉJÀ été envoyée
          if (userId) {
            const { data: existingRequest } = await supabase
              .from('requests')
              .select('id')
              .eq('sender_id', userId)
              .eq('receiver_id', memberData.id)
              .maybeSingle(); 
            
            if (existingRequest) {
              setHasRequested(true);
            }
          }
        }
      }

      // D. Vérifier le statut Payant/Sexe du visiteur (pour le floutage)
      if (userId) {
        const { data: viewerProfile } = await supabase
          .from('registrations')
          .select('gender')
          .eq('id', userId)
          .single();

        if (viewerProfile) {
          const isFemale = viewerProfile.gender?.toLowerCase().startsWith('f');
          setHasPaid(isFemale); // Femme = gratuit, Homme = flouté (false) par défaut
        }
      }

      setLoading(false);
    };

    initPage();
  }, [id]);


  // --- LOGIQUE CŒUR (Like) ---
  const handleLike = async () => {
    if (!currentUserId) return toast.error("Connectez-vous pour aimer un profil.");
    if (!member) return;

    // Envoi de la notification de Like
    const { error } = await supabase.from('notifications').insert({
      from_user_id: currentUserId,
      to_user_id: member.id,
      message: "vous a envoyé un coup de cœur !",
      type: 'like'
    });

    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi.");
    } else {
      toast.success("Coup de cœur envoyé ! 💖");
    }
  };


  // --- LOGIQUE DEMANDE (Mise en relation) ---
  const handleDemande = async () => {
    if (!currentUserId) {
      return toast.error("Veuillez vous connecter pour envoyer une demande.");
    }
    if (!member) return;

    // 1. Protection locale
    if (hasRequested) return;

    // 2. Insérer dans la table REQUESTS
    const { error } = await supabase.from('requests').insert({
      sender_id: currentUserId,
      receiver_id: member.id,
      status: 'pending'
    });

    if (error) {
      console.error(error);
      toast.error("Impossible d'envoyer la demande (peut-être déjà envoyée ?)");
      return;
    }

    // 3. Envoyer la NOTIFICATION
    await supabase.from('notifications').insert({
      from_user_id: currentUserId,
      to_user_id: member.id,
      message: "souhaite entrer en contact avec vous !",
      type: 'request_received'
    });

    // 4. Mise à jour État UI
    setHasRequested(true);
    
    toast.success(`Demande envoyée à ${member.first_name} ! 🚀`);
  };


  if (loading || !member) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBFB]">
        <Loader2 className="animate-spin text-rose-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <Navbar />
      <main className="pt-28 pb-12 container mx-auto px-4 max-w-6xl">
        
        {/* Bouton Retour */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-rose-500 mb-8 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Retour aux profils
        </button>

        <div className="bg-white rounded-[3rem] border border-rose-50 shadow-sm overflow-hidden flex flex-col md:flex-row p-4 md:p-12 gap-8 md:gap-16 items-start">
          
          {/* --- COLONNE GAUCHE (PHOTOS - Mode Clair/Flou Blanc) --- */}
          <div className="flex flex-col gap-4 w-full md:w-[380px] flex-shrink-0">
            
            {/* 1. La Grande Photo Principale */}
            <div className="aspect-[3/4] relative rounded-[2.5rem] overflow-hidden bg-slate-50 group shadow-lg border border-rose-100">
              <img 
                src={activePhoto || member.photo_url || "/placeholder.jpg"} 
                className={`w-full h-full object-cover transition-all duration-500 ${
                  !hasPaid 
                    ? 'blur-2xl scale-110 opacity-90' // Flou BLANC (White Blur)
                    : 'blur-0 scale-100'
                }`} 
                alt={member.first_name} 
              />
              
              {/* Message de blocage (Version Claire) */}
              {!hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-6 bg-white/30 backdrop-blur-[2px] z-10 pointer-events-none">
                  <div className="bg-white/60 p-4 rounded-full mb-4 backdrop-blur-md border border-white/40 shadow-sm text-rose-500">
                      <User size={32} />
                  </div>
                  <h2 className="text-2xl font-serif font-bold drop-shadow-sm text-center text-slate-800">
                    {member.first_name}, {member.age}
                  </h2>
                  <p className="text-xs font-bold opacity-80 mt-2 tracking-wide uppercase bg-white/60 px-3 py-1 rounded-full border border-white/40 text-rose-500 shadow-sm">
                      Photo Privée
                  </p>
                </div>
              )}
            </div>

            {/* 2. Les Miniatures (Corrigées) */}
            {(member.photo_url || member.photo_url_2 || member.photo_url_3) && (
              <div className="grid grid-cols-3 gap-3">
                {[member.photo_url, member.photo_url_2, member.photo_url_3].map((url, index) => (
                  url ? (
                    <button 
                      key={index}
                      onClick={() => setActivePhoto(url)}
                      className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative bg-slate-50 ${
                        activePhoto === url ? 'border-rose-500 ring-2 ring-rose-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={url} 
                        className={`w-full h-full object-cover ${
                          !hasPaid 
                            ? 'blur-md scale-110 opacity-80' // Flou léger et lumineux
                            : ''
                        }`} 
                        alt={`Profil ${index}`} 
                      />
                    </button>
                  ) : null
                ))}
              </div>
            )}
          </div>

          {/* --- COLONNE DROITE (INFOS) --- */}
          <div className="flex-1 w-full space-y-8 py-2">
            
            {/* En-tête */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-4xl font-serif text-slate-900">{member.first_name} , {member.age}</h1>
                <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                   <span className="flex items-center gap-1.5"><MapPin size={16} className="text-rose-300"/> {member.city}</span>
                   <span className="text-slate-200">|</span>
                   <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-rose-300"/> Membre</span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-xl border border-green-100" title="Profil Vérifié">
                <ShieldCheck className="text-green-500" size={24} />
              </div>
            </div>

            {/* Détails */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard label="Âge" value={`${member.age} ans`} icon={<User size={14}/>} />
              <div className="bg-white border border-rose-50/50 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14}/> Ville
                </p>
                <p className="text-sm font-bold text-slate-700 capitalize">{member.city}</p>
              </div>
              <InfoCard label="Origine" value={member.country} icon={<Globe size={14}/>} />
              <InfoCard label="Résidence" value={member.residence_country || member.country} icon={<MapPin size={14}/>} />
              <InfoCard label="Religion" value={member.religion || "Non spécifié"} icon={<Moon size={14}/>} />
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <h2 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Présentation du profil</h2>
              <p className="text-slate-500 italic font-serif text-lg leading-relaxed px-2">
                "{member.presentation || "Aucune description renseignée pour le moment."}"
              </p>
            </div>

            {/* Recherche */}
            <div className="space-y-4 pt-4">
              <h2 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Ce qu'il/elle recherche</h2>
              <p className="text-slate-600 font-medium leading-relaxed px-2 bg-rose-50/30 p-4 rounded-2xl border border-rose-50">
                {member.looking_for || "Recherche une relation sérieuse."}
              </p>
            </div>

            {/* --- BOUTONS D'ACTION --- */}
            <div className="flex items-center gap-4 pt-6 mt-auto">
              
              {/* BOUTON CŒUR */}
              <Button 
                onClick={handleLike} 
                className="flex-1 h-16 bg-rose-400 hover:bg-rose-500 text-white rounded-[1.25rem] font-bold text-lg shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-3 active:scale-95 transform duration-200"
              >
                <Heart size={22} className="fill-current" /> Envoyer un coup de cœur
              </Button>
              
              {/* BOUTON DEMANDE */}
              <Button 
                onClick={handleDemande}
                disabled={hasRequested}
                className={`w-20 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-all active:scale-95 transform duration-200 ${
                    hasRequested 
                    ? "bg-slate-100 text-slate-400 cursor-default hover:bg-slate-100 shadow-none border border-slate-200"
                    : "bg-[#EAB308] hover:bg-[#CA8A04] text-white shadow-amber-100"
                }`}
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
  <div className="bg-white border border-rose-50/50 p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="text-sm font-bold text-slate-700 capitalize">{value}</p>
  </div>
);

export default MemberDetail;