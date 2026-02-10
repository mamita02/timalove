import { AdminLayout } from "@/components/admin/AdminLayout"; // Import est déjà là, c'est bien
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, MessageSquare, Star, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

export const AdminReviews = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Charger les avis
  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          registrations (
            first_name,
            last_name,
            photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTestimonials(data);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
      toast({ title: "Erreur", description: "Impossible de charger les avis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // 2. Supprimer un avis
  const handleDelete = async (id: string) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet avis définitivement ?")) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw error;
        setTestimonials(prev => prev.filter(t => t.id !== id));
        toast({ title: "Avis supprimé avec succès" });
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
      }
    }
  };

  return (
    // --- AJOUT ICI : On enveloppe tout dans AdminLayout ---
    <AdminLayout>
      <div className="space-y-6 p-6 min-h-screen bg-[#FDFBFB]">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-serif font-semibold tracking-tight text-[#5F5751]">Avis & Témoignages</h2>
          <p className="text-muted-foreground mt-2">Gérer les retours des utilisateurs.</p>
        </div>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#F3E5E0] shadow-sm bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-rose-50 rounded-full text-rose-400">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#8B7E74]">Total Avis</p>
                <h3 className="text-2xl font-bold text-[#5F5751]">{testimonials.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABLEAU */}
        <Card className="border-[#F3E5E0] bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
               <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-rose-400" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Utilisateur</TableHead>
                    <TableHead className="w-[40%]">Message</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Aucun avis pour le moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    testimonials.map((review) => (
                      <TableRow key={review.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                               {review.registrations?.photo_url ? (
                                 <img src={review.registrations.photo_url} className="w-full h-full object-cover" />
                               ) : (
                                 <User className="w-full h-full p-2 text-slate-400" />
                               )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-[#5F5751]">
                                {review.registrations?.first_name || 'Inconnu'} {review.registrations?.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="text-sm text-slate-600 italic leading-relaxed">
                            "{review.content}"
                          </p>
                        </TableCell>

                        <TableCell>
                           <div className="flex text-yellow-400">
                             {Array(review.rating || 5).fill(0).map((_, i) => (
                                 <Star key={i} size={14} fill="currentColor" />
                             ))}
                           </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(review.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout> 
    // --- FIN AJOUT ---
  );
};