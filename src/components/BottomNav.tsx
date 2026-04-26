import React, { useCallback, useEffect, useState } from 'react';
import { Search, Plus, MessageCircle, User } from 'lucide-react';
import logo from '../assets/logo.png';
import { messageService, type ConversationDto } from '../services/messageService';
import { countUnreadMessages } from '../utils/messageUnread';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const LogoIcon = ({ size = 28, className = "" }) => (
  <img 
    src={logo} 
    alt="Logo" 
    width={size} 
    height={size} 
    className={className}
  />
);

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [unreadConversationsCount, setUnreadConversationsCount] = useState(0);

  const loadUnreadConversations = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUnreadConversationsCount(0);
      return;
    }

    const myId = (() => {
      try {
        const raw = localStorage.getItem('authUser');
        if (!raw) return null;
        return JSON.parse(raw).id as string;
      } catch {
        return null;
      }
    })();

    try {
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
        if (!existing || getConversationTime(conversation) > getConversationTime(existing)) {
          uniqueByParticipant.set(otherId, conversation);
        }
      });

      const uniqueList = Array.from(uniqueByParticipant.values());
      const unreadCounts: number[] = await Promise.all(
        uniqueList.map(async (conversation) => {
          try {
            const messages = await messageService.listMessages(conversation.id);
            return countUnreadMessages(messages, myId, conversation.id) > 0 ? 1 : 0;
          } catch {
            return 0;
          }
        })
      );

      setUnreadConversationsCount(
        unreadCounts.reduce((acc, current) => acc + current, 0)
      );
    } catch {
      setUnreadConversationsCount(0);
    }
  }, []);

  useEffect(() => {
    void loadUnreadConversations();
    const intervalId = window.setInterval(() => {
      void loadUnreadConversations();
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [loadUnreadConversations]);

  const tabs = [
    { id: 'search', icon: Search, label: 'Pesquisa' },
    { id: 'create', icon: Plus, label: 'Criar' },
    { id: 'routes', icon: LogoIcon, label: 'Rotas' },
    { id: 'messages', icon: MessageCircle, label: 'Mensagens' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300">
      <div className="flex justify-around items-center py-2 px-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              className={`flex flex-col justify-center items-center transition-colors border-none bg-transparent py-2 px-2 min-h-[60px] ${
                selected ? 'text-blue-700' : 'text-blue-600 opacity-80'
              }`}
            >
              {id === 'routes' ? (
                <Icon className="mb-1" />
              ) : (
                <div className="relative mb-2">
                  <Icon size={22} className={selected ? 'stroke-[2.5]' : ''} />
                  {id === 'messages' && unreadConversationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                      {unreadConversationsCount > 99 ? '99+' : unreadConversationsCount}
                    </span>
                  )}
                </div>
              )}
              <span
                className={`text-xs leading-tight ${
                  selected ? 'font-semibold' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
