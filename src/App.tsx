import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

// IMPORT DU LAYOUT
import { AdminLayout } from "@/components/admin/AdminLayout";

// IMPORTS PAGES PUBLIQUES
import Index from "./pages/Index";
import Legal from './pages/Legal';
import MemberDetail from "./pages/MemberDetail";
import NotFound from "./pages/NotFound";
import QuiSuisJe from "./pages/QuiSuisJe";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import { UserLogin } from "./pages/UserLogin";
import UserProfile from "./pages/UserProfile";

// IMPORTS PAGES ADMIN
import AdminInscriptions from "./pages/AdminInscriptions";
import AdminPage from "./pages/AdminPage"; // C'est ta page "Espace Privé" (Login Admin)
import { AdminPaiements } from "./pages/AdminPaiements";
import { AdminReviews } from "./pages/AdminReviews";
import { AdminSettings } from "./pages/AdminSettings";
import Matching from "./pages/Matching";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- 1. PAGES PUBLIQUES ET CLIENTS --- */}
          <Route path="/" element={<Index />} />
          <Route path="/qui-suis-je" element={<QuiSuisJe />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<MemberDetail />} />

          {/* --- 2. AUTHENTIFICATION ADMIN (SANS LE MENU) --- */}
          {/* On affiche le login SEUL, sans AdminLayout autour */}
          <Route path="/admin/login" element={<AdminPage />} />

          {/* --- 3. ESPACE ADMINISTRATION (AVEC LE MENU) --- */}
          {/* Toutes les routes ci-dessous s'afficheront à DROITE du menu */}
          <Route 
            path="/admin" 
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            {/* Si on va sur /admin, on peut soit rediriger vers dashboard, 
                soit afficher une page d'accueil admin spécifique */}
            <Route index element={<AdminInscriptions />} /> 
            
            <Route path="inscriptions" element={<AdminInscriptions />} />
            <Route path="matching" element={<Matching />} />
            <Route path="paiements" element={<AdminPaiements />} />
            <Route path="avis" element={<AdminReviews />} />
            <Route path="parametres" element={<AdminSettings />} />
          </Route>

          {/* 404 - Toujours en dernier */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;