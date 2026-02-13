/**
 * Service de notifications ADMIN
 * Version propre : Supabase uniquement (pas de localStorage)
 */

import { supabase } from "./supabase";

export interface Notification {
  id: string;
  type:
    | "new_registration"
    | "new_match"
    | "system"
    | "meeting_confirmed"
    | "new_like"
    | "admin_like"
    | "admin_request_received";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Récupérer toutes les notifications depuis la base
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from("notifications")
.select("*")
.in("type", ["admin_like", "admin_request_received"])
.order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Erreur récupération notifications:", error);
    return [];
  }

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    title: getTitleFromType(n.type),
    message: n.message,
    read: n.is_read,
    createdAt: n.created_at,
  }));
};

/**
 * Marquer une notification comme lue
 */
export const markAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error("Erreur markAsRead:", error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllAsRead = async (): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    console.error("Erreur markAllAsRead:", error);
  }
};

/**
 * Supprimer une notification
 */
export const removeNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur removeNotification:", error);
  }
};

/**
 * Générer un titre automatique selon le type
 */
const getTitleFromType = (type: string): string => {
  switch (type) {
    case "admin_like":
      return "Nouveau like";
    case "admin_request_received":
      return "Nouvelle demande";
    case "new_registration":
      return "Nouvelle inscription";
    case "new_match":
      return "Nouveau match";
    case "meeting_confirmed":
      return "Rendez-vous confirmé";
    case "system":
      return "Notification système";
    default:
      return "Notification";
  }
};
