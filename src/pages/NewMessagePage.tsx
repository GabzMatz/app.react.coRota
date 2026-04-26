import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { rideService } from '../services/rideService';
import { userService } from '../services/userService';
import { messageService } from '../services/messageService';
import { useToast } from '../contexts/ToastContext';
import { RideStatus } from '../types';
import { getInitials } from '../utils/avatar';

interface NewMessagePageProps {
  onTabChange?: (tab: string) => void;
  onBack: () => void;
  onConversationReady: (conversationId: string, title: string, participantId: string) => void;
}

type HistoryItem = {
  id: string;
  rideId: string;
  role: 'driver' | 'passenger';
  status: string;
  ride: {
    id: string;
    driverId: string;
    passengerIds?: string[];
  };
};

type ContactItem = {
  participantId: string;
  rideId: string;
  name: string;
  photoUrl: string | null;
};

const isCanceled = (status: string) =>
  status === 'cancelled' ||
  status === 'canceled' ||
  status === RideStatus.CANCELED;

export const NewMessagePage: React.FC<NewMessagePageProps> = ({
  onTabChange,
  onBack,
  onConversationReady,
}) => {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const getMyId = async () => {
    const raw = localStorage.getItem('authUser');
    const cached = raw ? JSON.parse(raw) : null;
    if (cached?.id) return cached.id as string;
    const me = await userService.getMe();
    localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
    return me.id;
  };

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getMyId();
      const history = (await rideService.getRideHistory(userId)) as HistoryItem[];
      const filtered = history.filter((h) => h.ride && !isCanceled(h.status || ''));

      const firstRideByParticipant = new Map<string, string>();
      filtered.forEach((entry) => {
        const rideId = entry.ride?.id || entry.rideId;
        if (!rideId) return;

        if (entry.role === 'passenger') {
          const driverId = entry.ride.driverId;
          if (driverId && !firstRideByParticipant.has(driverId)) {
            firstRideByParticipant.set(driverId, rideId);
          }
          return;
        }

        const passengerIds = entry.ride.passengerIds ?? [];
        passengerIds.forEach((passengerId) => {
          if (passengerId && !firstRideByParticipant.has(passengerId)) {
            firstRideByParticipant.set(passengerId, rideId);
          }
        });
      });

      const uniqueParticipantIds = Array.from(firstRideByParticipant.keys());
      const fetchedContacts = await Promise.all(
        uniqueParticipantIds.map(async (participantId) => {
          const rideId = firstRideByParticipant.get(participantId) || '';
          try {
            const user = await userService.getUserById(participantId);
            const userData = user as unknown as Record<string, unknown>;
            const photoCandidate =
              userData.photoUrl ||
              userData.profilePhotoUrl ||
              userData.avatarUrl;
            const photoUrl =
              typeof photoCandidate === 'string' && photoCandidate.length > 0
                ? photoCandidate
                : null;
            const name =
              `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
            return {
              participantId,
              rideId,
              name,
              photoUrl,
            };
          } catch {
            return {
              participantId,
              rideId,
              name: 'Usuário',
              photoUrl: null,
            };
          }
        })
      );

      setContacts(fetchedContacts);
      setSelectedParticipantId(fetchedContacts[0]?.participantId ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar contatos.';
      showError(msg);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const openWith = async (rideId: string, participantId: string, title: string) => {
    try {
      const existingConversations = await messageService.listConversations();
      const existing = existingConversations
        .filter((conversation) => conversation.participantIds.includes(participantId))
        .sort((a, b) => {
          const aTime = new Date(a.lastMessageAt || a.updatedAt).getTime();
          const bTime = new Date(b.lastMessageAt || b.updatedAt).getTime();
          return bTime - aTime;
        })[0];

      if (existing) {
        onConversationReady(existing.id, title, participantId);
        return;
      }

      const { conversationId } = await messageService.openConversation(
        rideId,
        participantId
      );
      onConversationReady(conversationId, title, participantId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível abrir a conversa.';
      showError(msg);
    }
  };

  const handlePickContact = async (contact: ContactItem) => {
    if (!contact.rideId) {
      showError('Não foi encontrada corrida em comum para abrir conversa.');
      return;
    }
    setSelectedParticipantId(contact.participantId);
    await openWith(contact.rideId, contact.participantId, contact.name);
  };

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Nova conversa</h1>
          <p className="text-xs text-gray-500">Selecione com quem deseja falar</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-600 text-sm">Carregando…</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {contacts.length === 0 ? (
            <li className="px-4 py-16 text-center text-gray-500 text-sm">
              Nenhum contato disponível para iniciar uma conversa.
            </li>
          ) : (
            contacts.map((contact) => {
              const isSelected = selectedParticipantId === contact.participantId;
              return (
                <li key={contact.participantId}>
                  <button
                    type="button"
                    onClick={() => void handlePickContact(contact)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 ring-1 ring-inset ring-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {getInitials(contact.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {contact.name}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      <BottomNav activeTab="messages" onTabChange={handleTabChange} />
    </div>
  );
};
