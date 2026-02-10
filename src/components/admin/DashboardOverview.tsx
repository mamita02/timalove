import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRegistrationStats } from "@/lib/supabase";
import {
    Activity,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    TrendingUp,
    Users,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await getRegistrationStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total des inscriptions",
      value: stats.total,
      icon: Users,
      description: "Toutes les inscriptions",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "En attente",
      value: stats.pending,
      icon: Clock,
      description: "À traiter",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approuvées",
      value: stats.approved,
      icon: CheckCircle,
      description: "Validées",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejetées",
      value: stats.rejected,
      icon: XCircle,
      description: "Refusées",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-3xl font-serif font-semibold tracking-tight">
          Tableau de bord
        </h2>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphiques et statistiques détaillées */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Taux de conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taux d'approbation
            </CardTitle>
            <CardDescription>Inscriptions validées</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {stats.total > 0
                    ? Math.round((stats.approved / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.approved} sur {stats.total} inscriptions
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières 24h</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {stats.pending}
                </div>
                <div className="text-sm text-muted-foreground">
                  Nouvelles inscriptions en attente
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Actions requises
            </CardTitle>
            <CardDescription>À traiter</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-muted-foreground">
                  Inscriptions en attente de validation
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des statuts</CardTitle>
            <CardDescription>Distribution des inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">En attente</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Approuvées</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Rejetées</span>
                  </div>
                  <span className="text-sm font-semibold">{stats.rejected}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Statistiques géographiques
            </CardTitle>
            <CardDescription>Villes les plus représentées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Consultez la page "Inscriptions" pour voir les statistiques détaillées par ville
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};