export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  profession?: string;
  presentation: string;
  lookingFor: string;
  acceptTerms: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Envoie une inscription au serveur
 * @param data - Les données du formulaire d'inscription
 * @returns Promesse avec la réponse de l'API
 */
export const submitRegistration = async (
  data: RegistrationData
): Promise<ApiResponse> => {
  try {
    // TODO: Remplacer par votre véritable endpoint
    const API_URL = import.meta.env.VITE_API_URL || "/api";
    
    const response = await fetch(`${API_URL}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: "Inscription enregistrée avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'inscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};

/**
 * Envoie un email de notification (optionnel)
 * @param email - L'adresse email
 * @param name - Le nom du candidat
 */
export const sendConfirmationEmail = async (
  email: string,
  name: string
): Promise<ApiResponse> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "/api";
    
    const response = await fetch(`${API_URL}/notifications/confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: "Email de confirmation envoyé",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};

/**
 * Sauvegarde locale des données (fallback si le serveur est indisponible)
 * @param data - Les données à sauvegarder
 */
export const saveRegistrationLocally = (data: RegistrationData): void => {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("pendingRegistrations") || "[]"
    );
    registrations.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("pendingRegistrations", JSON.stringify(registrations));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde locale:", error);
  }
};

/**
 * Récupère les inscriptions sauvegardées localement
 */
export const getPendingRegistrations = (): Array<RegistrationData & { timestamp: string }> => {
  try {
    return JSON.parse(localStorage.getItem("pendingRegistrations") || "[]");
  } catch (error) {
    console.error("Erreur lors de la récupération des inscriptions:", error);
    return [];
  }
};

/**
 * Efface les inscriptions sauvegardées localement
 */
export const clearPendingRegistrations = (): void => {
  try {
    localStorage.removeItem("pendingRegistrations");
  } catch (error) {
    console.error("Erreur lors de l'effacement des inscriptions:", error);
  }
};