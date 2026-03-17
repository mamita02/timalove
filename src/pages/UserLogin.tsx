import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserLogin = () => {
  const [identifier, setIdentifier] = useState(""); // email ou téléphone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isResetMode, setIsResetMode] = useState(false);

  // Retrouve l'email associé à un identifiant (email ou téléphone)
  const resolveEmail = async (id: string): Promise<string> => {
    if (id.includes('@')) return id.trim().toLowerCase();
    const phoneClean = id.replace(/\s+/g, '');
    const { data: reg } = await supabase
      .from('registrations')
      .select('email')
      .or(`phone.eq.${phoneClean},phone.eq.${id.trim()},phone.ilike.%${phoneClean}%`)
      .maybeSingle();
    return reg?.email ?? `${phoneClean}@tima-love.com`;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = await resolveEmail(identifier);
      if (email.endsWith('@tima-love.com')) {
        toast({ title: "Impossible", description: "Vous n'avez pas d'email, contactez l'administrateur.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
      setIsResetMode(false);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      let emailForAuth: string;

      if (isEmail) {
        emailForAuth = identifier.trim().toLowerCase();
      } else {
        // Téléphone → chercher l'email réel dans registrations
        // Cherche avec le numéro tel quel ET sans espaces pour compatibilité
        const phoneClean = identifier.replace(/\s+/g, '');
        const { data: reg } = await supabase
          .from('registrations')
          .select('email')
          .or(`phone.eq.${phoneClean},phone.eq.${identifier.trim()},phone.ilike.%${phoneClean}%`)
          .maybeSingle();

        // Si l'utilisateur avait un vrai email → l'utiliser, sinon faux email généré
        emailForAuth = (reg?.email) ? reg.email : `${phoneClean}@tima-love.com`;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password,
      });
      if (authError) throw new Error("Identifiant ou mot de passe incorrect.");

      // 2. Vérification du statut d'approbation
      const { data: profile, error: dbError } = await supabase
        .from('registrations')
        .select('status, first_name')
        .eq('id', authData.user.id)
        .single();

      if (dbError || profile?.status !== 'approved') {
        await supabase.auth.signOut();
        toast({
          title: "Compte non activé",
          description: "Votre inscription est en attente de validation ou a été refusée.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: `Bienvenue ${profile.first_name} !`,
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
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email ou Téléphone</label>
            <Input 
              type="text" 
              placeholder="Email ou numéro de téléphone" 
              value={identifier} 
              onChange={(e) => setIdentifier(e.target.value)} 
              className="rounded-2xl h-12 border-slate-100 focus:border-primary"
              required 
            />
          </div>
          
          {!isResetMode && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 ml-1">Mot de passe</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="rounded-2xl h-12 border-slate-100 focus:border-primary"
                required 
              />
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

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Pas encore inscrit ?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-primary font-semibold hover:underline"
            >
              S'inscrire ici
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};