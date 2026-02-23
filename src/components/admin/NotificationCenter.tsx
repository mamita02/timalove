import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  removeNotification,
  type Notification
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, Heart, Info, Link, Trash2, UserPlus, Zap } from "lucide-react";
import { useEffect, useState } from "react";
export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.read).length);
  };

  loadNotifications();

  const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      async () => {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);




  const handleMarkAsRead = async (id: string) => {
  await markAsRead(id);

  const data = await getNotifications();
  setNotifications(data);
  setUnreadCount(data.filter((n) => !n.read).length);
};


  const handleMarkAllAsRead = async () => {
  await markAllAsRead();

  const data = await getNotifications();
  setNotifications(data);
  setUnreadCount(0);
};


  const handleRemove = async (id: string) => {
  await removeNotification(id);

  const data = await getNotifications();
  setNotifications(data);
  setUnreadCount(data.filter((n) => !n.read).length);
};


  // Dans ton switch getIcon
const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_registration': return <UserPlus className="h-4 w-4" />;
    case 'admin_like': return <Heart className="h-4 w-4" />; // Changé pour un Coeur
    case 'admin_request_received': return <Zap className="h-4 w-4" />; // Un éclair pour la demande
    case 'meeting_confirmed': return <Link className="h-4 w-4" />; // Symbole de lien pour match accepté
    default: return <Info className="h-4 w-4" />;
  }
};


  // Dans ton switch getColor
const getColor = (type: Notification['type']) => {
  switch (type) {
    case 'new_registration': return 'bg-blue-100 text-blue-600';
    case 'admin_like': return 'bg-rose-100 text-rose-600'; // Rose pour les likes
    case 'admin_request_received': return 'bg-amber-100 text-amber-600'; // Ambre pour les demandes
    case 'meeting_confirmed': return 'bg-green-100 text-green-700 font-bold'; // Vert pour l'action admin
    default: return 'bg-gray-100 text-gray-600';
  }
};


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Aucune nouvelle notification'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="w-full mb-4"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    notification.read
                      ? "bg-background"
                      : "bg-muted/50 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full", getColor(notification.type))}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemove(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
