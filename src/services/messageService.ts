import { authService } from './authService';
import { API_BASE_URL } from '../config/api';

const baseURL = API_BASE_URL;

export interface ConversationDto {
  id: string;
  rideId: string;
  driverId: string;
  passengerId: string;
  participantIds: string[];
  lastMessageText?: string;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

class MessageService {
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

  async listConversations(): Promise<ConversationDto[]> {
    const response = await fetch(`${baseURL}/conversations`, {
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

  async openConversation(
    rideId: string,
    participantId: string
  ): Promise<{ conversationId: string }> {
    const response = await fetch(`${baseURL}/conversations/open`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ rideId, participantId }),
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

  async listMessages(conversationId: string): Promise<ChatMessageDto[]> {
    const response = await fetch(
      `${baseURL}/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'GET',
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

    return response.json();
  }

  async sendMessage(
    conversationId: string,
    text: string
  ): Promise<ChatMessageDto> {
    const response = await fetch(
      `${baseURL}/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          `Erro ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const messageService = new MessageService();
