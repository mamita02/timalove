import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Bell, Loader2, Lock, Save } from "lucide-react";
import { useState } from "react";

export const AdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // États pour le changement de mot de passe
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  // 1. Gérer les notifications (Simulation)
  const handleToggleNotif = () => {
    setEmailNotifications(!emailNotifications);
    toast({
      title: !emailNotifications ? "Notifications activées" : "Notifications désactivées",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  // 2. Changer le mot de passe (Vraie logique Supabase)
  const handleUpdatePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs.", variant: "destructive" });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }

    if (passwords.new.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit faire au moins 6 caractères.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });

      if (error) throw error;

      toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
      setPasswords({ new: "", confirm: "" }); // Réinitialiser les champs
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <div className="space-y-6 p-6 min-h-screen bg-[#FDFBFB]">
        
        {/* Titre */}
        <div>
          <h2 className="text-3xl font-serif font-semibold tracking-tight text-[#5F5751]">Paramètres</h2>
          <p className="text-muted-foreground mt-2">Gérez vos préférences et votre sécurité.</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
            
          {/* SECTION 1 : NOTIFICATIONS */}
          <Card className="border-[#F3E5E0] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="text-rose-400" />
                <CardTitle className="text-[#5F5751]">Notifications</CardTitle>
              </div>
              <CardDescription>Restez informé de l'activité sur TimaLove.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Alertes Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un email à chaque nouvelle inscription.
                  </p>
                </div>
                <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={handleToggleNotif} 
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 : SÉCURITÉ (Changer mot de passe) */}
          <Card className="border-[#F3E5E0] shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="text-rose-400" />
                <CardTitle className="text-[#5F5751]">Sécurité</CardTitle>
              </div>
              <CardDescription>Mettez à jour votre mot de passe administrateur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe 
                   </Label>
                <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                    onClick={handleUpdatePassword} 
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Mettre à jour
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    
  );
};