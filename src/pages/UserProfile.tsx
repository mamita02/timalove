import { EditPhotosModal } from "@/components/EditPhotosModal";
import { Footer } from "@/components/Footer";
import { MemberGallery } from "@/components/MemberGallery";
import { Navbar } from "@/components/Navbar";
import { NotificationList } from "@/components/NotificationList";
import { RequestsModal } from "@/components/RequestsModal";
import SubscriptionButton from "@/components/SubscriptionButton";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Calendar,
  Camera,
  Globe,
  Heart,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Moon,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { TestimonialModal } from "../components/TestimonialModal";

const UserProfile = () => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userSexe, setUserSexe] = useState<'homme' | 'femme' | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filters, setFilters] = useState({
    country: "",
    religion: "",
    ageRange: ""
  });

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showEditPhotos, setShowEditPhotos] = useState(false);
  const [myPhotos, setMyPhotos] = useState({ photo_url: null, photo_url_2: null, photo_url_3: null });

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = '/login';
          return;
        }
        
        const user = session.user;
        setSessionUser(user);

        const { data: profile } = await supabase.from('registrations').select('gender, photo_url, photo_url_2, photo_url_3').eq('id', user.id).single();
        const { data: subscriptionData } = await supabase.from('profiles').select('subscription_status, subscription_end_date').eq('id', user.id).single();

        if (profile) {
          const isFemale = profile.gender?.toLowerCase().startsWith('f');
          setUserSexe(isFemale ? 'femme' : 'homme');
          
          const isPremium = subscriptionData?.subscription_status === 'active' && 
                            subscriptionData?.subscription_end_date && 
                            new Date(subscriptionData.subscription_end_date) > new Date();
          
          setHasPaid(isFemale || isPremium);
          setMyPhotos({ photo_url: profile.photo_url, photo_url_2: profile.photo_url_2, photo_url_3: profile.photo_url_3 });
        }
        fetchNotifications(user.id);
      } catch (err) { 
        console.error("Erreur init:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    initializeProfile();
  }, []);

  // Ajoute cet useEffect dans UserProfile.tsx juste après le premier
useEffect(() => {
  if (!sessionUser) return;

  const checkSubscription = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_end_date")
      .eq("id", sessionUser.id)
      .single();

    if (data) {
      const isPremium =
        data.subscription_status === "active" &&
        data.subscription_end_date &&
        new Date(data.subscription_end_date) > new Date();

      setHasPaid(isPremium || userSexe === "femme");
    }
  };

  // 🔥 Vérifie au chargement
  checkSubscription();

  // 🔥 Vérifie toutes les 5 secondes pendant 30 secondes
  const interval = setInterval(checkSubscription, 5000);

  // Stop après 30 secondes
  setTimeout(() => clearInterval(interval), 30000);

  return () => clearInterval(interval);
}, [sessionUser]);


  const fetchNotifications = async (userId: string) => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('to_user_id', userId).eq('is_read', false);
    if (count !== null) setUnreadCount(count);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading || userSexe === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBFB]">
        <Loader2 className="animate-spin text-rose-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <Navbar />
      
      {/* MODALS */}
      {sessionUser && <RequestsModal isOpen={showRequestsModal} onClose={() => setShowRequestsModal(false)} userId={sessionUser.id} />}
      <TestimonialModal isOpen={showTestimonialModal} onClose={() => setShowTestimonialModal(false)} userId={sessionUser?.id} />
      {sessionUser && (
        <EditPhotosModal 
          isOpen={showEditPhotos} 
          onClose={() => setShowEditPhotos(false)} 
          userId={sessionUser.id} 
          initialPhotos={myPhotos} 
          onPhotosUpdated={() => window.location.reload()} 
        />
      )}

      {/* HEADER / FILTRES */}
      <div className="pt-20 pb-4 bg-white/95 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            
            {/* Filtre Pays */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Globe size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-xs font-bold outline-none text-slate-600 cursor-pointer"
                value={filters.country}
                onChange={(e) => setFilters(prev => ({...prev, country: e.target.value}))}
              >
                <option value="">Tous les pays</option>
                <option value="Sénégal">Sénégal</option>
                <option value="France">France</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
              </select>
            </div>

            {/* Filtre Religion */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Moon size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-xs font-bold outline-none text-slate-600 cursor-pointer"
                value={filters.religion}
                onChange={(e) => setFilters(prev => ({...prev, religion: e.target.value}))}
              >
                <option value="">Toutes religions</option>
                <option value="Musulman">Musulman(e)</option>
                <option value="Chrétien">Chrétien(ne)</option>
              </select>
            </div>

            {/* Filtre Age */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Calendar size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-xs font-bold outline-none text-slate-600 cursor-pointer"
                value={filters.ageRange}
                onChange={(e) => setFilters(prev => ({...prev, ageRange: e.target.value}))}
              >
                <option value="">Tous les âges</option>
                <option value="20">+20 ans</option>
                <option value="30">+30 ans</option>
                <option value="40">+40 ans</option>
              </select>
            </div>

            {/* MENU UTILISATEUR COMPLET */}
            <div className="flex items-center gap-3 ml-auto">
               <div className="relative">
                  <button 
                    onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); if (!showNotifs) setUnreadCount(0); }}
                    className={`relative p-2 transition-colors ${showNotifs ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifs && <div className="absolute top-full right-0 mt-2 z-50"><NotificationList /></div>}
               </div>

               <div className="relative">
                 <button 
                   onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}
                   className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${showProfileMenu ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-200' : 'bg-rose-50 text-rose-400 border-rose-100'}`}
                 >
                   <User size={20} />
                 </button>
                 {showProfileMenu && (
                   <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                      <button onClick={() => { setShowRequestsModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <Heart size={16} /> Mes Demandes
                      </button>
                      <button onClick={() => { setShowTestimonialModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <MessageSquarePlus size={16} /> Ajouter un avis
                      </button>
                      <button onClick={() => { setShowEditPhotos(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <Camera size={16} /> Mes Photos
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">
                        <LogOut size={16} /> Se déconnecter
                      </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-8 container mx-auto px-4">
        {userSexe === 'homme' && !hasPaid && (
          <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h2 className="text-2xl font-serif mb-2 text-rose-200">Accès Premium</h2>
              <p className="text-slate-400 text-sm">Débloquez les photos et les profils illimités.</p>
            </div>
            <SubscriptionButton userId={sessionUser?.id} />
          </div>
        )}

        <h1 className="text-2xl font-serif text-slate-900 mb-8">
          Profils {userSexe === 'femme' ? 'masculins' : 'féminins'}
        </h1>

        <MemberGallery 
          forceShowNet={hasPaid} 
          targetSexe={userSexe === 'femme' ? 'homme' : 'femme'} 
          filters={filters} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;