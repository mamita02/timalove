import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle, CalendarCheck, CalendarHeart,
  Download, Loader2, RefreshCcw, TrendingUp, UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TxType = "all" | "subscription" | "coaching";

export const AdminPaiements = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [searchName, setSearchName]     = useState("");
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  const [typeFilter, setTypeFilter]     = useState<TxType>("all");

  /* ── Chargement ── */
  const loadData = async () => {
    setLoading(true);
    try {
      /* 1. Transactions — subscription_end_date est maintenant stocké directement
            dans la table transactions par le webhook (pas besoin de joindre profiles
            ce qui évite les problèmes de RLS)                                      */
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select(`
          id, amount, status, created_at, user_id, type,
          subscription_end_date,
          coaching_request_id,
          registrations ( id, first_name, last_name ),
          coaching_requests ( first_name, last_name, email, theme, requested_date )
        `)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      const enriched = (txData ?? []).map((tx: any) => {
        const isCoaching = tx.type === "coaching";
        const reg        = tx.registrations;
        const coaching   = tx.coaching_requests;

        const userName = isCoaching
          ? (coaching ? `${coaching.first_name} ${coaching.last_name}`.trim() : "—")
          : (reg       ? `${reg.first_name} ${reg.last_name}`.trim()          : "Utilisateur inconnu");

        return {
          ...tx,
          userName,
          authUserId:     tx.user_id                          || reg?.id || null,
          coachingEmail:  coaching?.email                     || null,
          coachingTheme:  coaching?.theme                     || null,
          coachingDate:   coaching?.requested_date            || null,
          // subscriptionEnd lu directement depuis la colonne de la transaction
          subscriptionEnd: tx.subscription_end_date           || null,
          subscriptionStatus: tx.subscription_end_date
            ? (new Date(tx.subscription_end_date) > new Date() ? "active" : "expired")
            : "inactive",
        };
      });

      setTransactions(enriched);
    } catch (err) {
      console.error("Erreur AdminPaiements:", err);
      toast({ title: "Erreur", description: "Impossible de charger les paiements.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Filtres ── */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);
      if (startDate && txDate < new Date(startDate)) return false;
      if (endDate   && txDate > new Date(endDate))   return false;
      if (searchName && !tx.userName.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (filterExpiringSoon) {
        if (!tx.subscriptionEnd) return false;
        const diff = (new Date(tx.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24);
        if (diff < 0 || diff > 7) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate, searchName, typeFilter, filterExpiringSoon]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const paid = transactions.filter(t => t.status?.toLowerCase().trim() === "paid");
    const now  = Date.now();
    return {
      revenue:         paid.reduce((s, t) => s + (t.amount || 0), 0),
      revenueCoaching: paid.filter(t => t.type === "coaching").reduce((s, t) => s + (t.amount || 0), 0),
      revenueSub:      paid.filter(t => t.type === "subscription").reduce((s, t) => s + (t.amount || 0), 0),
      active:          transactions.filter(t => t.subscriptionEnd && new Date(t.subscriptionEnd) > new Date()).length,
      expiringSoon:    transactions.filter(t => {
        if (!t.subscriptionEnd) return false;
        const diff = (new Date(t.subscriptionEnd).getTime() - now) / (1000 * 3600 * 24);
        return diff > 0 && diff <= 7;
      }).length,
    };
  }, [transactions]);

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ["Type", "Utilisateur", "Email", "Montant", "Statut", "Date", "Fin abonnement / Détail"];
    const rows = filteredTransactions.map(t => [
      t.type === "coaching" ? "Coaching" : "Abonnement",
      t.userName,
      t.coachingEmail || "—",
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleDateString("fr-FR"),
      t.type === "coaching"
        ? t.coachingTheme
        : (t.subscriptionEnd ? new Date(t.subscriptionEnd).toLocaleDateString("fr-FR") : "N/A"),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `paiements_${new Date().toLocaleDateString()}.csv`; a.click();
  };

  /* ── Désactiver abonnement ── */
  const forceDeactivate = async (userId: string) => {
    if (!window.confirm("Voulez-vous vraiment annuler l'accès Premium ?")) return;
    try {
      const { error } = await supabase.from("profiles")
        .update({ subscription_status: "inactive", subscription_end_date: null })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: "Accès révoqué" });
      loadData();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  /* ════════ RENDU ════════ */
  return (
    <div className="p-6 space-y-8 bg-[#FDF8F5] min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#5F5751]">Gestion des Paiements</h2>
          <p className="text-[#8B7E74]">Revenus & abonnements premium · Coaching</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={exportCSV} variant="outline">
            <Download size={16} /> Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex gap-3 items-center">
            <TrendingUp className="text-rose-400" />
            <div>
              <p className="text-xs text-gray-500">Revenu total</p>
              <h3 className="text-xl font-bold">{stats.revenue.toLocaleString()} FCFA</h3>
              <p className="text-xs text-gray-400">Abo: {stats.revenueSub.toLocaleString()} · Coaching: {stats.revenueCoaching.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex gap-3 items-center">
            <CalendarCheck className="text-green-400" />
            <div>
              <p className="text-xs text-gray-500">Abonnements actifs</p>
              <h3 className="text-xl font-bold">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex gap-3 items-center">
            <CalendarHeart className="text-rose-400" />
            <div>
              <p className="text-xs text-gray-500">Coachings payés</p>
              <h3 className="text-xl font-bold">
                {transactions.filter(t => t.type === "coaching" && t.status === "paid").length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card onClick={() => setFilterExpiringSoon(!filterExpiringSoon)} className="cursor-pointer">
          <CardContent className="p-5 flex gap-3 items-center">
            <AlertTriangle className="text-amber-400" />
            <div>
              <p className="text-xs text-gray-500">Expire sous 7 jours</p>
              <h3 className="text-xl font-bold">{stats.expiringSoon}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg overflow-hidden border border-rose-200">
          {(["all", "subscription", "coaching"] as TxType[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === t
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-600 hover:bg-rose-50"
              }`}
            >
              {t === "all" ? "Tous" : t === "subscription" ? "Abonnements" : "Coaching"}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Rechercher un nom..."
          value={searchName} onChange={e => setSearchName(e.target.value)}
          className="border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-rose-300" />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none" />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date paiement</TableHead>
              <TableHead>Détail</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>

                  {/* Type badge */}
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tx.type === "coaching"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {tx.type === "coaching" ? <CalendarHeart size={11} /> : <CalendarCheck size={11} />}
                      {tx.type === "coaching" ? "Coaching" : "Abonnement"}
                    </span>
                  </TableCell>

                  {/* Utilisateur */}
                  <TableCell>
                    <div className="font-medium text-sm">{tx.userName}</div>
                    {tx.coachingEmail && (
                      <div className="text-xs text-gray-400">{tx.coachingEmail}</div>
                    )}
                  </TableCell>

                  {/* Montant */}
                  <TableCell className="font-medium">
                    {tx.amount?.toLocaleString()} FCFA
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      tx.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {tx.status === "paid" ? "Payé" : "En attente"}
                    </span>
                  </TableCell>

                  {/* Date paiement */}
                  <TableCell className="text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>

                  {/* Détail */}
                  <TableCell className="text-xs text-gray-500">
                    {tx.type === "coaching" ? (
                      <div>
                        <div className="font-medium text-gray-700">{tx.coachingTheme}</div>
                        {tx.coachingDate && (
                          <div>{new Date(tx.coachingDate).toLocaleDateString("fr-FR")}</div>
                        )}
                      </div>
                    ) : (
                      /* ── Abonnement : affiche la date de fin si payé ── */
                      tx.status === "paid" && tx.subscriptionEnd ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CalendarCheck size={11} />
                            Actif jusqu'au
                          </span>
                          <span className="font-semibold text-gray-700">
                            {new Date(tx.subscriptionEnd).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </span>
                        </div>
                      ) : tx.status === "paid" ? (
                        /* Payé mais pas de profil trouvé — ID mismatch possible */
                        <span className="text-amber-600 text-xs">Date non disponible</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    {tx.type === "subscription" && tx.authUserId && (
                      <Button variant="ghost" size="sm" onClick={() => forceDeactivate(tx.authUserId)}>
                        <UserX size={14} />
                      </Button>
                    )}
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
