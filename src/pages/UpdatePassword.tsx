import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour.",
      });
      navigate("/login"); // Redirection vers la page de connexion
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFBFB] px-4">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-rose-50 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-50 rounded-full">
            <Lock className="text-primary" size={30} />
          </div>
        </div>
        
        <h1 className="text-2xl font-serif text-slate-900 mb-2">Nouveau mot de passe</h1>
        <p className="text-slate-500 text-sm mb-8">Choisissez un mot de passe sécurisé pour Timalove.</p>

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nouveau mot de passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-2xl h-12 border-slate-100"
              required 
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl bg-primary text-white font-bold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Mettre à jour"}
          </Button>
        </form>
      </div>
    </div>
  );
};