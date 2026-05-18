import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import {
  notificationService,
  type NotificationDto,
} from '../services/notificationService';
import { useToast } from '../contexts/ToastContext';
import { requestPushPermission } from '../utils/pushNotifications';

interface NotificationsPageProps {
  onTabChange?: (tab: string) => void;
  onOpenRideDetails?: (rideId: string) => void;
}

const POLL_MS = 15000;

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onTabChange,
  onOpenRideDetails,
}) => {
  const { showError, showSuccess } = useToast();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await notificationService.listNotifications();
      setItems(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar notificações.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void requestPushPermission();
    void notificationService.registerDevice().catch(() => undefined);
    void loadNotifications();
    const id = window.setInterval(() => {
      void loadNotifications();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadNotifications]);

  const handleMarkRead = async (notification: NotificationDto) => {
    if (notification.read) {
      return;
    }
    try {
      await notificationService.markAsRead(notification.id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao marcar como lida.';
      showError(msg);
    }
  };

  const handleNotificationClick = async (notification: NotificationDto) => {
    await handleMarkRead(notification);

    const canOpenRide =
      Boolean(notification.relatedId) &&
      (notification.type === 'ride' || notification.type === 'pickup');

    if (canOpenRide && notification.relatedId) {
      onOpenRideDetails?.(notification.relatedId);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      showSuccess('Todas as notificações foram marcadas como lidas.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao marcar notificações.';
      showError(msg);
    }
  };

  const formatWhen = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 pt-5 pb-5 mb-4 px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notificações</h1>
        {items.some((item) => !item.read) && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="text-white text-sm flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <CheckCheck size={16} />
            Marcar todas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-16 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhuma notificação por enquanto.</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {items.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => void handleNotificationClick(notification)}
              className={`w-full text-left rounded-lg border p-4 transition-colors ${
                notification.read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
              <p className="text-xs text-gray-400 mt-2">{formatWhen(notification.createdAt)}</p>
            </button>
          ))}
        </div>
      )}

      <BottomNav activeTab="notifications" onTabChange={onTabChange} />
    </div>
  );
};
