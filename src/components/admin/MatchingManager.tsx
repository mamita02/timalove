import {
  createGoogleCalendarEvent,
  createMatch,
  generateGoogleMeetLink,
  generateInvitationEmail,
  getAllMatches,
} from "@/lib/matching";
import { getAllRegistrations, type RegistrationRecord } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase,
  Calendar,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  User,
  Users,
  Video,
} from "lucide-react";

// Type enrichi avec statut premium
type MemberWithSubscription = RegistrationRecord & {
  isPremium: boolean;
};

export const MatchingManager = () => {
  const [men, setMen] = useState<MemberWithSubscription[]>([]);
  const [women, setWomen] = useState<RegistrationRecord[]>([]);
  const [selectedMan, setSelectedMan] = useState<MemberWithSubscription | null>(null);
  const [selectedWoman, setSelectedWoman] = useState<RegistrationRecord | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Filtres hommes
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');

  useEffect(() => {
    loadApprovedRegistrations();
    loadMatches();
  }, []);

  const loadApprovedRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getAllRegistrations({ limit: 100 });

      if (response.success && response.data) {
        const allRegistrations = response.data;

        const menList = allRegistrations.filter(r => r.gender === 'male');
        const womenList = allRegistrations.filter(r => r.gender === 'female');

        // Récupérer les statuts d'abonnement pour tous les hommes
        const menIds = menList.map(m => m.id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, subscription_status, subscription_end_date')
          .in('id', menIds);

        // Enrichir chaque homme avec son statut premium
        const menWithSub: MemberWithSubscription[] = menList.map(man => {
          const profile = profilesData?.find(p => p.id === man.id);
          const isPremium =
            profile?.subscription_status === 'active' &&
            profile?.subscription_end_date &&
            new Date(profile.subscription_end_date) > new Date();

          return { ...man, isPremium: !!isPremium };
        });

        setMen(menWithSub);
        setWomen(womenList);
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Impossible de charger les inscriptions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions",
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

  // Hommes filtrés selon le filtre actif
  const filteredMen = men.filter(man => {
    if (filterPremium === 'premium') return man.isPremium;
    if (filterPremium === 'free') return !man.isPremium;
    return true;
  });

  const premiumCount = men.filter(m => m.isPremium).length;
  const freeCount = men.filter(m => !m.isPremium).length;

  const handlePreview = () => {
    if (!selectedMan || !selectedWoman || !scheduledDate) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un homme, une femme et une date",
        variant: "destructive",
      });
      return;
    }

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
      const response = await createMatch(selectedMan, selectedWoman, scheduledDate, meetLink);

      if (response.success) {
        const calendarLink = createGoogleCalendarEvent(
          `${selectedMan.firstName} ${selectedMan.lastName}`,
          `${selectedWoman.firstName} ${selectedWoman.lastName}`,
          selectedMan.email,
          selectedWoman.email,
          scheduledDate,
          meetLink
        );

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

        console.log("📧 Email homme:", emailMan);
        console.log("📧 Email femme:", emailWoman);

        toast({
          title: "✓ Match créé avec succès !",
          description: `Invitations envoyées à ${selectedMan.firstName} et ${selectedWoman.firstName}`,
        });

        setShowPreview(false);
        setSelectedMan(null);
        setSelectedWoman(null);
        setScheduledDate("");
        setMeetLink("");
        loadMatches();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
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
    toast({ title: "Lien copié !" });
  };

  const ProfileCard = ({ person, showBadge = false }: { person: MemberWithSubscription | RegistrationRecord; showBadge?: boolean }) => (
    <div className="p-4 border rounded-lg space-y-2">
      <h4 className="font-semibold flex items-center gap-2">
        <User className="h-4 w-4" />
        {person.firstName} {person.lastName}
        {showBadge && 'isPremium' in person && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
            person.isPremium
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {person.isPremium ? <><Crown size={10} /> Premium</> : 'Gratuit'}
          </span>
        )}
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
                {/* ── SECTION HOMMES avec filtre premium ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Profil masculin</Label>
                    {/* Compteurs */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Crown size={11} /> {premiumCount} premium
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{freeCount} gratuit</span>
                    </div>
                  </div>

                  {/* Boutons filtre */}
                  <div className="flex gap-2 mb-3">
                    {(['all', 'premium', 'free'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilterPremium(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          filterPremium === f
                            ? f === 'premium'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : f === 'free'
                              ? 'bg-slate-600 text-white border-slate-600'
                              : 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {f === 'all' ? 'Tous' : f === 'premium' ? '👑 Premium' : 'Gratuit'}
                      </button>
                    ))}
                  </div>

                  <Select
                    value={selectedMan?.id}
                    onValueChange={(id) => {
                      const man = filteredMen.find((m) => m.id === id);
                      setSelectedMan(man || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un homme" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Groupe Premium */}
                      {filteredMen.some(m => m.isPremium) && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50">
                            <Crown size={11} /> Membres Premium
                          </div>
                          {filteredMen.filter(m => m.isPremium).map((man) => (
                            <SelectItem key={man.id} value={man.id}>
                              <span className="flex items-center gap-2">
                                <Crown size={12} className="text-amber-500" />
                                {man.firstName} {man.lastName} — {man.city}, {man.age} ans
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {/* Groupe Gratuit */}
                      {filteredMen.some(m => !m.isPremium) && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 mt-1">
                            Membres Gratuits
                          </div>
                          {filteredMen.filter(m => !m.isPremium).map((man) => (
                            <SelectItem key={man.id} value={man.id}>
                              {man.firstName} {man.lastName} — {man.city}, {man.age} ans
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedMan && (
                    <div className="mt-2">
                      <ProfileCard person={selectedMan} showBadge />
                    </div>
                  )}
                </div>

                <Separator />

                {/* ── SECTION FEMMES (inchangée) ── */}
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
                          {woman.firstName} {woman.lastName} — {woman.city}, {woman.age} ans
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
            <CardDescription>Historique des rencontres planifiées</CardDescription>
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
                {selectedMan && <ProfileCard person={selectedMan} showBadge />}
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
