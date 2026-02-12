/**
 * Service de notifications pour l'admin
 */

import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'new_registration' | 'new_match' | 'system' | 'meeting_confirmed' | 'new_like';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

// Fonction pour générer un UUID compatible
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Stocker les notifications en mémoire (vous pouvez aussi utiliser Supabase Realtime)
let notifications: Notification[] = [];
let listeners: ((notifications: Notification[]) => void)[] = [];

/**
 * Ajouter une notification
 */
export const addNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  data?: any
) => {
  const notification: Notification = {
    id: generateUUID(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    data,
  };

  notifications.unshift(notification);
  notifyListeners();

  // Sauvegarder dans localStorage
  saveNotifications();

  return notification;
};

/**
 * Marquer une notification comme lue
 */
export const markAsRead = (id: string) => {
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    notifyListeners();
    saveNotifications();
  }
};

/**
 * Marquer toutes comme lues
 */
export const markAllAsRead = () => {
  notifications.forEach((n) => (n.read = true));
  notifyListeners();
  saveNotifications();
};

/**
 * Supprimer une notification
 */
export const removeNotification = (id: string) => {
  notifications = notifications.filter((n) => n.id !== id);
  notifyListeners();
  saveNotifications();
};

/**
 * Obtenir toutes les notifications
 */
export const getNotifications = (): Notification[] => {
  return notifications;
};

/**
 * Obtenir les non lues
 */
export const getUnreadCount = (): number => {
  return notifications.filter((n) => !n.read).length;
};

/**
 * S'abonner aux changements
 */
export const subscribeToNotifications = (
  callback: (notifications: Notification[]) => void
) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

/**
 * Notifier tous les listeners
 */
const notifyListeners = () => {
  listeners.forEach((listener) => listener([...notifications]));
};

/**
 * Sauvegarder dans localStorage
 */
const saveNotifications = () => {
  try {
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
};

/**
 * Charger depuis localStorage
 */
export const loadNotifications = () => {
  try {
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      notifications = JSON.parse(saved);
      notifyListeners();
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
  }
};

/**
 * Vérifier les nouvelles inscriptions (polling)
 */
let lastCheckTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h en arrière au démarrage

export const checkNewRegistrations = async () => {
  try {
    // Charger la dernière vérification depuis localStorage
    const savedLastCheck = localStorage.getItem('admin_last_check');
    if (savedLastCheck && !isNaN(Date.parse(savedLastCheck))) {
      lastCheckTime = new Date(savedLastCheck);
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('id, first_name, last_name, created_at')
      .gte('created_at', lastCheckTime.toISOString())
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      data.forEach((reg) => {
        addNotification(
          'new_registration',
          'Nouvelle inscription !',
          `${reg.first_name} ${reg.last_name} vient de s'inscrire`,
          { registrationId: reg.id }
        );
      });
    }

    lastCheckTime = new Date();
    // Sauvegarder dans localStorage
    localStorage.setItem('admin_last_check', lastCheckTime.toISOString());
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  }
};

/**
 * Démarrer la surveillance automatique
 */
export const startNotificationPolling = () => {
  // Vérifier toutes les 30 secondes
  const interval = setInterval(checkNewRegistrations, 30000);
  
  // Vérification initiale
  checkNewRegistrations();

  return () => clearInterval(interval);
};

// Charger les notifications au démarrage
loadNotifications();
