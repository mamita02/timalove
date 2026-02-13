import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AdminProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(!!data);
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
