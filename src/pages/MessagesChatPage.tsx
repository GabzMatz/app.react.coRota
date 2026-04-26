import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, X } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { messageService, type ChatMessageDto } from '../services/messageService';
import { userService } from '../services/userService';
import { rideService } from '../services/rideService';
import { companyService } from '../services/companyService';
import { markConversationAsRead } from '../utils/messageUnread';
import { useToast } from '../contexts/ToastContext';

interface MessagesChatPageProps {
  conversationId: string;
  title: string;
  participantId: string;
  onTabChange?: (tab: string) => void;
  onBack: () => void;
}

const POLL_MS = 3500;

export const MessagesChatPage: React.FC<MessagesChatPageProps> = ({
  conversationId,
  title,
  participantId,
  onTabChange,
  onBack,
}) => {
  const { showError } = useToast();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<{
    fullName: string;
    photoUrl: string | null;
    sharedRides: Array<{
      id: string;
      title: string;
      roleLabel: 'Motorista' | 'Passageiro';
      when: string;
    }>;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myId = (() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw) return null;
      return JSON.parse(raw).id as string;
    } catch {
      return null;
    }
  })();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const list = await messageService.listMessages(conversationId);
      setMessages(list);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar mensagens.';
      showError(msg);
    }
  }, [conversationId, showError]);

  const formatWhen = (dateValue: unknown, startTime?: string) => {
    let dateText = '';

    if (
      dateValue &&
      typeof dateValue === 'object' &&
      '_seconds' in (dateValue as Record<string, unknown>)
    ) {
      const sec = Number((dateValue as { _seconds: number })._seconds);
      dateText = new Date(sec * 1000).toLocaleDateString('pt-BR');
    } else if (typeof dateValue === 'string') {
      const d = new Date(dateValue);
      if (!Number.isNaN(d.getTime())) {
        dateText = d.toLocaleDateString('pt-BR');
      }
    }

    if (!dateText && startTime) return startTime;
    if (!startTime) return dateText;
    return `${dateText} · ${startTime}`;
  };

  const getAddressFromCoordinates = async (
    destinationLatLng: unknown
  ): Promise<string> => {
    if (!Array.isArray(destinationLatLng) || destinationLatLng.length < 2) {
      return '';
    }
    const lat = Number(destinationLatLng[0]);
    const lon = Number(destinationLatLng[1]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return '';
    }

    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`
      );
      if (!response.ok) return '';
      const data = (await response.json()) as {
        features?: Array<{ properties?: Record<string, unknown> }>;
      };
      const props = data.features?.[0]?.properties;
      if (!props) return '';

      const pieces = [
        typeof props.name === 'string' ? props.name : '',
        typeof props.street === 'string' ? props.street : '',
        typeof props.city === 'string' ? props.city : '',
      ].filter(Boolean);

      return pieces.join(', ');
    } catch {
      return '';
    }
  };

  const loadParticipantProfile = useCallback(async () => {
    if (!participantId || !myId) return;
    try {
      setLoadingProfile(true);
      const [participant, history] = await Promise.all([
        userService.getUserById(participantId),
        rideService.getRideHistory(myId),
      ]);

      const participantData = participant as unknown as Record<string, unknown>;
      const photoCandidate =
        participantData.photoUrl ||
        participantData.profilePhotoUrl ||
        participantData.avatarUrl;
      const photoUrl =
        typeof photoCandidate === 'string' && photoCandidate.length > 0
          ? photoCandidate
          : null;

      let participantCompanyName = '';
      if (participant.companyId) {
        try {
          const company = await companyService.getCompanyById(participant.companyId);
          participantCompanyName = company.name || '';
        } catch {
          participantCompanyName = '';
        }
      }

      const sharedRideEntries = (history as Array<Record<string, unknown>>)
        .filter((entry) => {
          const ride = entry.ride as Record<string, unknown> | undefined;
          if (!ride) return false;
          const role = entry.role;
          if (role === 'driver') {
            const pax = Array.isArray(ride.passengerIds)
              ? (ride.passengerIds as string[])
              : [];
            return pax.includes(participantId);
          }
          return ride.driverId === participantId;
        });

      const sharedRidesRaw = await Promise.all(
        sharedRideEntries.map(async (entry) => {
          const ride = entry.ride as Record<string, unknown> | undefined;
          if (!ride) return null;

          const rideId = ((ride.id as string) || (entry.rideId as string) || '').trim();
          if (!rideId) return null;

          const rawDestination =
            (ride.destinationName as string) ||
            (ride.destinationLabel as string) ||
            (ride.destinationAddress as string) ||
            (ride.destination as string) ||
            '';
          const geocodedDestination = rawDestination
            ? ''
            : await getAddressFromCoordinates(ride.destinationLatLng);
          const destinationSource = rawDestination || geocodedDestination;
          const destination = destinationSource
            ? destinationSource.split(',')[0].trim()
            : '';
          const goesToCompany =
            Boolean(ride.toCompany) ||
            Boolean(ride.destinationIsCompany) ||
            /empresa|company/i.test(destinationSource);

          const title = goesToCompany && participantCompanyName
            ? participantCompanyName
            : destination || 'Destino da corrida';

          return {
            id: rideId,
            title,
            roleLabel: entry.role === 'driver' ? 'Motorista' : 'Passageiro',
            when: formatWhen(ride.date, (ride.startTime as string) || (ride.time as string)),
          };
        })
      );

      const sharedRides = sharedRidesRaw.filter(
          (item): item is { id: string; title: string; roleLabel: 'Motorista' | 'Passageiro'; when: string } =>
            Boolean(item)
        );

      setProfile({
        fullName:
          `${participant.firstName || ''} ${participant.lastName || ''}`.trim() ||
          title,
        photoUrl,
        sharedRides,
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível carregar o mini perfil.';
      showError(msg);
    } finally {
      setLoadingProfile(false);
    }
  }, [myId, participantId, showError, title]);

  useEffect(() => {
    void fetchMessages();
    const id = window.setInterval(() => {
      void fetchMessages();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    if (!myId || messages.length === 0) return;
    const latestIncoming = messages
      .filter((msg) => msg.senderId !== myId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    markConversationAsRead(
      conversationId,
      latestIncoming?.createdAt || new Date().toISOString()
    );
  }, [conversationId, messages, myId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await messageService.sendMessage(conversationId, text);
      await fetchMessages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível enviar.';
      showError(msg);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const openProfile = async () => {
    setShowProfile(true);
    if (!profile && !loadingProfile) {
      await loadParticipantProfile();
    }
  };

  const formatBubbleTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-20">
      <header className="sticky top-0 z-10 flex items-center gap-2 px-2 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => void openProfile()}
            className="text-lg font-semibold text-gray-900 truncate text-left hover:text-blue-700 transition-colors"
          >
            {title}
          </button>
          <p className="text-xs text-gray-500">Mensagens são atualizadas automaticamente</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 pb-40 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-12">
            Nenhuma mensagem ainda. Diga oi! 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === myId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    mine
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">
                    {m.text}
                  </p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      mine ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {formatBubbleTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-[88px] left-0 right-0 px-3 py-2 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Mensagem…"
            rows={1}
            className="flex-1 resize-none max-h-28 rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            className="shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
            aria-label="Enviar"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 relative">
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              aria-label="Fechar mini perfil"
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {loadingProfile ? (
              <div className="py-10 text-center text-sm text-gray-500">Carregando perfil...</div>
            ) : (
              <>
                <div className="flex flex-col items-center text-center gap-3">
                  {profile?.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.fullName}
                      className="w-20 h-20 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 text-3xl font-semibold flex items-center justify-center">
                      {(profile?.fullName || title).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {profile?.fullName || title}
                  </h2>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">Corridas em comum</p>
                  {profile && profile.sharedRides.length > 0 ? (
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {profile.sharedRides.map((ride) => (
                        <li
                          key={ride.id}
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {ride.title}
                          </p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {ride.roleLabel}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ride.when || 'Data/hora não informada'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhuma corrida em comum encontrada.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav activeTab="messages" onTabChange={handleTabChange} />
    </div>
  );
};
