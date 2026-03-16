import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AdminProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const hasAdminAccess = async (userId: string) => {
    const { data: adminRow, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!adminError && !!adminRow) {
      return true;
    }

    const { data: registrationRow, error: registrationError } = await supabase
      .from("registrations")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!registrationError && registrationRow?.role === "admin") {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const allowed = await hasAdminAccess(session.user.id);
      setIsAdmin(allowed);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
