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
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export const AdminPaiements = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔹 Chargement données
  const loadData = async () => {
    setLoading(true);

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*");

    setTransactions(txData || []);
    setProfiles(profileData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Filtrage par date
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const date = new Date(tx.created_at);
      if (startDate && date < new Date(startDate)) return false;
      if (endDate && date > new Date(endDate)) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  // 🔹 Revenu total
  const totalRevenue = filteredTransactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // 🔹 Abonnements actifs
  const activeSubscriptions = profiles.filter((p) => {
    if (!p.subscription_end_date) return false;
    return new Date(p.subscription_end_date) > new Date();
  }).length;

  // 🔹 Revenus mensuels (graphique)
  const monthlyRevenue = useMemo(() => {
    const map: any = {};

    transactions
      .filter((t) => t.status === "paid")
      .forEach((tx) => {
        const date = new Date(tx.created_at);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        map[key] = (map[key] || 0) + tx.amount;
      });

    return Object.keys(map).map((key) => ({
      month: key,
      revenue: map[key],
    }));
  }, [transactions]);

  // 🔹 Export CSV
  const exportCSV = () => {
    const rows = filteredTransactions.map((t) => [
      t.user_id,
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      "User ID,Montant,Statut,Date\n" +
      rows.map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "paiements.csv";
    a.click();
  };

  // 🔹 Forcer désactivation
  const forceDeactivate = async (userId: string) => {
    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive",
        subscription_end_date: null,
      })
      .eq("id", userId);

    loadData();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-serif font-semibold">
        Gestion des Paiements
      </h2>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Revenu total</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {totalRevenue} FCFA
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Abonnements actifs
            </p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">
              {activeSubscriptions}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Transactions totales
            </p>
            <h3 className="text-3xl font-bold mt-2">
              {filteredTransactions.length}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* FILTRE + EXPORT */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button onClick={exportCSV}>Exporter CSV</Button>
      </div>

      {/* GRAPHIQUE */}
      <Card>
        <CardContent className="p-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TABLEAU */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.user_id}</TableCell>
                    <TableCell>{tx.amount} FCFA</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => forceDeactivate(tx.user_id)}
                      >
                        Forcer désactivation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
