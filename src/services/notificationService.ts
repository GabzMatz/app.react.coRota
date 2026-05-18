import { authService } from './authService';
import { API_BASE_URL } from '../config/api';
import { registerWebPushToken } from '../utils/pushNotifications';

const baseURL = API_BASE_URL;

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'ride' | 'message' | 'pickup' | 'system';
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

class NotificationService {
  private headers(): HeadersInit {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async listNotifications(): Promise<NotificationDto[]> {
    const response = await fetch(`${baseURL}/notifications`, {
      method: 'GET',
      headers: this.headers(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          `Erro ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${baseURL}/notifications/unread-count`, {
      method: 'GET',
      headers: this.headers(),
    });

    if (!response.ok) {
      return 0;
    }

    const data = (await response.json()) as { count?: number };
    return Number(data.count ?? 0);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(
      `${baseURL}/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: 'PATCH',
        headers: this.headers(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          `Erro ${response.status}: ${response.statusText}`
      );
    }
  }

  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${baseURL}/notifications/read-all`, {
      method: 'PATCH',
      headers: this.headers(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          `Erro ${response.status}: ${response.statusText}`
      );
    }
  }

  async registerDevice(): Promise<void> {
    const token = await registerWebPushToken();
    if (!token) {
      return;
    }

    await fetch(`${baseURL}/notifications/register-device`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ token, platform: 'web' }),
    });
  }
}

export const notificationService = new NotificationService();
