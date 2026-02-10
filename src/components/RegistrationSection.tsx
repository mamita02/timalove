import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Camera, Check, Loader2 } from "lucide-react"; // Ajout de AlertCircle
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

// UI Components
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

// 1. Schéma de validation
const registrationSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  gender: z.enum(["male", "female"], { 
    required_error: "Veuillez sélectionner votre sexe" 
  }),
  religion: z.enum(["Musulmane", "Chrétienne"], {
    required_error: "Veuillez sélectionner votre religion" 
  }),
  country: z.enum(["Sénégal", "France"], { 
    required_error: "Veuillez sélectionner un pays" 
  }),
  residence_country: z.string().min(2, "Le pays de résidence est requis"),
  phone: z.string().min(9, "Numéro trop court"),
  age: z.coerce.number().min(18, "18 ans minimum").max(99),
  city: z.string().min(2, "La ville est requise"),
  presentation: z.string().min(50, "50 caractères minimum"),
  lookingFor: z.string().min(30, "30 caractères minimum"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const RegistrationSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false); // État pour l'erreur photo
  const navigate = useNavigate();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      age: undefined,
      city: "",
      presentation: "",
      lookingFor: "",
      country: "Sénégal",
      residence_country: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPhotoError(false); // Enlève l'erreur dès qu'une photo est choisie
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // 1. VÉRIFICATION PHOTO OBLIGATOIRE
    if (!photoFile) {
      setPhotoError(true);
      toast({
        title: "Photo manquante",
        description: "Une photo de profil est obligatoire pour l'inscription.",
        variant: "destructive",
      });
      // On remonte en haut de page pour montrer l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      let photoUrl = "";

      // 2. Upload de la photo (Maintenant garanti qu'elle existe grâce au if au-dessus)
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('registration-photos')
        .upload(filePath, photoFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('registration-photos')
        .getPublicUrl(filePath);
      
      photoUrl = urlData.publicUrl;

      // 3. CRÉATION DU COMPTE AUTH
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // 4. INSERTION DANS LA TABLE DES PROFILS
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('registrations')
          .insert([
            {
              id: authData.user.id,
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone: data.phone,
              age: data.age,
              city: data.city,
              gender: data.gender,
              religion: data.religion,
              country: data.country,
              residence_country: data.residence_country,
              photo_url: photoUrl, // C'est cette URL qui sera utilisée
              presentation: data.presentation,
              looking_for: data.lookingFor,
              status: 'approved',
            }
          ]);

        if (dbError) throw dbError;

        toast({ 
          title: "Inscription réussie !", 
          description: "Bienvenue sur TimaLove." 
        });
        navigate("/login");
      }

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
    <section id="inscription" className="relative w-full min-h-screen flex items-center justify-center py-12 overflow-hidden">
      
      {/* ARRIÈRE-PLAN */}
      <div className="absolute inset-0 z-0">
        <img
          src="src/assets/paysagerencontre.png" 
          alt="Fond TimaLove"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto"> 
          
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-2 drop-shadow-lg">
              Rejoignez TimaLove
            </h2>
          </div>

          <div className="w-full bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/20">
            <header className="mb-6 text-center">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-1 block">
                Inscription Privée
              </span>
              <h3 className="font-serif text-2xl text-slate-900">Créez votre profil</h3>
              
              {/* --- PHOTO DE PROFIL OBLIGATOIRE --- */}
              <div className="flex flex-col items-center justify-center mt-6 space-y-2">
                <div className="relative group">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    {/* Ajout d'une bordure rouge si erreur */}
                    <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-white hover:border-primary transition-all shadow-md ${photoError ? 'border-red-500 bg-red-50' : 'border-primary/30'}`}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className={`w-6 h-6 ${photoError ? 'text-red-400' : 'text-slate-300'}`} />
                      )}
                    </div>
                  </Label>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  
                  {previewUrl && (
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 shadow-md border-2 border-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  {photoError && !previewUrl && (
                    <div className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md border-2 border-white">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-tighter ${photoError ? 'text-red-500' : 'text-slate-400'}`}>
                  Photo de profil (Obligatoire) *
                </span>
              </div>
              {/* --- FIN PHOTO --- */}

            </header>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* GRILLE DE CHAMPS */}
                <div className="space-y-4">
                  
                  {/* LIGNE 1 : IDENTITÉ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Prénom</Label>
                        <FormControl><Input placeholder="Prénom" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Nom</Label>
                        <FormControl><Input placeholder="Nom" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Âge</Label>
                        <FormControl><Input type="number" placeholder="25" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* LIGNE 2 : CONTACT & GENRE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Email</Label>
                        <FormControl><Input type="email" placeholder="Email" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Téléphone</Label>
                        <FormControl><Input placeholder="Numéro" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Sexe</Label>
                        <select {...field} className="w-full h-10 rounded-xl border-slate-200 bg-white text-sm px-3 outline-none">
                          <option value="">Sexe...</option>
                          <option value="male">Homme</option>
                          <option value="female">Femme</option>
                        </select>
                      </FormItem>
                    )} />
                  </div>

                  {/* LIGNE 3 : RELIGION & MDP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField control={form.control} name="religion" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Religion</Label>
                        <select {...field} className="w-full h-10 rounded-xl border-slate-200 bg-white text-sm px-3 outline-none">
                          <option value="">Choisir...</option>
                          <option value="Musulmane">Musulmane</option>
                          <option value="Chrétienne">Chrétienne</option>
                        </select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Mot de passe</Label>
                        <FormControl><Input type="password" placeholder="••••••••" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  {/* LIGNE 4 : LOCALISATION */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Origine</Label>
                        <select {...field} className="w-full h-10 rounded-xl border-slate-200 bg-white text-sm px-3">
                          <option value="Sénégal">Sénégal</option>
                          <option value="France">France</option>
                        </select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="residence_country" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Résidence</Label>
                        <FormControl><Input placeholder="Pays" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Ville</Label>
                        <FormControl><Input placeholder="Ville" className="h-10 border-slate-200 rounded-xl" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  {/* TEXTAREAS SUR 2 COLONNES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <FormField control={form.control} name="presentation" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Moi en quelques mots</Label>
                        <FormControl><Textarea placeholder="..." className="min-h-[80px] border-slate-200 rounded-xl text-sm" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lookingFor" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-[10px] uppercase text-slate-400 ml-1">Mon partenaire idéal</Label>
                        <FormControl><Textarea placeholder="..." className="min-h-[80px] border-slate-200 rounded-xl text-sm" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg text-sm font-bold uppercase tracking-widest"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-4 animate-spin" /> : "Valider l'inscription"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};