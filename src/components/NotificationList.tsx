import { supabase } from "@/lib/supabase";
import { Clock, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const NotificationList = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // 1. On récupère l'utilisateur connecté (Mame Fatou)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. On récupère les notifications qui lui sont destinées
        const { data, error } = await supabase
          .from('notifications')
          .select('id, message, from_user_id, created_at, is_read') // On s'assure de bien prendre from_user_id
          .eq('to_user_id', user.id) // On filtre pour ne voir que SES notifications
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("SESSION ACTIVE :", session);
  };
  checkSession();
}, []);

  // Fonction pour gérer le clic
  const handleNotificationClick = async (notification: any) => {
    // 3. LA REDIRECTION MAGIQUE
    // Si from_user_id existe (ID d'Oussou Ba), on navigue vers son profil
    if (notification.from_user_id) {
      
      // Optionnel : Marquer comme lu dans la base de données
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      // Redirection vers le profil de l'homme
      navigate(`/profile/${notification.from_user_id}`);
    } else {
      console.error("Erreur: Pas d'ID expéditeur trouvé dans la notification");
    }
  };

  if (loading) return <div className="p-4 text-center text-xs text-slate-400">Chargement...</div>;

  return (
    <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-rose-50 p-2">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 p-3">Activités récentes</h3>
      
      {notifications.length === 0 ? (
        <p className="p-4 text-center text-sm text-slate-400 italic">Aucune notification.</p>
      ) : (
        notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => handleNotificationClick(n)}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group ${n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-rose-50/50 hover:bg-rose-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
              <Heart size={14} fill="currentColor" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-rose-500">
              {n.sender?.first_name || "Quelqu'un"} {n.sender?.age ? `(${n.sender.age} ans)` : ''}
            </span>
            <span className="text-slate-600"> {n.message}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                <Clock size={10} /> 
                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};