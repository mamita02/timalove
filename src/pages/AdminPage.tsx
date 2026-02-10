import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";

// Import de tes composants
import { InscriptionsManager } from "@/components/AdminDashboard";
import { AdminLayout } from "../components/admin/AdminLayout";

const AdminPage = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ---------------------------------------------------------
  // 1. CORRECTION MAJEURE ICI : On vérifie la table 'admins'
  // ---------------------------------------------------------
  const checkIsAdmin = async (userId: string) => {
    try {
      console.log("Vérification des droits pour :", userId);

      // On regarde si l'ID existe dans la table 'admins'
      const { data, error } = await supabase
        .from('admins') 
        .select('id')       
        .eq('id', userId)
        .single();

      // Si erreur ou pas de données, c'est que ce n'est pas un admin
      if (error || !data) {
        console.error("Accès refusé : Utilisateur non présent dans la table admins");
        await supabase.auth.signOut(); // On déconnecte par sécurité
        setIsAdmin(false);
        setSession(null);
        return false;
      }

      console.log("Accès Admin validé !");
      setIsAdmin(true);
      return true;
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setIsAdmin(false);
      return false;
    }
  };

  // 2. Gestion de la session au chargement de la page
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const adminStatus = await checkIsAdmin(session.user.id);
        if (adminStatus) setSession(session);
      }
      setLoading(false);
    };

    initializeAuth();

    // Écoute les changements de connexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (currentSession) {
        const adminStatus = await checkIsAdmin(currentSession.user.id);
        if (adminStatus) {
          setSession(currentSession);
        } else {
            setSession(null);
        }
      } else {
        setSession(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Gestion du formulaire de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    // Connexion Auth classique (Email/Mot de passe)
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      toast({ 
        title: "Erreur de connexion", 
        description: "Email ou mot de passe incorrect.", 
        variant: "destructive" 
      });
      setAuthLoading(false);
      return;
    } 
    
    if (data.user) {
      // Une fois logué, on vérifie si c'est bien un ADMIN via notre fonction corrigée
      const adminStatus = await checkIsAdmin(data.user.id);
      
      if (adminStatus) {
        toast({ title: "Bienvenue Mame Faatu", description: "Connexion administrateur réussie." });
      } else {
        toast({ 
          title: "Accès refusé", 
          description: "Ce compte n'a pas les droits d'administration.", 
          variant: "destructive" 
        });
      }
    }
    setAuthLoading(false);
  };

  // --- RENDU ---

  // Écran de chargement initial
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F5EEFA]">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  // CAS 1 : PAS CONNECTÉ OU PAS ADMIN -> Formulaire de connexion
  if (!session || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5EEFA] px-4">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-white animate-fade-up">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="text-primary" size={30} />
            </div>
          </div>
          <h1 className="text-3xl font-serif text-primary text-center mb-8">Espace Privé</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email Admin" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="rounded-xl h-12"
              required 
            />
            <Input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-xl h-12"
              required 
            />
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-lg hover:bg-primary/90" disabled={authLoading}>
              {authLoading ? <Loader2 className="animate-spin" /> : "Entrer"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // CAS 2 : CONNECTÉ ET ADMIN -> Tableau de bord
  return (
    <AdminLayout>
      <div className="p-6">
        <InscriptionsManager />
      </div>
    </AdminLayout>
  );
};

export default AdminPage;