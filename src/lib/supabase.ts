/**
 * Configuration et service Supabase pour TimaLove Match
 * Version mise à jour : Sans statuts, avec tous les champs clients.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. TYPES MIS À JOUR
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  country: string;       // Pays d'origine
  residenceCountry: string; // Pays de résidence
  gender: string;
  religion: string;      // Religion du client
  profession?: string;
  presentation: string;
  lookingFor: string;
}

export interface RegistrationRecord extends RegistrationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
}

export interface SupabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfileLike {
  id: string;
  likerId: string;
  likedId: string;
  createdAt: string;
  likerName?: string;
  likedName?: string;
}

/// Récupération des clés avec une sécurité "fail-safe"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation stricte : si une clé manque, on arrête tout avec un message clair
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Les variables d'environnement VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY sont manquantes. " +
    "Vérifiez votre fichier .env à la racine du projet."
  );
}

// Initialisation unique
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Crucial pour garder la session active entre les rechargements
    autoRefreshToken: true,
  }
});

/**
 * CRÉER UNE INSCRIPTION
 */
export const createRegistration = async (
  data: RegistrationData
): Promise<SupabaseResponse<RegistrationRecord>> => {
  try {
    // Mapping CamelCase (Frontend) -> SnakeCase (Base de données)
    const dbData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      age: data.age,
      city: data.city,
      country: data.country,
      residence_country: data.residenceCountry,
      gender: data.gender,
      religion: data.religion,
      profession: data.profession || null,
      presentation: data.presentation,
      looking_for: data.lookingFor,
    };

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Email déjà enregistré.' };
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: mapRecord(registration)
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * RÉCUPÉRER TOUTES LES INSCRIPTIONS (DASHBOARD)
 */
export const getAllRegistrations = async (options?: { limit?: number }): Promise<SupabaseResponse<RegistrationRecord[]>> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(options?.limit || 200);

    if (error) throw error;

    return {
      success: true,
      data: data.map(mapRecord)
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * SUPPRIMER UNE INSCRIPTION
 */
export const deleteRegistration = async (id: string): Promise<SupabaseResponse> => {
  try {
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * FONCTION DE MAPPING INTERNE (Evite les répétitions de code)
 * Transforme le format SQL (underscore) en format JS (camelCase)
 */
const mapRecord = (r: any): RegistrationRecord => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  age: r.age,
  city: r.city,
  country: r.country,
  residenceCountry: r.residence_country,
  gender: r.gender,
  religion: r.religion,
  profession: r.profession,
  presentation: r.presentation,
  lookingFor: r.looking_for,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/**
 * Obtenir les statistiques des inscriptions
 */
export const getRegistrationStats = async () => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('status');

    if (error) throw error;

    const total = data?.length || 0;
    const pending = data?.filter(r => r.status === 'pending').length || 0;
    const approved = data?.filter(r => r.status === 'approved').length || 0;
    const rejected = data?.filter(r => r.status === 'rejected').length || 0;

    return {
      success: true,
      data: { total, pending, approved, rejected }
    };
  } catch (error) {
    console.error('Erreur stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      data: { total: 0, pending: 0, approved: 0, rejected: 0 }
    };
  }
};

/**
 * FONCTIONS DE LIKES
 */

/**
 * Liker un profil
 */
export const likeProfile = async (likerId: string, likedId: string) => {
  try {
    const { data, error } = await supabase
      .from('profile_likes')
      .insert([
        {
          liker_id: likerId,
          liked_id: likedId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erreur like:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du like',
    };
  }
};

/**
 * Supprimer un like (unlike)
 */
export const unlikeProfile = async (likerId: string, likedId: string) => {
  try {
    const { error } = await supabase
      .from('profile_likes')
      .delete()
      .match({ liker_id: likerId, liked_id: likedId });

    if (error) throw error;

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur unlike:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du unlike',
    };
  }
};

/**
 * Obtenir tous les likes pour l'admin (avec notifications)
 */
export const getAllLikes = async () => {
  try {
    const { data, error } = await supabase
      .from('profile_likes')
      .select(`
        id,
        liker_id,
        liked_id,
        created_at,
        liker:liker_id(first_name, last_name, email),
        liked:liked_id(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erreur get likes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des likes',
    };
  }
};

/**
 * Obtenir le nombre de likes d'un profil
 */
export const getProfileLikesCount = async (profileId: string) => {
  try {
    const { count, error } = await supabase
      .from('profile_likes')
      .select('*', { count: 'exact', head: true })
      .eq('liked_id', profileId);

    if (error) throw error;

    return {
      success: true,
      data: count || 0,
    };
  } catch (error) {
    console.error('Erreur count likes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du comptage des likes',
    };
  }
};

export default supabase;