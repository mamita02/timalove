import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Activity, Clock, Heart, MapPin, UserPlus, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export const AdminActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ likes: 0, requests: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Récupération des activités (Notifications)
    // ⚠️ CORRECTION ICI : On utilise un simple select('*') car le bon message texte
    // est DÉJÀ généré par les triggers de ta base de données Supabase.
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*') 
      .in('type', ['admin_like', 'admin_request_received', 'meeting_confirmed'])
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error("Erreur de récupération des notifications:", notificationsError);
    } else if (notificationsData) {
      setActivities(notificationsData);
      const likes = notificationsData.filter(a => a.type === 'admin_like').length;
      const reqs = notificationsData.filter(a => a.type === 'admin_request_received').length;
      setStats({ likes, requests: reqs });
    }

    // 2. Récupération des 20 derniers inscrits
    const { data: usersData, error: usersError } = await supabase
      .from('registrations')
      .select('id, first_name, age, city, created_at')
      .neq('role', 'admin') // On exclut l'admin
      .order('created_at', { ascending: false })
      .limit(20);

    if (usersError) {
      console.error("Erreur de récupération des utilisateurs:", usersError);
    } else if (usersData) {
      setRecentUsers(usersData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();

    // 3. ECOUTE EN TEMPS RÉEL
    const notifChannel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const usersChannel = supabase
      .channel('admin-registrations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold text-slate-800">Activités & Flux</h2>
        <p className="text-slate-500">Suivez les interactions et les nouvelles arrivées en temps réel.</p>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-rose-50/50 border-rose-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600 font-medium">Coups de cœur</p>
                <h3 className="text-3xl font-bold text-rose-700">{stats.likes}</h3>
              </div>
              <div className="p-3 bg-rose-100 rounded-full">
                <Heart className="text-rose-600 h-6 w-6 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Demandes de contact</p>
                <h3 className="text-3xl font-bold text-amber-700">{stats.requests}</h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Zap className="text-amber-600 h-6 w-6 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille principale : Interactions & Inscrits */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* COLONNE 1 : Liste des interactions */}
        <Card className="flex flex-col h-[600px] border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Dernières interactions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Chargement des activités...</div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Aucune activité enregistrée.</div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'admin_like' ? 'bg-rose-100' : 'bg-amber-100'
                      }`}>
                        {activity.type === 'admin_like' ? 
                          <Heart className="h-4 w-4 text-rose-600" /> : 
                          <Zap className="h-4 w-4 text-amber-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(activity.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    {activity.type === 'admin_request_received' && (
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors shrink-0 ml-2" onClick={() => window.location.href = '/admin/matching'}>
                        Gérer le Match
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* COLONNE 2 : Les derniers inscrits */}
        <Card className="flex flex-col h-[600px] border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                20 derniers inscrits
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {recentUsers.length} profils
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Chargement des profils...</div>
              ) : recentUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Aucun inscrit pour le moment.</div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
                        {user.first_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {user.first_name}, {user.age} ans
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {user.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                        <Clock size={12} /> 
                        {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                      <Badge variant="outline" className="mt-1 text-[10px] py-0 border-blue-200 text-blue-600">Nouveau</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};