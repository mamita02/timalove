import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md w-full">
        <div className="bg-card p-8 md:p-12 rounded-2xl shadow-elevated text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-primary-foreground" />
          </div>

          {/* Message de succès */}
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Inscription reçue !
          </h1>
          
          <p className="text-muted-foreground text-lg mb-6">
            Merci pour votre confiance. Notre équipe va examiner votre profil 
            avec attention et vous contactera très prochainement.
          </p>

          {/* Prochaines étapes */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-4">Prochaines étapes :</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  1
                </span>
                <span>Vérification de votre profil par notre équipe (24-48h)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  2
                </span>
                <span>Contact téléphonique pour un premier échange</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  3
                </span>
                <span>Début de votre accompagnement personnalisé</span>
              </li>
            </ol>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
            >
              <Home size={16} className="mr-2" />
              Retour à l'accueil
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="romantic"
              className="flex-1"
            >
              <ArrowLeft size={16} className="mr-2" />
              Revenir
            </Button>
          </div>

          {/* Note de confidentialité */}
          <p className="text-xs text-muted-foreground mt-6">
            Vous recevrez également un email de confirmation à l'adresse 
            indiquée dans le formulaire.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;