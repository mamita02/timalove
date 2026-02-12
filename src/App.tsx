import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import Index from "./pages/Index";
import Legal from './pages/Legal';
import MemberDetail from "./pages/MemberDetail";
import NotFound from "./pages/NotFound";
import QuiSuisJe from "./pages/QuiSuisJe";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import { UserLogin } from "./pages/UserLogin";
import UserProfile from "./pages/UserProfile";

// --- IMPORTS ADMIN ---
import AdminInscriptions from "./pages/AdminInscriptions";
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
          {/* Accueil et Pages Publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/qui-suis-je" element={<QuiSuisJe />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/legal" element={<Legal />} />

          {/* AUTHENTIFICATION CLIENT */}
          <Route path="/login" element={<UserLogin />} />
          
          {/* ESPACE MEMBRES */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<MemberDetail />} />

          {/* ADMINISTRATION */}
          <Route path="/admin" element={<AdminPage />} /> 
          <Route path="/admin/inscriptions" element={<AdminInscriptions />} />
          <Route path="/admin/paiements" element={<AdminPaiements />} />
          <Route path="/admin/avis" element={<AdminReviews />} />
          <Route path="/admin/matching" element={<Matching />} />
          <Route path="/admin/parametres" element={<AdminSettings />} />
          
          {/* 404 - Toujours en dernier */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;