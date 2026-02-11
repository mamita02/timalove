import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../integrations/supabase/client";

interface SubscriptionButtonProps {
  userId: string;
}

const SubscriptionButton = ({ userId }: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("naboo-create", {
        body: { userId: user.id }
      });

      const { data, error } = response;

      if (error) {
        throw new Error(error.message);
      }

      // 🔥 FORCER PARSE
      const parsed =
        typeof data === "string"
          ? JSON.parse(data)
          : data;

      if (!parsed?.url) {
        throw new Error("URL manquante dans la réponse");
      }

      window.location.href = parsed.url;

    } catch (err) {
      console.error("Erreur paiement:", err);
      alert("Erreur de connexion au service de paiement.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-full shadow-lg"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Chargement...
        </span>
      ) : (
        "S'abonner – 5000 FCFA"
      )}
    </Button>
  );
};

export default SubscriptionButton;
