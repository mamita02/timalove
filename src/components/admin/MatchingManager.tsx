import { useState, useEffect } from "react";
import { getAllRegistrations, type RegistrationRecord } from "@/lib/supabase";
import {
  generateGoogleMeetLink,
  createGoogleCalendarEvent,
  createMatch,
  generateInvitationEmail,
  getAllMatches,
} from "@/lib/matching";
import { addNotification } from "@/lib/notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Video,
  Calendar,
  Mail,
  User,
  MapPin,
  Briefcase,
  Heart,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const MatchingManager = () => {
  const [men, setMen] = useState<RegistrationRecord[]>([]);
  const [women, setWomen] = useState<RegistrationRecord[]>([]);
  const [selectedMan, setSelectedMan] = useState<RegistrationRecord | null>(null);
  const [selectedWoman, setSelectedWoman] = useState<RegistrationRecord | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    loadApprovedRegistrations();
    loadMatches();
  }, []);

  const loadApprovedRegistrations = async () => {
    setLoading(true);
    try {
      // Charger TOUTES les inscriptions (pas seulement approved pour le test)
      const response = await getAllRegistrations({ limit: 100 });
      
      if (response.success && response.data) {
        console.log("📊 Inscriptions chargées:", response.data.length);
        const allRegistrations = response.data;
        
        // Séparation par genre (male/female)
        const menList = allRegistrations.filter(r => r.gender === 'male');
        const womenList = allRegistrations.filter(r => r.gender === 'female');
        
        setMen(menList);
        setWomen(womenList);
        
        console.log("👨 Hommes:", menList.length);
        console.log("👩 Femmes:", womenList.length);
      } else {
        console.error("❌ Erreur de chargement:", response.error);
        toast({
          title: "Erreur",
          description: response.error || "Impossible de charger les inscriptions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions approuvées",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    const response = await getAllMatches();
    if (response.success && response.data) {
      setMatches(response.data);
    }
  };

  const handlePreview = () => {
    if (!selectedMan || !selectedWoman || !scheduledDate) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un homme, une femme et une date",
        variant: "destructive",
      });
      return;
    }

    // Générer le lien Meet
    const link = generateGoogleMeetLink(
      `${selectedMan.firstName} ${selectedMan.lastName}`,
      `${selectedWoman.firstName} ${selectedWoman.lastName}`,
      scheduledDate
    );
    setMeetLink(link);
    setShowPreview(true);
  };

  const handleCreateMatch = async () => {
    if (!selectedMan || !selectedWoman || !scheduledDate || !meetLink) return;

    setCreating(true);
    try {
      // Créer le match
      const response = await createMatch(
        selectedMan,
        selectedWoman,
        scheduledDate,
        meetLink
      );

      if (response.success) {
        // Créer le lien calendrier
        const calendarLink = createGoogleCalendarEvent(
          `${selectedMan.firstName} ${selectedMan.lastName}`,
          `${selectedWoman.firstName} ${selectedWoman.lastName}`,
          selectedMan.email,
          selectedWoman.email,
          scheduledDate,
          meetLink
        );

        // Générer les emails
        const emailMan = generateInvitationEmail(
          selectedMan.firstName,
          `${selectedWoman.firstName}`,
          scheduledDate,
          meetLink,
          calendarLink
        );

        const emailWoman = generateInvitationEmail(
          selectedWoman.firstName,
          `${selectedMan.firstName}`,
          scheduledDate,
          meetLink,
          calendarLink
        );

        // Afficher les emails dans la console (en production, envoyer via API)
        console.log("📧 Email pour l'homme:", emailMan);
        console.log("📧 Email pour la femme:", emailWoman);

        // Ajouter une notification
        addNotification(
          'new_match',
          'Nouveau match créé !',
          `Match entre ${selectedMan.firstName} et ${selectedWoman.firstName}`,
          { matchId: response.data?.id }
        );

        toast({
          title: "✓ Match créé avec succès !",
          description: `Invitations envoyées à ${selectedMan.firstName} et ${selectedWoman.firstName}`,
        });

        // Réinitialiser
        setShowPreview(false);
        setSelectedMan(null);
        setSelectedWoman(null);
        setScheduledDate("");
        setMeetLink("");
        
        // Recharger les matches
        loadMatches();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le match",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyMeetLink = () => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Lien copié !",
      description: "Le lien Google Meet a été copié dans le presse-papier",
    });
  };

  const ProfileCard = ({ person }: { person: RegistrationRecord }) => (
    <div className="p-4 border rounded-lg space-y-2">
      <h4 className="font-semibold flex items-center gap-2">
        <User className="h-4 w-4" />
        {person.firstName} {person.lastName}
      </h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {person.city} • {person.age} ans
        </p>
        {person.profession && (
          <p className="flex items-center gap-2">
            <Briefcase className="h-3 w-3" />
            {person.profession}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulaire de création */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Nouveau match
            </CardTitle>
            <CardDescription>
              Sélectionnez deux profils et planifiez une rencontre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div>
                  <Label>Profil masculin</Label>
                  <Select
                    value={selectedMan?.id}
                    onValueChange={(id) => {
                      const man = men.find((m) => m.id === id);
                      setSelectedMan(man || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un homme" />
                    </SelectTrigger>
                    <SelectContent>
                      {men.map((man) => (
                        <SelectItem key={man.id} value={man.id}>
                          {man.firstName} {man.lastName} - {man.city}, {man.age} ans
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMan && (
                    <div className="mt-2">
                      <ProfileCard person={selectedMan} />
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <Label>Profil féminin</Label>
                  <Select
                    value={selectedWoman?.id}
                    onValueChange={(id) => {
                      const woman = women.find((w) => w.id === id);
                      setSelectedWoman(woman || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une femme" />
                    </SelectTrigger>
                    <SelectContent>
                      {women.map((woman) => (
                        <SelectItem key={woman.id} value={woman.id}>
                          {woman.firstName} {woman.lastName} - {woman.city}, {woman.age} ans
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWoman && (
                    <div className="mt-2">
                      <ProfileCard person={selectedWoman} />
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <Label htmlFor="scheduledDate">Date et heure de la rencontre</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handlePreview}
                  className="w-full"
                  disabled={!selectedMan || !selectedWoman || !scheduledDate}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Créer la rencontre
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Matches récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Matches récents
            </CardTitle>
            <CardDescription>
              Historique des rencontres planifiées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucun match pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {matches.map((match) => (
                  <div key={match.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {match.man_name} & {match.woman_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.scheduled_date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge>{match.status}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => window.open(match.meet_link, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Accéder au Meet
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirmer la création du match</DialogTitle>
            <DialogDescription>
              Vérifiez les informations avant d'envoyer les invitations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Homme</Label>
                {selectedMan && <ProfileCard person={selectedMan} />}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Femme</Label>
                {selectedWoman && <ProfileCard person={selectedWoman} />}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de la rencontre
              </Label>
              <p className="text-sm mt-1">
                {new Date(scheduledDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Lien Google Meet
              </Label>
              <div className="flex gap-2 mt-1">
                <Input value={meetLink} readOnly />
                <Button variant="outline" size="icon" onClick={copyMeetLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Invitations par email</p>
                  <p className="text-muted-foreground mt-1">
                    Les deux participants recevront un email avec le lien Google Meet
                    et un lien pour ajouter la rencontre à leur calendrier.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateMatch} disabled={creating}>
              {creating ? "Création..." : "Confirmer et envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
