import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);

// 2. Ajoute cette fonction pour gérer la demande de reset
const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Remplace par l'URL de ta page où l'utilisateur pourra définir son nouveau mot de passe
    redirectTo: `${window.location.origin}/update-password`,
  });

  if (error) {
    toast({ title: "Erreur", description: error.message, variant: "destructive" });
  } else {
    toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
    setIsResetMode(false); // Retour au login
  }
  setLoading(false);
};
 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authentification Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Email ou mot de passe incorrect.");

      // 2. Vérification du statut d'approbation
      const { data: profile, error: dbError } = await supabase
        .from('registrations')
        .select('status, first_name') // ✅ Changé 'firstName' en 'first_name' pour correspondre au SQL
        .eq('email', email)
        .single();

      if (dbError || profile?.status !== 'approved') {
        // ❌ Déconnexion si non approuvé
        await supabase.auth.signOut();
        toast({
          title: "Compte non activé",
          description: "Votre inscription est en attente de validation ou a été refusée.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // ✅ Succès !
      toast({
        title: `Bienvenue ${profile.first_name} !`, // ✅ Utilisation de first_name ici aussi
        description: "Connexion réussie.",
      });
      navigate("/profile");

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFBFB] px-4">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-rose-50 animate-fade-up text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-50 rounded-full">
            <Heart className="text-primary fill-primary" size={30} />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Bienvenue sur Timalove</h1>
        <p className="text-slate-500 text-sm mb-8">Connectez-vous pour voir vos matchs</p>

       <form onSubmit={isResetMode ? handleForgotPassword : handleLogin} className="space-y-4 text-left">
  {/* Le champ Email reste toujours là */}
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email</label>
    <Input 
      type="email" 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      className="rounded-2xl h-12"
      required 
    />
  </div>
  
  {/* Le champ Mot de passe n'apparaît que si on n'est pas en mode reset */}
  {!isResetMode && (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-slate-400 ml-1">Mot de passe</label>
      <Input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="rounded-2xl h-12"
        required 
      />
      {/* Lien "Mot de passe oublié" */}
      <button 
        type="button"
        onClick={() => setIsResetMode(true)}
        className="text-xs text-primary hover:underline ml-1"
      >
        Mot de passe oublié ?
      </button>
    </div>
  )}

  <Button type="submit" className="w-full h-12 rounded-2xl bg-primary text-white font-bold mt-4" disabled={loading}>
    {loading ? <Loader2 className="animate-spin" /> : (isResetMode ? "Envoyer le lien" : "Se connecter")}
  </Button>
  
  {isResetMode && (
    <button type="button" onClick={() => setIsResetMode(false)} className="w-full text-sm text-slate-400">
      Retour à la connexion
    </button>
  )}
</form>
      </div>
    </div>
  );
};