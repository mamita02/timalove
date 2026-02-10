import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";

interface EditPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  // NOM CORRIGÉ ICI pour correspondre à UserProfile
  initialPhotos: {
    photo_url: string | null;
    photo_url_2: string | null;
    photo_url_3: string | null;
  };
  // NOM CORRIGÉ ICI pour correspondre à UserProfile
  onPhotosUpdated: () => void; 
}

export const EditPhotosModal = ({ isOpen, onClose, userId, initialPhotos, onPhotosUpdated }: EditPhotosModalProps) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (file: File, column: 'photo_url' | 'photo_url_2' | 'photo_url_3') => {
    try {
      setUploading(column);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${column}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload Storage
      const { error: uploadError } = await supabase.storage
        .from('registration-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('registration-photos')
        .getPublicUrl(filePath);

      // 3. Update Database
      const { error: dbError } = await supabase
        .from('registrations')
        .update({ [column]: publicUrl })
        .eq('id', userId);

      if (dbError) throw dbError;

      toast({ title: "Photo mise à jour !" });
      onPhotosUpdated(); // NOM CORRIGÉ : Appel de la bonne fonction

    } catch (error) {
      console.error(error);
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl">Mes Photos</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          
          {/* --- SLOT 1 : PROFIL PRINCIPAL --- */}
          <div className="col-span-1 flex flex-col items-center gap-2">
            <Label className="text-xs font-bold text-rose-500">PROFIL</Label>
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-rose-200 flex items-center justify-center overflow-hidden bg-rose-50 group">
              {uploading === 'photo_url' ? (
                <Loader2 className="animate-spin text-rose-500" />
              ) : initialPhotos.photo_url ? ( // NOM CORRIGÉ ICI
                <img src={initialPhotos.photo_url} className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-rose-300" />
              )}
              
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photo_url')}
              />
            </div>
          </div>

          {/* --- SLOT 2 : EXTRA 1 --- */}
          <div className="col-span-1 flex flex-col items-center gap-2">
            <Label className="text-xs text-slate-400">PHOTO 2</Label>
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
              {uploading === 'photo_url_2' ? (
                <Loader2 className="animate-spin text-slate-400" />
              ) : initialPhotos.photo_url_2 ? ( // NOM CORRIGÉ ICI
                <img src={initialPhotos.photo_url_2} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-slate-200">+</span>
              )}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photo_url_2')}
              />
            </div>
          </div>

          {/* --- SLOT 3 : EXTRA 2 --- */}
          <div className="col-span-1 flex flex-col items-center gap-2">
            <Label className="text-xs text-slate-400">PHOTO 3</Label>
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
              {uploading === 'photo_url_3' ? (
                <Loader2 className="animate-spin text-slate-400" />
              ) : initialPhotos.photo_url_3 ? ( // NOM CORRIGÉ ICI
                <img src={initialPhotos.photo_url_3} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-slate-200">+</span>
              )}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photo_url_3')}
              />
            </div>
          </div>

        </div>
        <div className="text-center text-[10px] text-slate-400 italic">
          Cliquez sur une case pour ajouter ou modifier
        </div>
      </DialogContent>
    </Dialog>
  );
};