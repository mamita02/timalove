import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
    Bell,
    Database,
    Globe,
    Mail,
    Palette,
    Save,
    Shield
} from "lucide-react";

export const AdminSettings = () => {
  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-serif font-semibold tracking-tight">
          Paramètres
        </h2>
        <p className="text-muted-foreground mt-2">
          Configuration de la plateforme
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configuration générale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuration générale
            </CardTitle>
            <CardDescription>
              Paramètres principaux de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                defaultValue="TimaLove Match"
                placeholder="Nom de votre site"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteUrl">URL du site</Label>
              <Input
                id="siteUrl"
                type="url"
                defaultValue="https://timalove.com"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input
                id="contactEmail"
                type="email"
                defaultValue="contact@timalove.com"
                placeholder="contact@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Base de données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase
            </CardTitle>
            <CardDescription>
              Configuration de la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="supabaseUrl">Supabase URL</Label>
              <Input
                id="supabaseUrl"
                type="url"
                defaultValue={import.meta.env.VITE_SUPABASE_URL || "Non configuré"}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configuré via les variables d'environnement (.env)
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Statut de la connexion</Label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Connecté</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérer les notifications et alertes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouvelles inscriptions</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir une notification pour chaque nouvelle inscription
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes système</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications pour les erreurs et problèmes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rapport quotidien</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir un résumé quotidien par email
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuration Email
            </CardTitle>
            <CardDescription>
              Paramètres d'envoi d'emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email de confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer un email après chaque inscription
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email d'approbation</Label>
                <p className="text-sm text-muted-foreground">
                  Notifier quand une inscription est approuvée
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et protection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Row Level Security (RLS)</Label>
                <p className="text-sm text-muted-foreground">
                  Protection des données au niveau de Supabase
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification requise</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger une authentification pour l'admin
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation manuelle</Label>
                <p className="text-sm text-muted-foreground">
                  Toutes les inscriptions doivent être approuvées
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisation de l'interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le thème sombre
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};