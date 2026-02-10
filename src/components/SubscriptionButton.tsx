import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react"; // On utilise Loader2, c'est plus stable
import { useState } from "react";

const SubscriptionButton = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      console.log("Lancement du paiement pour l'utilisateur :", userId);

      const { data, error } = await supabase.functions.invoke('naboo-handler', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Pas d'URL de paiement reçue");
      }

    } catch (err: any) {
  console.error("Erreur complète:", err);

  const serverMessage =
    err?.context?.body?.error ||
    err?.message ||
    "Erreur inconnue";

  alert(`Erreur serveur : ${serverMessage}`);
}
 finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={loading}
      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Chargement...
        </span>
      ) : (
        "S'abonner - 5000 FCFA"
      )}
    </Button>
  );
};

export default SubscriptionButton;