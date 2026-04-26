import type { ChatMessageDto } from '../services/messageService';

const STORAGE_KEY = 'messagesReadAtByConversation';

type ReadMap = Record<string, string>;

const parseIsoTime = (iso?: string | null) => {
  if (!iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const readMap = (): ReadMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ReadMap;
  } catch {
    return {};
  }
};

const writeMap = (map: ReadMap) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const getConversationReadAt = (conversationId: string): string | null => {
  const map = readMap();
  return map[conversationId] || null;
};

export const markConversationAsRead = (
  conversationId: string,
  readAtIso?: string | null
) => {
  const map = readMap();
  const current = parseIsoTime(map[conversationId]);
  const nextIso = readAtIso || new Date().toISOString();
  const next = parseIsoTime(nextIso);

  if (next >= current) {
    map[conversationId] = nextIso;
    writeMap(map);
  }
};

export const countUnreadMessages = (
  messages: ChatMessageDto[],
  myId: string | null,
  conversationId: string
) => {
  const readAt = parseIsoTime(getConversationReadAt(conversationId));
  return messages.filter((msg) => {
    if (!myId) return false;
    if (msg.senderId === myId) return false;
    return parseIsoTime(msg.createdAt) > readAt;
  }).length;
};
