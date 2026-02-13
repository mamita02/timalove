import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

// ADMIN LAYOUT
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";

// PAGES PUBLIQUES
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import MemberDetail from "./pages/MemberDetail";
import NotFound from "./pages/NotFound";
import QuiSuisJe from "./pages/QuiSuisJe";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import { UserLogin } from "./pages/UserLogin";
import UserProfile from "./pages/UserProfile";

// PAGES ADMIN
import AdminInscriptions from "./pages/AdminInscriptions";
import AdminPage from "./pages/AdminPage";
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

          {/* PUBLIC */}
          <Route path="/" element={<Index />} />
          <Route path="/qui-suis-je" element={<QuiSuisJe />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<MemberDetail />} />

          {/* ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminPage />} />

          {/* ADMIN PROTECTED */}
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route
              element={
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              }
            >
              <Route index element={<AdminInscriptions />} />
              <Route path="inscriptions" element={<AdminInscriptions />} />
              <Route path="matching" element={<Matching />} />
              <Route path="paiements" element={<AdminPaiements />} />
              <Route path="avis" element={<AdminReviews />} />
              <Route path="parametres" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
