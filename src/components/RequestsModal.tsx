import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Check, Loader2, MapPin, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

interface RequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function RequestsModal({ isOpen, onClose, userId }: RequestsModalProps) {
  const [loading, setLoading] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // 1. Demandes REÇUES (On joint via sender_id)
      const { data: received, error: err1 } = await supabase
        .from("requests")
        .select(`
          id, status, created_at,
          sender:registrations!sender_id (id, first_name, photo_url, city, age, job)
        `)
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (err1) throw err1;

      // 2. Demandes ENVOYÉES (On joint via receiver_id)
      const { data: sent, error: err2 } = await supabase
        .from("requests")
        .select(`
          id, status, created_at,
          receiver:registrations!receiver_id (id, first_name, photo_url, city, age, job)
        `)
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      if (err2) throw err2;

      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (error: any) {
      console.error("Erreur chargement demandes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) fetchRequests();
  }, [isOpen, userId]);

  const handleResponse = async (requestId: string, senderId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      if (action === 'accepted') {
        // Notification manuelle pour l'acceptation
        await supabase.from('notifications').insert({
          from_user_id: userId,
          to_user_id: senderId,
          type: 'system', // ou un type 'match' si tu l'as ajouté
          message: "a accepté votre demande ! Vous pouvez maintenant échanger.",
          is_read: false
        });
        toast({ title: "Connecté !", description: "La demande a été acceptée." });
      } else {
        toast({ title: "Demande refusée", description: "L'utilisateur ne sera pas notifié." });
      }

      fetchRequests(); // Rafraîchir les deux listes
    } catch (error) {
      toast({ title: "Erreur", description: "Action impossible.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-slate-800">Mes Demandes</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="received" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="received" className="rounded-lg">Reçues</TabsTrigger>
            <TabsTrigger value="sent" className="rounded-lg">Envoyées</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
          ) : (
            <>
              {/* ONGLET : REÇUES */}
              <TabsContent value="received" className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
                {receivedRequests.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm italic">Aucune demande reçue.</p>
                ) : (
                  receivedRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={req.sender?.photo_url} />
                          <AvatarFallback className="bg-rose-100 text-rose-600 font-bold">{req.sender?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{req.sender?.first_name}, {req.sender?.age}</h4>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10}/> {req.sender?.city}</p>
                        </div>
                      </div>

                      {req.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 border-red-100 hover:bg-red-50" 
                            onClick={() => handleResponse(req.id, req.sender.id, 'rejected')}>
                            <X size={16} />
                          </Button>
                          <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white shadow-sm"
                            onClick={() => handleResponse(req.id, req.sender.id, 'accepted')}>
                            <Check size={16} />
                          </Button>
                        </div>
                      ) : (
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                          {req.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              {/* ONGLET : ENVOYÉES */}
              <TabsContent value="sent" className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto">
                {sentRequests.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm italic">Aucune demande envoyée.</p>
                ) : (
                  sentRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 opacity-80">
                          <AvatarImage src={req.receiver?.photo_url} />
                          <AvatarFallback>{req.receiver?.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-slate-700 text-sm">{req.receiver?.first_name}</h4>
                          <p className="text-[9px] text-slate-400">Le {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : req.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {req.status === 'pending' && <Send size={8} />}
                        {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                      </span>
                    </div>
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}