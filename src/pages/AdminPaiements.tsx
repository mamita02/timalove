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
import {
  AlertTriangle,
  CalendarCheck,
  Download,
  Loader2,
  RefreshCcw,
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
  

  // ===============================
  // 🔥 LOAD DATA STABLE VERSION
  // ===============================
  const loadData = async () => {
    setLoading(true);

    try {
      // 1️⃣ Transactions + registrations
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          status,
          created_at,
          user_id,
          registrations (
            id,
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // 2️⃣ Profiles
      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("id, subscription_end_date, subscription_status");

      if (profileError) throw profileError;

      // 3️⃣ Map profiles
      const profilesMap = new Map();
      profilesData?.forEach((p: any) => {
        profilesMap.set(p.id, p);
      });

      // 4️⃣ Enrich
      const enriched = txData?.map((tx: any) => {
        const registration = tx.registrations;
        const profile = profilesMap.get(tx.user_id);

        return {
          ...tx,
          userName: registration
            ? `${registration.first_name || ""} ${registration.last_name || ""}`.trim()
            : "Utilisateur inconnu",
          subscriptionEnd: profile?.subscription_end_date || null,
          subscriptionStatus: profile?.subscription_status || "inactive"
        };
      });

      setTransactions(enriched || []);
      console.log("Transactions:", transactions);
      

    } catch (err) {
      console.error("Erreur AdminPaiements:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paiements.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===============================
  // 🔎 FILTRES
  // ===============================
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);

      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate && txDate > new Date(endDate)) return false;

      if (
        searchName &&
        !tx.userName.toLowerCase().includes(searchName.toLowerCase())
      )
        return false;

      if (filterExpiringSoon) {
        if (!tx.subscriptionEnd) return false;
        const now = new Date();
        const end = new Date(tx.subscriptionEnd);
        const diffDays =
          (end.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, searchName, filterExpiringSoon]);

  // ===============================
  // 📊 STATS
  // ===============================
  
  const stats = useMemo(() => {
  const paidTxs = transactions.filter(
  (t) => t.status?.toLowerCase().trim() === "paid"
);
console.log("PaidTxs:", paidTxs);
    const now = new Date();

    const expiringSoon = transactions.filter((t) => {
      if (!t.subscriptionEnd) return false;
      const end = new Date(t.subscriptionEnd);
      const diffDays =
        (end.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 7;
    }).length;

    return {
      revenue: paidTxs.reduce((sum, t) => sum + (t.amount || 0), 0),
      active: transactions.filter(
        (t) =>
          t.subscriptionEnd &&
          new Date(t.subscriptionEnd) > new Date()
      ).length,
      expiringSoon
    };
  }, [transactions]);

  // ===============================
  // 📁 EXPORT CSV
  // ===============================
  const exportCSV = () => {
    const headers = [
      "Utilisateur",
      "Montant",
      "Statut",
      "Date Paiement",
      "Fin Abonnement"
    ];

    const rows = filteredTransactions.map((t) => [
      t.userName,
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleDateString(),
      t.subscriptionEnd
        ? new Date(t.subscriptionEnd).toLocaleDateString()
        : "N/A"
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  // ===============================
  // ❌ FORCE DEACTIVATE
  // ===============================
  const forceDeactivate = async (userId: string) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment annuler l'accès Premium ?"
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "inactive",
          subscription_end_date: null
        })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Accès révoqué" });
      loadData();
    } catch {
      toast({
        title: "Erreur",
        variant: "destructive"
      });
    }
  };

  // ===============================
  // 🖥 UI
  // ===============================
  return (
    <div className="p-6 space-y-8 bg-[#FDF8F5] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#5F5751]">
            Gestion des Paiements
          </h2>
          <p className="text-[#8B7E74]">
            Revenus & abonnements premium
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCcw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </Button>
          <Button onClick={exportCSV} variant="outline">
            <Download size={16} /> Exporter
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex gap-4 items-center">
            <TrendingUp />
            <div>
              <p>Revenu total</p>
              <h3 className="text-2xl font-bold">
                {stats.revenue.toLocaleString()} FCFA
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex gap-4 items-center">
            <CalendarCheck />
            <div>
              <p>Abonnements actifs</p>
              <h3 className="text-2xl font-bold">
                {stats.active}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() =>
            setFilterExpiringSoon(!filterExpiringSoon)
          }
          className="cursor-pointer"
        >
          <CardContent className="p-6 flex gap-4 items-center">
            <AlertTriangle />
            <div>
              <p>Expire sous 7 jours</p>
              <h3 className="text-2xl font-bold">
                {stats.expiringSoon}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fin abonnement</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.userName}</TableCell>
                  <TableCell>
                    {tx.amount?.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>
                    {new Date(
                      tx.created_at
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {tx.subscriptionEnd
                      ? new Date(
                          tx.subscriptionEnd
                        ).toLocaleDateString()
                      : "---"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        forceDeactivate(tx.user_id)
                      }
                    >
                      <UserX size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
