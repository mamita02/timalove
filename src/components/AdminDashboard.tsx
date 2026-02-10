import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea"; // Probablement celui qui manque
import { toast } from "@/hooks/use-toast";
import { getAllRegistrations, supabase } from "@/lib/supabase"; // Ajout de supabase ici
import { Camera, Edit3, Globe, ImagePlus, Loader2, LogOut, Mail, MapPin, Phone, Trash2, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Modifie ta ligne d'import existante :


export const InscriptionsManager = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [searchCountry, setSearchCountry] = useState("");
  const [searchReligion, setSearchReligion] = useState("");
  const [searchAge, setSearchAge] = useState("");
  const navigate = useNavigate();
  // ... tes autres useState
const [uploading, setUploading] = useState(false); // <--- AJOUTE ÇA

  // --- 1. CHARGEMENT DES DONNÉES ---
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getAllRegistrations({ limit: 500 });
      if (response.success && response.data) {
        setRegistrations(response.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // --- 2. LOGIQUE DE FILTRAGE (Déclarée avant les stats) ---
  const filteredRegistrations = registrations.filter((reg) => {
    const matchCountry = reg.country?.toLowerCase().includes(searchCountry.toLowerCase()) || 
                         reg.residenceCountry?.toLowerCase().includes(searchCountry.toLowerCase());
    const matchReligion = reg.religion?.toLowerCase().includes(searchReligion.toLowerCase());
    const matchAge = searchAge ? reg.age?.toString() === searchAge : true;
    return matchCountry && matchReligion && matchAge;
  });

  const stats = {
    total: registrations.length,
    visible: filteredRegistrations.length,
  };

  // --- 3. ACTIONS (Déconnexion, Suppression, Modification) ---
  const handleLogout = async () => {
    try {
      // 1. On déconnecte de la base de données
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. On affiche le message
      toast({ 
        title: "Déconnexion réussie",
        description: "À bientôt !" 
      });

      // 3. On redirige vers la page de connexion
      navigate("/login"); 
      
    } catch (error) {
      console.error("Erreur:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de se déconnecter", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;
        setRegistrations(prev => prev.filter(reg => reg.id !== id));
        setSelectedReg(null);
        toast({ title: "Utilisateur supprimé" });
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (reg: any) => {
    setEditForm({ ...reg });
    setIsEditing(true);
  };
 
  // --- GESTION DES PHOTOS (Upload) ---
  const handleUpload = async (e: any, column: string) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `admin-uploads/${fileName}`;

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('registration-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. URL Publique
      const { data: { publicUrl } } = supabase.storage
        .from('registration-photos')
        .getPublicUrl(filePath);

      // 3. Mise à jour du formulaire local
      setEditForm((prev: any) => ({ ...prev, [column]: publicUrl }));
      toast({ title: "Photo chargée", description: "Pensez à enregistrer." });

    } catch (error) {
      console.error("Erreur upload:", error);
      toast({ title: "Erreur", description: "Impossible d'envoyer la photo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (column: string) => {
    setEditForm((prev: any) => ({ ...prev, [column]: null }));
  };
  
  const saveChanges = async () => {
    if (!editForm || !editForm.id) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          // Identité
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone: editForm.phone,
          
          // Détails
          city: editForm.city,
          age: parseInt(editForm.age) || null, // Gère le cas où l'âge est vide
          country: editForm.country,
          residence_country: editForm.residenceCountry, // Important: mappé vers residence_country en base
          religion: editForm.religion,
          
          // Textes longs
          presentation: editForm.presentation,
          looking_for: editForm.lookingFor, // Important: mappé vers looking_for en base
          
          // Les 3 Photos
          photo_url: editForm.photo_url,
          photo_url_2: editForm.photo_url_2,
          photo_url_3: editForm.photo_url_3,
        })
        .eq('id', editForm.id);

      if (error) throw error;

      // Mise à jour de l'affichage local (pour ne pas avoir à recharger la page)
      setRegistrations(prev => prev.map(r => r.id === editForm.id ? { ...r, ...editForm } : r));
      
      // Mise à jour de la modale ouverte
      setSelectedReg({ ...selectedReg, ...editForm });
      
      setIsEditing(false);
      toast({ title: "Profil mis à jour avec succès" });
    } catch (err: any) {
      console.error("Erreur save:", err);
      toast({ title: "Erreur", description: "La sauvegarde a échoué.", variant: "destructive" });
    }
  };
  return (
    <div className="space-y-6">
  {/* HEADER AVEC BOUTON DÉCONNEXION */}
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-serif font-semibold tracking-tight">Inscriptions</h2>
      <p className="text-muted-foreground mt-2">Gérer les inscriptions</p>
    </div>
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 border-red-100"
    >
      <LogOut size={18} />
      Déconnexion
    </Button>
  </div>

  {/* --- BLOC STATISTIQUES DYNAMIQUES (4 CARTES ALIGNÉES) --- */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {/* Carte 1 : Total Filtré */}
    <Card className="border-[#F3E5E0] shadow-sm bg-white">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-[#8B7E74]">Total</p>
        <h3 className="text-3xl font-serif mt-2 font-bold text-[#5F5751]">
          {filteredRegistrations.length}
        </h3>
      </CardContent>
    </Card>

    {/* Carte 2 : En attente (parmi les filtrés) */}
    <Card className="border-[#F3E5E0] shadow-sm bg-white">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-[#8B7E74]">En attente</p>
        <h3 className="text-3xl font-serif mt-2 font-bold text-orange-400">
          {filteredRegistrations.filter(r => r.status === 'pending' || r.status === 'En attente').length}
        </h3>
      </CardContent>
    </Card>

    {/* Carte 3 : Approuvées (parmi les filtrés) */}
    <Card className="border-[#F3E5E0] shadow-sm bg-white">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-[#8B7E74]">Approuvées</p>
        <h3 className="text-3xl font-serif mt-2 font-bold text-green-600">
          {filteredRegistrations.filter(r => r.status === 'approved' || r.status === 'Approuvé').length}
        </h3>
      </CardContent>
    </Card>

    {/* Carte 4 : Rejetées (parmi les filtrés) */}
    <Card className="border-[#F3E5E0] shadow-sm bg-white">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-[#8B7E74]">Rejetées</p>
        <h3 className="text-3xl font-serif mt-2 font-bold text-red-600">
          {filteredRegistrations.filter(r => r.status === 'rejected' || r.status === 'Rejeté').length}
        </h3>
      </CardContent>
    </Card>
  </div>

  {/* FILTRES DE RECHERCHE */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="relative">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D48B8B]" size={18} />
      <Input 
        placeholder="Filtrer par pays..." 
        value={searchCountry}
        onChange={(e) => setSearchCountry(e.target.value)}
        className="pl-10 rounded-2xl border-[#F3E5E0] focus-visible:ring-[#D48B8B]"
      />
    </div>
    <div className="relative">
      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D48B8B]" size={18} />
      <Input 
        placeholder="Filtrer par religion..." 
        value={searchReligion}
        onChange={(e) => setSearchReligion(e.target.value)}
        className="pl-10 rounded-2xl border-[#F3E5E0] focus-visible:ring-[#D48B8B]"
      />
    </div>
    <div className="relative">
      <Input 
        type="number"
        placeholder="Âge précis..." 
        value={searchAge}
        onChange={(e) => setSearchAge(e.target.value)}
        className="rounded-2xl border-[#F3E5E0] focus-visible:ring-[#D48B8B]"
      />
    </div>
  </div>

     <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Prenom & Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pays/Ville</TableHead>
                    <TableHead>Âge</TableHead>
                    <TableHead>Religion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReg(reg)}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border">
                          {reg.photo_url ? (
                            <img src={reg.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-2 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                      {reg.firstName} {reg.lastName}
                     </TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.country || 'Sénégal'}, {reg.city}</TableCell>
                      <TableCell>{reg.age} ans</TableCell>
                      <TableCell>{reg.religion}</TableCell>
                      <TableCell><Button size="sm" variant="ghost">Voir</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG DE DÉTAIL */}
<Dialog open={!!selectedReg} onOpenChange={() => { 
  setSelectedReg(null); 
  setIsEditing(false); 
}}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white rounded-3xl border-[#F3E5E0]">
    <DialogHeader className="border-b border-[#F3E5E0] pb-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#F3E5E0] shadow-sm">
          {selectedReg?.photo_url ? (
            <img src={selectedReg.photo_url} className="w-full h-full object-cover" alt="Profil" />
          ) : (
            <User className="w-full h-full p-4 text-muted-foreground bg-[#FDF8F5]" />
          )}
        </div>
        <div className="text-left">
          <DialogTitle className="text-2xl font-serif text-[#D48B8B]">
            {isEditing ? "Modifier le profil" : `${selectedReg?.firstName} ${selectedReg?.lastName}`}
          </DialogTitle>
          <DialogDescription className="text-[#8B7E74]">
            Membre inscrit le {selectedReg && new Date(selectedReg.createdAt || selectedReg.created_at).toLocaleDateString()}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>

    {selectedReg && (
      <div className="py-4">
        {isEditing ? (
         /* --- MODE ÉDITION COMPLET --- */
      <div className="space-y-6">
        {/* --- ZONE PHOTOS (Nouvelle version) --- */}
<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
  <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
    <ImagePlus size={16} /> Photos du profil
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* PHOTO 1 (Principale) */}
    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-white group">
      {(isEditing ? editForm?.photo_url : selectedReg.photo_url) ? (
        <img src={isEditing ? editForm.photo_url : selectedReg.photo_url} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><User size={32} /></div>
      )}
      {isEditing && (
        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
          <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, 'photo_url')} />
          <Camera className="text-white" />
        </label>
      )}
    </div>

    {/* PHOTO 2 */}
    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-white group">
      {(isEditing ? editForm?.photo_url_2 : selectedReg.photo_url_2) ? (
        <>
          <img src={isEditing ? editForm.photo_url_2 : selectedReg.photo_url_2} className="w-full h-full object-cover" />
          {isEditing && <button onClick={() => removePhoto('photo_url_2')} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"><X size={12}/></button>}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">Photo 2</div>
      )}
      {isEditing && (
        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
          <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, 'photo_url_2')} />
          <Camera className="text-white" />
        </label>
      )}
    </div>

    {/* PHOTO 3 */}
    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-white group">
      {(isEditing ? editForm?.photo_url_3 : selectedReg.photo_url_3) ? (
        <>
          <img src={isEditing ? editForm.photo_url_3 : selectedReg.photo_url_3} className="w-full h-full object-cover" />
          {isEditing && <button onClick={() => removePhoto('photo_url_3')} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full z-10"><X size={12}/></button>}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">Photo 3</div>
      )}
      {isEditing && (
        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
          <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, 'photo_url_3')} />
          <Camera className="text-white" />
        </label>
      )}
    </div>
  </div>
</div>
{/* --- FIN ZONE PHOTOS --- */}
        {/* Prénom & Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#8B7E74]">Prénom</label>
            <Input 
              value={editForm?.firstName || ''} 
              onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} 
              className="rounded-xl border-[#F3E5E0] focus:ring-[#D48B8B]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-[#8B7E74]">Nom</label>
            <Input 
              value={editForm?.lastName || ''} 
              onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} 
              className="rounded-xl border-[#F3E5E0] focus:ring-[#D48B8B]"
            />
          </div>
        </div>

  {/* Email & Téléphone */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Email</label>
      <Input 
        type="email"
        value={editForm?.email || ''} 
        onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Téléphone</label>
      <Input 
        value={editForm?.phone || ''} 
        onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
  </div>

  {/* Ville & Âge & Religion */}
  <div className="grid grid-cols-3 gap-4">
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Ville</label>
      <Input 
        value={editForm?.city || ''} 
        onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Âge</label>
      <Input 
        type="number"
        value={editForm?.age || ''} 
        onChange={(e) => setEditForm({...editForm, age: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Religion</label>
      <Input 
        value={editForm?.religion || ''} 
        onChange={(e) => setEditForm({...editForm, religion: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
  </div>

  {/* Pays Origine & Pays Résidence */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Pays d'Origine</label>
      <Input 
        value={editForm?.country || ''} 
        onChange={(e) => setEditForm({...editForm, country: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-[#8B7E74]">Pays de Résidence</label>
      <Input 
        value={editForm?.residenceCountry || ''} 
        onChange={(e) => setEditForm({...editForm, residenceCountry: e.target.value})} 
        className="rounded-xl border-[#F3E5E0]"
      />
    </div>
  </div>

  {/* Présentation */}
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase text-[#8B7E74]">Présentation</label>
    <Textarea 
      value={editForm?.presentation || ''} 
      onChange={(e) => setEditForm({...editForm, presentation: e.target.value})} 
      className="rounded-xl border-[#F3E5E0] min-h-[100px]"
    />
  </div>

  {/* Recherche */}
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase text-[#8B7E74]">Ce qu'il/elle recherche</label>
    <Textarea 
      value={editForm?.lookingFor || editForm?.looking_research || ''} 
      onChange={(e) => setEditForm({...editForm, lookingFor: e.target.value})} 
      className="rounded-xl border-[#F3E5E0] min-h-[80px]"
    />
  </div>

  {/* Boutons d'action */}
  <div className="flex gap-3 pt-6 border-t border-[#F3E5E0]">
    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(false)}>
      Annuler
    </Button>
    <Button className="flex-1 bg-[#D48B8B] hover:bg-[#B56B6B] text-white rounded-xl font-bold" onClick={saveChanges}>
      Enregistrer les modifications
    </Button>
  </div>
</div>
        ) : (
          /* --- MODE LECTURE --- */
          <div className="space-y-6">
            <div className="flex items-center justify-end bg-[#FDF8F5] p-3 rounded-xl border border-[#F9E8E2]">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-[#8B7E74] tracking-widest">Sexe</p>
                <p className="text-sm font-medium flex items-center gap-2 text-[#5F5751]">
                  <Users size={16} className="text-[#D48B8B]" /> 
                  {selectedReg.gender === 'female' || selectedReg.gender === 'femme' ? 'Femme' : 'Homme'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#F3E5E0] rounded-2xl bg-white shadow-sm">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-2 mb-1"><Mail size={14} className="text-[#D48B8B]" /> Email</p>
                <p className="text-sm font-medium text-[#5F5751] truncate">{selectedReg.email}</p>
              </div>
              <div className="p-4 border border-[#F3E5E0] rounded-2xl bg-white shadow-sm">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-2 mb-1"><Phone size={14} className="text-[#D48B8B]" /> Téléphone</p>
                <p className="text-sm font-medium text-[#5F5751]">{selectedReg.phone || 'Non renseigné'}</p>
              </div>
            </div>

            {/* Grille d'infos détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#FDF8F5] rounded-xl border border-[#F9E8E2]">
                <p className="text-xs font-bold text-[#8B7E74] uppercase">Âge</p>
                <p className="text-sm font-semibold text-[#5F5751]">{selectedReg.age} ans</p>
              </div>
              <div className="p-3 bg-[#FDF8F5] rounded-xl border border-[#F9E8E2]">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-1"><MapPin size={14} /> Ville</p>
                <p className="text-sm font-semibold text-[#5F5751]">{selectedReg.city}</p>
              </div>
              <div className="p-3 bg-[#FDF8F5] rounded-xl border border-[#F9E8E2]">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-1"><Globe size={14} /> Origine</p>
                <p className="text-sm font-semibold text-[#5F5751]">{selectedReg.country || 'Sénégal'}</p>
              </div>
              <div className="p-3 bg-[#FDF8F5] rounded-xl border border-[#F9E8E2]">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-1"><MapPin size={14} /> Résidence</p>
                <p className="text-sm font-semibold text-[#5F5751]">{selectedReg.residenceCountry || selectedReg.country || 'Sénégal'}</p>
              </div>
              <div className="p-3 bg-[#FDF8F5] rounded-xl border border-[#F9E8E2] col-span-2 md:col-span-1">
                <p className="text-xs font-bold text-[#8B7E74] uppercase flex items-center gap-1"><Globe size={14} /> Religion</p>
                <p className="text-sm font-semibold text-[#5F5751]">{selectedReg.religion || 'Non renseigné'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#8B7E74] uppercase mb-2 tracking-widest">Présentation du profil</p>
                <div className="bg-[#FDF8F5]/50 rounded-2xl p-4 border border-dashed border-[#F3E5E0]">
                  <p className="text-sm text-[#5F5751] italic leading-relaxed">"{selectedReg.presentation || 'Aucune présentation fournie'}"</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-[#8B7E74] uppercase mb-2 tracking-widest">Ce qu'il/elle recherche</p>
                <div className="bg-[#FDF8F5]/50 rounded-2xl p-4 border border-dashed border-[#F3E5E0]">
                  <p className="text-sm text-[#5F5751]">{selectedReg.lookingFor || selectedReg.looking_research || 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-[#F3E5E0] mt-6">
              <Button 
                variant="outline" 
                onClick={() => handleEdit(selectedReg)}
                className="flex-1 rounded-xl border-[#F3E5E0] text-[#5F5751] hover:bg-[#FDF8F5] gap-2"
              >
                <Edit3 size={16} /> Modifier le profil
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => handleDelete(selectedReg.id)}
                className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl gap-2"
              >
                <Trash2 size={16} /> Supprimer définitivement
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
  </div>
  
);
};