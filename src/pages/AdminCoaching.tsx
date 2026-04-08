import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
    CalendarHeart, CheckCircle2, Clock,
    Download, Loader2, RefreshCcw, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const THEMES = [
  "Tous",
  "rencontres",
  "couple",
  "rupture",
  "confiance",
  "communication",
  "mariage",
  "autre",
];

const THEME_LABELS: Record<string, string> = {
  rencontres:    "Trouver l'amour",
  couple:        "Vie de couple",
  rupture:       "Rupture",
  confiance:     "Confiance en soi",
  communication: "Communication",
  mariage:       "Mariage",
  autre:         "Autre",
};

const GENRES = ["Tous", "femme", "homme", "autre"];

const SLOT_LABELS: Record<string, string> = {
  matin: "Matin (9h – 12h)",
  aprem: "Après-midi (13h – 17h)",
  soir:  "Soir (18h – 20h)",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-amber-100 text-amber-700" },
  validated: { label: "Validé",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé",      color: "bg-red-100 text-red-700" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  unpaid:   { label: "Non payé",  color: "bg-gray-100 text-gray-600" },
  paid:     { label: "Payé",      color: "bg-green-100 text-green-700" },
  refunded: { label: "Remboursé", color: "bg-blue-100 text-blue-700" },
};

export const AdminCoaching = () => {
  const [requests, setRequests]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [themeFilter, setThemeFilter] = useState("Tous");
  const [genreFilter, setGenreFilter] = useState("Tous");
  const [search, setSearch]           = useState("");

  /* ── Chargement ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coaching_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de charger les demandes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Filtres ── */
  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (themeFilter !== "Tous" && r.theme !== themeFilter) return false;
      if (genreFilter !== "Tous" && r.genre !== genreFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${r.first_name} ${r.last_name}`.toLowerCase();
        if (!name.includes(q) && !r.email?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [requests, themeFilter, genreFilter, search]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:     requests.length,
    paid:      requests.filter(r => r.payment_status === "paid").length,
    pending:   requests.filter(r => r.status === "pending").length,
    validated: requests.filter(r => r.status === "validated").length,
  }), [requests]);

  /* ── Changer statut ── */
  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("coaching_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Statut mis à jour" });
      loadData();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ["Nom", "Email", "Téléphone", "Genre", "Situation", "Date souhaitée", "Créneau", "Thème", "Message", "Statut", "Paiement", "Date demande"];
    const rows = filtered.map(r => [
      `${r.first_name} ${r.last_name}`,
      r.email, r.phone || "",
      r.genre || "", r.situation || "",
      r.requested_date,
      SLOT_LABELS[r.time_slot] || r.time_slot,
      THEME_LABELS[r.theme] || r.theme,
      r.message || "",
      r.status, r.payment_status,
      new Date(r.created_at).toLocaleDateString("fr-FR"),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `coaching_${new Date().toLocaleDateString("fr-FR")}.csv`; a.click();
  };

  /* ════════ RENDU ════════ */
  return (
    <div className="p-6 space-y-8 bg-[#FDF8F5] min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#5F5751]">
            Coaching Vie Amoureuse
          </h2>
          <p className="text-[#8B7E74]">Toutes les demandes de séance coaching</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total demandes", value: stats.total,     icon: <CalendarHeart size={18} className="text-rose-400" /> },
          { label: "Payées",         value: stats.paid,      icon: <CheckCircle2  size={18} className="text-green-500" /> },
          { label: "En attente",     value: stats.pending,   icon: <Clock         size={18} className="text-amber-500" /> },
          { label: "Validées",       value: stats.validated, icon: <CheckCircle2  size={18} className="text-blue-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-[#5F5751]">{value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">

        {/* Recherche */}
        <input
          type="text" placeholder="Rechercher un nom ou email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-rose-300 min-w-[220px]"
        />

        {/* Filtre thème */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Thème :</span>
          <div className="flex flex-wrap gap-1">
            {THEMES.map(t => (
              <button key={t} onClick={() => setThemeFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  themeFilter === t
                    ? "bg-rose-500 text-white"
                    : "bg-white border border-rose-200 text-gray-600 hover:bg-rose-50"
                }`}>
                {t === "Tous" ? "Tous" : THEME_LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {/* Filtre genre */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Genre :</span>
          <div className="flex gap-1">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenreFilter(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  genreFilter === g
                    ? "bg-rose-500 text-white"
                    : "bg-white border border-rose-200 text-gray-600 hover:bg-rose-50"
                }`}>
                {g === "Tous" ? "Tous" : g === "femme" ? "Femme" : g === "homme" ? "Homme" : "Autre"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <p className="text-sm text-gray-400">{filtered.length} demande{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}</p>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Thème</TableHead>
              <TableHead>Date souhaitée</TableHead>
              <TableHead>Créneau</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                  Aucune demande trouvée
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const statusCfg  = STATUS_CONFIG[r.status]   || STATUS_CONFIG.pending;
                const paymentCfg = PAYMENT_CONFIG[r.payment_status] || PAYMENT_CONFIG.unpaid;
                return (
                  <TableRow key={r.id}>

                    {/* Client */}
                    <TableCell>
                      <div className="font-medium text-sm text-[#5F5751]">
                        {r.first_name} {r.last_name}
                      </div>
                      <div className="text-xs text-gray-400">{r.email}</div>
                      {r.phone && <div className="text-xs text-gray-400">{r.phone}</div>}
                      {r.message && (
                        <div className="mt-1 text-xs italic text-gray-400 max-w-[200px] truncate" title={r.message}>
                          "{r.message}"
                        </div>
                      )}
                    </TableCell>

                    {/* Genre */}
                    <TableCell>
                      <span className="text-sm capitalize text-gray-600">{r.genre || "—"}</span>
                      {r.situation && (
                        <div className="text-xs text-gray-400 capitalize">{r.situation}</div>
                      )}
                    </TableCell>

                    {/* Thème */}
                    <TableCell>
                      <span className="inline-block rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-xs font-medium">
                        {THEME_LABELS[r.theme] || r.theme}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-gray-600">
                      {r.requested_date
                        ? new Date(r.requested_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </TableCell>

                    {/* Créneau */}
                    <TableCell className="text-xs text-gray-500">
                      {SLOT_LABELS[r.time_slot] || r.time_slot}
                    </TableCell>

                    {/* Paiement */}
                    <TableCell>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentCfg.color}`}>
                        {paymentCfg.label}
                      </span>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status !== "validated" && (
                          <Button
                            size="sm" variant="outline"
                            className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateStatus(r.id, "validated")}
                          >
                            <CheckCircle2 size={12} className="mr-1" /> Valider
                          </Button>
                        )}
                        {r.status !== "cancelled" && (
                          <Button
                            size="sm" variant="outline"
                            className="h-7 px-2 text-xs text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatus(r.id, "cancelled")}
                          >
                            <XCircle size={12} className="mr-1" /> Annuler
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
