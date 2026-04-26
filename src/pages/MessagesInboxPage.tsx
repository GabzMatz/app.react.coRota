import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { messageService, type ConversationDto } from '../services/messageService';
import { userService } from '../services/userService';
import { countUnreadMessages } from '../utils/messageUnread';
import { useToast } from '../contexts/ToastContext';
import { getInitials } from '../utils/avatar';

interface MessagesInboxPageProps {
  onTabChange?: (tab: string) => void;
  onOpenChat: (conversationId: string, title: string, participantId: string) => void;
  onNewMessage: () => void;
}

const formatTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

export const MessagesInboxPage: React.FC<MessagesInboxPageProps> = ({
  onTabChange,
  onOpenChat,
  onNewMessage,
}) => {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ConversationDto[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>(
    {}
  );

  const myId = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw) return null;
      return JSON.parse(raw).id as string;
    } catch {
      return null;
    }
  })();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await messageService.listConversations();
      const getConversationTime = (conversation: ConversationDto) => {
        const timestamp = new Date(
          conversation.lastMessageAt || conversation.updatedAt
        ).getTime();
        return Number.isNaN(timestamp) ? 0 : timestamp;
      };

      const uniqueByParticipant = new Map<string, ConversationDto>();
      list.forEach((conversation) => {
        const otherId =
          conversation.participantIds.find((id) => id !== myId) ||
          conversation.participantIds[0];
        if (!otherId) return;

        const existing = uniqueByParticipant.get(otherId);
        if (!existing) {
          uniqueByParticipant.set(otherId, conversation);
          return;
        }

        if (getConversationTime(conversation) > getConversationTime(existing)) {
          uniqueByParticipant.set(otherId, conversation);
        }
      });

      const uniqueList = Array.from(uniqueByParticipant.values()).sort(
        (a, b) => getConversationTime(b) - getConversationTime(a)
      );
      setItems(uniqueList);

      const nameMap: Record<string, string> = {};
      const photoMap: Record<string, string> = {};
      await Promise.all(
        uniqueList.map(async (c) => {
          const otherId =
            c.participantIds.find((id) => id !== myId) || c.participantIds[0];
          if (!otherId) return;
          try {
            const u = await userService.getUserById(otherId);
            const name =
              `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Usuário';
            nameMap[c.id] = name;
            if (u.photo) {
              photoMap[c.id] = u.photo;
            }
          } catch {
            nameMap[c.id] = 'Usuário';
          }
        })
      );
      setTitles(nameMap);
      setPhotos(photoMap);

      const unreadEntries = await Promise.all(
        uniqueList.map(async (conversation) => {
          try {
            const messages = await messageService.listMessages(conversation.id);
            return [
              conversation.id,
              countUnreadMessages(messages, myId, conversation.id),
            ] as const;
          } catch {
            return [conversation.id, 0] as const;
          }
        })
      );
      setUnreadByConversation(Object.fromEntries(unreadEntries));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar mensagens.';
      showError(msg);
      setItems([]);
      setUnreadByConversation({});
    } finally {
      setLoading(false);
    }
  }, [myId, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  return (
    <div className="min-h-screen bg-white pb-24 flex flex-col">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-blue-600 to-blue-500 text-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mensagens</h1>
            <p className="text-sm text-blue-100 mt-1">Conversas com motoristas e passageiros</p>
          </div>
          <button
            type="button"
            onClick={onNewMessage}
            className="p-3 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Nova conversa"
          >
            <MessageSquarePlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm">Carregando conversas…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
              💬
            </div>
            <p className="text-gray-800 font-medium text-lg mb-2">Nenhuma conversa ainda</p>
            <p className="text-gray-500 text-sm mb-6">
              Toque no botão + para iniciar uma conversa com alguém das suas corridas.
            </p>
            <button
              type="button"
              onClick={onNewMessage}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full font-medium text-sm hover:bg-blue-700"
            >
              <MessageSquarePlus className="w-5 h-5" />
              Nova conversa
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((c) => {
              const otherId =
                c.participantIds.find((id) => id !== myId) || c.participantIds[0] || '';

              return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() =>
                    onOpenChat(c.id, titles[c.id] || 'Conversa', otherId)
                  }
                  className="w-full text-left px-4 py-4 flex gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {photos[c.id] ? (
                    <img src={photos[c.id]} alt={titles[c.id] || 'Usuário'} className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg shrink-0">
                      {getInitials(titles[c.id] || '?')}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-semibold text-gray-900 truncate">
                        {titles[c.id] || 'Carregando…'}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatTime(c.lastMessageAt || c.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {c.lastMessageText || 'Sem mensagens'}
                    </p>
                  </div>
                  {(unreadByConversation[c.id] || 0) > 0 && (
                    <span className="shrink-0 min-w-6 h-6 px-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                      {unreadByConversation[c.id] > 99 ? '99+' : unreadByConversation[c.id]}
                    </span>
                  )}
                </button>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      <BottomNav activeTab="messages" onTabChange={handleTabChange} />
    </div>
  );
};
