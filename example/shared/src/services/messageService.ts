// Types
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface MessagePreview {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSent: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// Sample data for generating mocks
const NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Eve Williams',
  'Frank Miller',
  'Grace Lee',
  'Henry Davis',
  'Ivy Chen',
  'Jack Wilson',
  'Kate Turner',
  'Leo Martinez',
];

const MESSAGE_SNIPPETS = [
  'Hey, how are you doing?',
  'Did you see the game last night?',
  'Can we meet tomorrow at 3pm?',
  'Thanks for the help earlier!',
  'Let me know when you are free',
  'That sounds great, count me in!',
  'I just finished the project',
  'Have you tried the new restaurant?',
  'Happy birthday! Hope you have a great day',
  'Quick question about the meeting',
  'Just wanted to check in',
  'See you at the office!',
];

const CHAT_MESSAGES = [
  'Hello!',
  'Hey there!',
  'How are you doing today?',
  'I am doing great, thanks for asking!',
  'What are you up to this weekend?',
  'Not much, just relaxing. You?',
  'Same here. Maybe catch a movie?',
  'Sounds like a plan!',
  'Which movie were you thinking?',
  'How about that new action film?',
  'Perfect, I heard it is really good',
  'Great, let us plan for Saturday then',
  'Works for me!',
  'See you then!',
  'Can not wait!',
];

// Helpers
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomItem = <T>(arr: readonly T[]): T => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index] as T;
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const getAvatarUrl = (index: number) => `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;

// Generate message previews
export const generateMessagePreviews = (count: number): MessagePreview[] => {
  const now = Date.now();
  const cacheId = generateId(); // Unique ID for this generation
  return Array.from({ length: count }, (_, i) => {
    const user: User = {
      id: `user-${cacheId}-${i}`,
      name: NAMES[i % NAMES.length]!,
      avatar: getAvatarUrl(i),
    };

    return {
      id: `preview-${cacheId}-${i}`,
      user,
      lastMessage: getRandomItem(MESSAGE_SNIPPETS),
      timestamp: new Date(now - i * 1000 * 60 * 30), // Each message 30 mins apart
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
    };
  });
};

// Generate chat messages for a conversation
export const generateChatMessages = (conversationId: string, count: number): ChatMessage[] => {
  const now = Date.now();
  const cacheId = generateId(); // Unique ID for this generation
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${cacheId}-${i}`,
    conversationId,
    senderId: i % 2 === 0 ? 'current-user' : 'other-user',
    text: CHAT_MESSAGES[i % CHAT_MESSAGES.length]!,
    timestamp: new Date(now - (count - 1 - i) * 1000 * 60 * 2), // Each message 2 mins apart
    isSent: i % 2 === 0,
  }));
};

// Store for pagination simulation
const messageCache = new Map<string, MessagePreview[]>();
const chatCache = new Map<string, ChatMessage[]>();

// Fetch message previews with pagination
export const fetchMessagePreviews = async (
  count: number,
  cursor?: string
): Promise<PaginatedResponse<MessagePreview>> => {
  // Simulate network latency
  await delay(300 + Math.random() * 200);

  // Get or generate cached data
  const cacheKey = `previews-${count}`;
  if (!messageCache.has(cacheKey)) {
    messageCache.set(cacheKey, generateMessagePreviews(count * 3)); // Generate extra for pagination
  }

  const allMessages = messageCache.get(cacheKey)!;
  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const pageSize = Math.min(count, 20);
  const endIndex = Math.min(startIndex + pageSize, allMessages.length);

  return {
    data: allMessages.slice(startIndex, endIndex),
    hasMore: endIndex < allMessages.length,
    nextCursor: endIndex < allMessages.length ? endIndex.toString() : undefined,
  };
};

// Fetch chat messages with pagination (for loading older messages)
export const fetchChatMessages = async (
  conversationId: string,
  count: number,
  cursor?: string
): Promise<PaginatedResponse<ChatMessage>> => {
  // Simulate network latency
  await delay(200 + Math.random() * 300);

  // Get or generate cached data
  const cacheKey = `chat-${conversationId}`;
  if (!chatCache.has(cacheKey)) {
    chatCache.set(cacheKey, generateChatMessages(conversationId, count * 3)); // Generate extra for pagination
  }

  const allMessages = chatCache.get(cacheKey)!;
  const endIndex = cursor ? parseInt(cursor, 10) : allMessages.length;
  const pageSize = Math.min(count, 20);
  const startIndex = Math.max(endIndex - pageSize, 0);

  return {
    data: allMessages.slice(startIndex, endIndex),
    hasMore: startIndex > 0,
    nextCursor: startIndex > 0 ? startIndex.toString() : undefined,
  };
};

// Send a new message
export const sendMessage = async (conversationId: string, text: string): Promise<ChatMessage> => {
  // Simulate network latency
  await delay(100 + Math.random() * 100);

  const newMessage: ChatMessage = {
    id: generateId(),
    conversationId,
    senderId: 'current-user',
    text,
    timestamp: new Date(),
    isSent: true,
  };

  // Add to cache if exists
  const cacheKey = `chat-${conversationId}`;
  if (chatCache.has(cacheKey)) {
    chatCache.get(cacheKey)!.push(newMessage);
  }

  return newMessage;
};

// Clear cache (useful for testing)
export const clearCache = () => {
  messageCache.clear();
  chatCache.clear();
};
