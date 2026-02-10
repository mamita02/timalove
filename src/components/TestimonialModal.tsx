import { supabase } from "@/lib/supabase";
import { Loader2, Send, Star, X } from "lucide-react";
import { useState } from "react";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const TestimonialModal = ({ isOpen, onClose, userId }: TestimonialModalProps) => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Si le modal n'est pas ouvert, on ne retourne rien (invisible)
  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      // Insertion dans la table existante
      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: userId,
          content: message,
          // Nous ajoutons ces champs optionnels pour enrichir l'avis
          // Si ta table n'a pas encore ces colonnes, voir l'étape SQL ci-dessous
          rating: rating, 
          is_verified: false 
        });

      if (error) throw error;

      setSuccess(true);
      
      // Fermeture automatique après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
        onClose();
      }, 2000);

    } catch (err) {
      console.error("Erreur lors de l'envoi de l'avis:", err);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Bouton Fermer (Croix) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-serif text-slate-800">Merci !</h3>
              <p className="text-slate-500">Votre histoire a bien été envoyée.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-slate-800 mb-2">Votre avis nous intéresse</h2>
                <p className="text-slate-500 text-sm">Comment s'est passée votre expérience ?</p>
              </div>

              <div className="space-y-5">
                {/* Notation Étoiles */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        type="button"
                        className={`transition-transform hover:scale-110 ${rating >= star ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                      >
                        <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Votre Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Racontez-nous..."
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none transition-all text-slate-800"
                  />
                </div>

                {/* Bouton Envoyer */}
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || !message.trim()}
                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl h-12 font-bold text-md shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Envoyer mon avis"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};