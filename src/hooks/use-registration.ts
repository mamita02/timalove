import { saveRegistrationLocally, submitRegistration, type RegistrationData } from "@/lib/api";
import { useState } from "react";

interface UseRegistrationReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  submitForm: (data: RegistrationData) => Promise<void>;
  reset: () => void;
}

/**
 * Hook personnalisé pour gérer la soumission du formulaire d'inscription
 */
export const useRegistration = (): UseRegistrationReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitForm = async (data: RegistrationData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Tentative d'envoi au serveur
      const response = await submitRegistration(data);

      if (response.success) {
        setSuccess(true);
      } else {
        // Si le serveur échoue, sauvegarder localement
        saveRegistrationLocally(data);
        throw new Error(response.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      // Sauvegarder localement en cas d'erreur
      saveRegistrationLocally(data);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
  };

  return {
    isSubmitting,
    error,
    success,
    submitForm,
    reset,
  };
};