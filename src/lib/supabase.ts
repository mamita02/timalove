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
  // AJOUTE CES LIGNES :
  photo_url?: string;
  photo_url_2?: string;
  photo_url_3?: string;
}

export interface RegistrationRecord extends RegistrationData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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
      photo_url: data.photo_url,
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
  // AJOUTE CES 3 LIGNES ICI :
  photo_url: r.photo_url,
  photo_url_2: r.photo_url_2,
  photo_url_3: r.photo_url_3,
});

export default supabase;