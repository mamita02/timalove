import { EditPhotosModal } from "@/components/EditPhotosModal";
import { Footer } from "@/components/Footer";
import { MemberGallery } from "@/components/MemberGallery";
import { Navbar } from "@/components/Navbar";
import { NotificationList } from "@/components/NotificationList";
import { RequestsModal } from "@/components/RequestsModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Bell, Camera, Filter, Heart, Loader2, LogOut, MessageSquarePlus, Search, User } from "lucide-react"; // MessageSquarePlus ajouté ici
import { useEffect, useState } from "react";
import { TestimonialModal } from "../components/TestimonialModal"; // Import du Modal Avis
// Ajoute cette ligne avec les autres imports de composants
import SubscriptionButton from "@/components/SubscriptionButton";

const UserProfile = () => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userSexe, setUserSexe] = useState<'homme' | 'femme' | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // États pour les menus
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false); // État pour le modal avis

  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [showEditPhotos, setShowEditPhotos] = useState(false);
  const [myPhotos, setMyPhotos] = useState({ 
      photo_url: null, 
      photo_url_2: null, 
      photo_url_3: null 
  });
 useEffect(() => {
    const initializeProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        setSessionUser(user);

        if (user) {
          // 1. Récupérer les infos d'inscription (Genre, Photos)
          const { data: profile } = await supabase
            .from('registrations')
            .select('gender, photo_url, photo_url_2, photo_url_3')
            .eq('id', user.id)
            .single();

          // 2. NOUVEAU : Récupérer le statut d'abonnement (Table profiles)
          const { data: subscriptionData } = await supabase
            .from('profiles')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

          if (profile) {
            const isFemale = profile.gender.toLowerCase().startsWith('f');
            setUserSexe(isFemale ? 'femme' : 'homme');

            // 3. LOGIQUE MISE À JOUR :
            // L'utilisateur a payé si c'est une femme OU si l'abonnement est 'active'
            const isPremium = subscriptionData?.subscription_status === 'active';
            setHasPaid(isFemale || isPremium); 
            
            setMyPhotos({
              photo_url: profile.photo_url,
              photo_url_2: profile.photo_url_2,
              photo_url_3: profile.photo_url_3
            });
          }

          fetchNotifications(user.id);

          const channel = supabase
            .channel('realtime_notifications')
            .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'notifications', filter: `to_user_id=eq.${user.id}` }, 
              () => fetchNotifications(user.id)
            )
            .subscribe();

          return () => { supabase.removeChannel(channel); };
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);
  
  const fetchNotifications = async (userId: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .eq('is_read', false);
    
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
      
      {/* --- MODALS --- */}
      
      {/* Modal des Demandes */}
      {sessionUser && (
        <RequestsModal 
          isOpen={showRequestsModal} 
          onClose={() => setShowRequestsModal(false)} 
          userId={sessionUser.id} 
        />
      )}

      {/* 👇👇 AJOUTE CE BLOC ICI 👇👇 */}
      {/* Modal des Avis (C'est ce qui manquait !) */}
      <TestimonialModal 
        isOpen={showTestimonialModal}
        onClose={() => setShowTestimonialModal(false)}
        // Si ton modal a besoin de l'ID, ajoute-le ici (selon comment tu as codé le modal)
        userId={sessionUser?.id} 
      />
      {/* 👆👆 FIN DU BLOC À AJOUTER 👆👆 */}

      {/* Modal des Photos */}
      {sessionUser && (
          <EditPhotosModal 
            isOpen={showEditPhotos}
            onClose={() => setShowEditPhotos(false)}
            userId={sessionUser.id}
            initialPhotos={myPhotos}
            onPhotosUpdated={() => {
              window.location.reload(); 
            }}
          />
        )}

      <div className="pt-20 pb-4 bg-white/95 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 flex-1 max-w-lg">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Rechercher un profil..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>

            <div className="hidden md:flex items-center gap-4 ml-auto">
               
               {/* --- NOTIFICATIONS --- */}
               <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      setShowProfileMenu(false);
                      if (!showNotifs) setUnreadCount(0);
                    }}
                    className={`relative p-2 transition-colors ${showNotifs ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in zoom-in duration-200">
                      <NotificationList />
                    </div>
                  )}
               </div>

               {/* --- MENU PROFIL (User) --- */}
               <div className="relative">
                 <button 
                   onClick={() => {
                     setShowProfileMenu(!showProfileMenu);
                     setShowNotifs(false);
                   }}
                   className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${showProfileMenu ? 'bg-rose-500 text-white border-rose-500 shadow-lg ring-2 ring-rose-200' : 'bg-rose-50 text-rose-400 border-rose-100 hover:bg-rose-100'}`}
                 >
                   <User size={20} />
                 </button>

                 {/* Liste déroulante du Profil */}
                 {showProfileMenu && (
                   <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in duration-200">
                      <div className="px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs text-slate-400 font-medium">Mon Compte</p>
                      </div>
                      
                      {/* Bouton Mes Demandes */}
                      <button 
                        onClick={() => {
                          setShowRequestsModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                      >
                        <Heart size={16} />
                        Mes Demandes
                      </button>

                      {/* Bouton Ajouter un avis (Nouveau) */}
                      <button 
                        onClick={() => {
                          setShowTestimonialModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                      >
                        <MessageSquarePlus size={16} />
                        Ajouter un avis
                      </button>
                        {/* Bouton Modifier Photos */}
                        <button 
                          onClick={() => {
                            setShowEditPhotos(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                        >
                          <Camera size={16} />
                          Mes Photos
                        </button>
                      {/* Bouton Déconnexion */}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                      >
                        <LogOut size={16} />
                        Se déconnecter
                      </button>
                   </div>
                 )}
               </div>

            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <Button variant="outline" className="rounded-xl border-slate-200 gap-2 h-9 text-xs font-bold text-slate-600">
              <Filter size={14} /> Filtres
            </Button>
            {["Pays", "Célibataire", "18-25", "26-35", "36+"].map((f) => (
              <button key={f} className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-500 hover:border-rose-300 shadow-sm whitespace-nowrap">
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="py-8 container mx-auto px-4">
        {userSexe === 'homme' && !hasPaid && (
          <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-2xl font-serif mb-2 text-rose-200">Accès Premium</h2>
              <p className="text-slate-400 text-sm">Débloquez les photos pour 50 €.</p>
            </div>
            <div className="w-full md:w-auto">
                <SubscriptionButton userId={sessionUser?.id} />
            </div>
          </div>
        )}

        <h1 className="text-2xl font-serif text-slate-900 mb-8">
          Profils {userSexe === 'femme' ? 'masculins' : 'féminins'}
        </h1>

        {/* 👇 MODIFIE TA GALERIE COMME CECI : */}
        <MemberGallery 
          // Si hasPaid est faux, on floute (forceShowNet sera false)
          forceShowNet={hasPaid} 
          
          // Si hasPaid est faux, on limite à 3. Sinon, on utilise le compteur normal.
          limit={hasPaid ? visibleCount : 3} 
          
          targetSexe={userSexe === 'femme' ? 'homme' : 'femme'} 
        />

        <div className="mt-16 text-center">
          <Button 
            onClick={() => {
              setFetchingMore(true);
              setTimeout(() => { setVisibleCount(v => v + 5); setFetchingMore(false); }, 800);
            }} 
            variant="outline" 
            className="rounded-full px-16 h-14 border-rose-200 text-rose-500 font-bold"
            disabled={fetchingMore}
          >
            {fetchingMore ? <Loader2 className="animate-spin mr-2" size={20} /> : "Afficher plus"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;