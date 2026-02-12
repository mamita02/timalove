import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    title: "Inscriptions",
    href: "/admin/inscriptions",
    icon: Users,
    description: "Gérer les inscriptions",
  },
  {
    title: "Paiements",
    href: "/admin/paiements",
    icon: CreditCard,
    description: "Historique des paiements",
  },
  {
    title: "Avis",
    href: "/admin/avis",
    icon: MessageSquare,
    description: "Gérer les retours",
  },
  {
    title: "Paramètres",
    href: "/admin/parametres",
    icon: Settings,
    description: "Configuration",
  },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  // FONCTION DE DÉCONNEXION PROPRE
  const handleLogout = async () => {
  try {
    // 1. Déconnexion de Supabase
    await supabase.auth.signOut();
    
    // 2. Nettoyage complet des traces de session
    localStorage.clear();
    sessionStorage.clear();
    
    toast({ title: "Déconnexion réussie", description: "Vous avez été redirigé vers l'accueil." });
    
    // 3. REDIRECTION VERS L'ACCUEIL DU SITE
    navigate("/", { replace: true });
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    navigate("/", { replace: true });
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-semibold">TimaLove</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Heart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-serif text-xl font-semibold">TimaLove</h1>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div>{item.title}</div>
                  {!active && (
                    <div className="text-xs opacity-70">{item.description}</div>
                  )}
                </div>
                {active && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer avec bouton Déconnexion */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r bg-white">
            <div className="flex h-16 items-center gap-2 border-b px-6">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold">TimaLove</span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content avec padding corrigé */}
      <main className="lg:pl-64">
        <div className="pt-20 lg:pt-8 p-4 md:p-8"> {/* Ajout de padding ici */}
          {children}
        </div>
      </main>
    </div>
  );
};