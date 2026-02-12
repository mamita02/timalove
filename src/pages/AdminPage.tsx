import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import nécessaire pour la redirection

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // 1. Vérification des droits Admin
  const checkIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins') 
        .select('id')       
        .eq('id', userId)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  // 2. Si déjà connecté, on redirige directement vers les inscriptions
  useEffect(() => {
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isAdmin = await checkIsAdmin(session.user.id);
        if (isAdmin) {
          navigate("/admin/inscriptions", { replace: true });
        }
      }
      setLoading(false);
    };
    checkCurrentSession();
  }, [navigate]);

  // 3. Gestion du formulaire de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
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
      const adminStatus = await checkIsAdmin(data.user.id);
      
      if (adminStatus) {
        toast({ title: "Bienvenue Mame Faatu", description: "Connexion réussie." });
        // REDIRECTION VERS L'INTERFACE ADMIN
        navigate("/admin/inscriptions", { replace: true });
      } else {
        toast({ 
          title: "Accès refusé", 
          description: "Ce compte n'est pas répertorié comme admin.", 
          variant: "destructive" 
        });
        setAuthLoading(false);
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F5EEFA]">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

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
};

export default AdminPage;