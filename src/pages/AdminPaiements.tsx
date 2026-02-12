import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  AlertTriangle,
  CalendarCheck,
  Download,
  Loader2,
  RefreshCcw,
  Search,
  TrendingUp,
  UserX
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const AdminPaiements = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);

  // 🔹 Chargement des données avec jointure pour avoir les NOMS
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer les transactions + Nom/Prénom depuis la table registrations
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select(`
          *,
          registrations:user_id (first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // 2. Récupérer les dates de fin d'abonnement depuis profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, subscription_end_date");

      // 3. Fusionner les données pour enrichir l'affichage
      const enriched = txData?.map(tx => {
        const profile = profileData?.find(p => p.id === tx.user_id);
        return {
          ...tx,
          userName: tx.registrations 
            ? `${tx.registrations.first_name} ${tx.registrations.last_name}` 
            : "Utilisateur inconnu",
          subscriptionEnd: profile?.subscription_end_date
        };
      });

      setTransactions(enriched || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Chargement impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 LOGIQUE DE FILTRAGE AVANCÉE
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filtre par date de transaction
      const txDate = new Date(tx.created_at);
      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate && txDate > new Date(endDate)) return false;

      // Filtre par nom
      if (searchName && !tx.userName.toLowerCase().includes(searchName.toLowerCase())) return false;

      // Filtre "Expire bientôt" (Moins de 7 jours)
      if (filterExpiringSoon) {
        if (!tx.subscriptionEnd) return false;
        const now = new Date();
        const end = new Date(tx.subscriptionEnd);
        const diffDays = (end.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0 || diffDays > 7) return false; // On ne garde que ceux entre 0 et 7 jours
      }

      return true;
    });
  }, [transactions, startDate, endDate, searchName, filterExpiringSoon]);

  // 🔹 Statistiques calculées
  const stats = useMemo(() => {
    const paidTxs = transactions.filter(t => t.status === "paid");
    const now = new Date();
    const expiringCount = transactions.filter(t => {
        if (!t.subscriptionEnd) return false;
        const end = new Date(t.subscriptionEnd);
        const diffDays = (end.getTime() - now.getTime()) / (1000 * 3600 * 24);
        return diffDays > 0 && diffDays <= 7;
    }).length;

    return {
      revenue: paidTxs.reduce((sum, t) => sum + (t.amount || 0), 0),
      active: transactions.filter(t => t.subscriptionEnd && new Date(t.subscriptionEnd) > new Date()).length,
      expiringSoon: expiringCount
    };
  }, [transactions]);

  // 🔹 Export CSV
  const exportCSV = () => {
    const headers = ["Utilisateur", "Montant", "Statut", "Date Paiement", "Fin Abonnement"];
    const rows = filteredTransactions.map((t) => [
      t.userName,
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleDateString(),
      t.subscriptionEnd ? new Date(t.subscriptionEnd).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements_timalove_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  // 🔹 Forcer désactivation
  const forceDeactivate = async (userId: string) => {
    if (!window.confirm("Voulez-vous vraiment annuler l'accès Premium de cet utilisateur ?")) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "inactive",
          subscription_end_date: null,
        })
        .eq("id", userId);

      if (error) throw error;
      toast({ title: "Accès révoqué", description: "L'utilisateur est repassé en compte gratuit." });
      loadData();
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-8 bg-[#FDF8F5] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#5F5751]">Gestion des Paiements</h2>
          <p className="text-[#8B7E74]">Pilotez vos revenus et vos abonnés premium</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" className="bg-white border-[#F3E5E0] h-10 w-10 p-0 rounded-xl">
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button onClick={exportCSV} className="bg-white text-[#5F5751] border-[#F3E5E0] hover:bg-slate-50 gap-2 shadow-sm border rounded-xl" variant="outline">
                <Download size={18} /> Exporter CSV
            </Button>
        </div>
      </div>

      {/* CARTES DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#F3E5E0] shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp /></div>
            <div>
              <p className="text-sm font-medium text-[#8B7E74]">Revenu total</p>
              <h3 className="text-2xl font-bold text-[#5F5751]">{stats.revenue.toLocaleString()} FCFA</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#F3E5E0] shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><CalendarCheck /></div>
            <div>
              <p className="text-sm font-medium text-[#8B7E74]">Abonnements actifs</p>
              <h3 className="text-2xl font-bold text-[#5F5751]">{stats.active} membres</h3>
            </div>
          </CardContent>
        </Card>

        <Card 
            className={`border-[#F3E5E0] shadow-sm cursor-pointer transition-all ${filterExpiringSoon ? 'ring-2 ring-orange-400 bg-orange-50' : 'bg-white'}`}
            onClick={() => setFilterExpiringSoon(!filterExpiringSoon)}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stats.expiringSoon > 0 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <AlertTriangle />
            </div>
            <div>
              <p className="text-sm font-medium text-[#8B7E74]">Expirations (7j)</p>
              <h3 className="text-2xl font-bold text-[#5F5751]">{stats.expiringSoon} alertes</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BARRE DE FILTRES ET RECHERCHE */}
      <Card className="border-[#F3E5E0] bg-white shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
                placeholder="Rechercher un membre..." 
                value={searchName} 
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10 rounded-xl border-[#F3E5E0] focus:ring-[#D48B8B]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8B7E74] font-medium">Période :</span>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 rounded-xl border-[#F3E5E0]" />
            <span className="text-slate-300">→</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 rounded-xl border-[#F3E5E0]" />
          </div>
          {(startDate || endDate || searchName || filterExpiringSoon) && (
            <Button variant="ghost" onClick={() => {setStartDate(""); setEndDate(""); setSearchName(""); setFilterExpiringSoon(false);}} className="text-xs text-rose-500 hover:bg-rose-50">
                Effacer les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* TABLEAU DES PAIEMENTS */}
      <Card className="border-[#F3E5E0] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#FDF8F5]">
            <TableRow>
              <TableHead className="font-bold text-[#8B7E74]">Utilisateur</TableHead>
              <TableHead className="font-bold text-[#8B7E74]">Montant</TableHead>
              <TableHead className="font-bold text-[#8B7E74]">Statut</TableHead>
              <TableHead className="font-bold text-[#8B7E74]">Date Paiement</TableHead>
              <TableHead className="font-bold text-[#8B7E74]">Fin Abonnement</TableHead>
              <TableHead className="text-right font-bold text-[#8B7E74]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#D48B8B]" />
                  <p className="text-sm text-[#8B7E74] mt-2">Chargement de la base...</p>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Search size={40} strokeWidth={1} />
                        <p>Aucune transaction ne correspond à vos critères.</p>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => {
                // Détection visuelle si expire bientôt
                const isExpiring = tx.subscriptionEnd && (new Date(tx.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7;
                
                return (
                  <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-semibold text-[#5F5751]">{tx.userName}</TableCell>
                    <TableCell className="font-medium">{tx.amount?.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.status === 'paid' ? 'Payé' : 'En attente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className={`font-bold ${isExpiring ? 'text-orange-600' : 'text-rose-600'}`}>
                                {tx.subscriptionEnd ? new Date(tx.subscriptionEnd).toLocaleDateString() : '---'}
                            </span>
                            {isExpiring && <span className="text-[9px] font-bold text-orange-500 uppercase">Expire bientôt</span>}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => forceDeactivate(tx.user_id)}
                        className="text-red-400 hover:text-red-700 hover:bg-red-50 gap-2 rounded-lg"
                      >
                        <UserX size={14} /> Révoquer
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* FOOTER INFO */}
      <div className="flex justify-center">
          <p className="text-[11px] text-[#8B7E74] italic">
            Note : Les dates de fin sont calculées sur la base de 3 mois (90 jours).
          </p>
      </div>
    </div>
  );
};