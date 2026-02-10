import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface RequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function RequestsModal({ isOpen, onClose, userId }: RequestsModalProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les demandes reçues
  // Charger les demandes reçues
  const fetchRequests = async () => {
    console.log("Chargement des demandes pour :", userId);
    
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id, 
        status, 
        created_at,
        sender:registrations!request_sender_profile_fkey (
          id, first_name, last_name, age, city, job, photo_url
        )
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending'); 

    if (error) {
      console.error("Erreur chargement demandes:", error);
    } else {
      console.log("Demandes trouvées :", data);
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchRequests();
  }, [isOpen, userId]);

  // Action : Accepter ou Refuser
  const handleResponse = async (requestId: string, senderId: string, action: 'accepted' | 'rejected') => {
    // 1. Mettre à jour la table requests
    const { error } = await supabase
      .from('requests')
      .update({ status: action })
      .eq('id', requestId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de traiter la demande.", variant: "destructive" });
      return;
    }

    // 2. Notifier l'expéditeur de la réponse
    if (action === 'accepted') {
      await supabase.from('notifications').insert({
        to_user_id: senderId,
        type: 'request_accepted',
        content: "Bonne nouvelle ! Votre demande de contact a été acceptée.",
        is_read: false
      });
      toast({ title: "Connecté !", description: "Vous pouvez maintenant échanger." });
    } else {
       toast({ title: "Demande refusée", description: "La demande a été supprimée." });
    }

    // 3. Rafraîchir la liste locale
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-slate-800">Demandes de contact</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading ? (
            <p className="text-center text-slate-400">Chargement...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-slate-500 py-6">Aucune demande en attente.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender.first_name}`} />
                    <AvatarFallback>{req.sender.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-slate-800">{req.sender.first_name}, {req.sender.age} ans</h4>
                    <p className="text-xs text-slate-500">{req.sender.job} • {req.sender.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    onClick={() => handleResponse(req.id, req.sender.id, 'rejected')}>
                    <X size={16} />
                  </Button>
                  <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleResponse(req.id, req.sender.id, 'accepted')}>
                    <Check size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}