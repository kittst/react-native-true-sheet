import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  type ChatMessage,
  fetchChatMessages,
  type MessagePreview,
  sendMessage,
} from '../../services/messageService';
import { DARK, DARK_GRAY, GAP, GRAY, LIGHT_GRAY, SPACING } from '../../utils';
import { ChatBubble } from '../ChatBubble';
import { ChatInput } from '../ChatInput';

export interface ConversationSheetRef {
  present: (conversation: MessagePreview) => void;
  dismiss: () => void;
}

const ConversationHeader = ({
  user,
  onBack,
}: {
  user: MessagePreview['user'] | null;
  onBack: () => void;
}) => (
  <View style={styles.conversationHeader}>
    <Pressable
      onPress={onBack}
      style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
    >
      <Text style={styles.headerButtonText}>Back</Text>
    </Pressable>
    {user && (
      <View style={styles.conversationUserInfo}>
        <Text style={styles.conversationUserName}>{user.name}</Text>
      </View>
    )}
    <View style={styles.headerSpacer} />
  </View>
);

export const ConversationSheet = forwardRef<ConversationSheetRef, object>((_props, ref) => {
  const sheetRef = useRef<TrueSheet>(null);
  const chatListRef = useRef<FlatList<ChatMessage>>(null);
  const chatInputRef = useRef<TextInput>(null);
  const chatLoadingMoreRef = useRef(false);

  const [selectedConversation, setSelectedConversation] = useState<MessagePreview | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLoadingMore, setChatLoadingMore] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(true);
  const [chatCursor, setChatCursor] = useState<string | undefined>();
  const [inputText, setInputText] = useState('');

  const loadChatMessages = useCallback(async (conversationId: string) => {
    setChatLoading(true);
    setChatMessages([]);
    setChatCursor(undefined);
    try {
      const response = await fetchChatMessages(conversationId, 20);
      setChatMessages(response.data.slice().reverse());
      setChatHasMore(response.hasMore);
      setChatCursor(response.nextCursor);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const loadMoreChatMessages = useCallback(async () => {
    if (chatLoadingMoreRef.current || !chatHasMore || !chatCursor || !selectedConversation) return;

    chatLoadingMoreRef.current = true;
    setChatLoadingMore(true);
    try {
      const response = await fetchChatMessages(selectedConversation.id, 20, chatCursor);
      setChatMessages((prev) => [...prev, ...response.data.slice().reverse()]);
      setChatHasMore(response.hasMore);
      setChatCursor(response.nextCursor);
    } finally {
      setChatLoadingMore(false);
      chatLoadingMoreRef.current = false;
    }
  }, [chatCursor, chatHasMore, selectedConversation]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedConversation) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const newMessage = await sendMessage(selectedConversation.id, text);
      setChatMessages((prev) => [newMessage, ...prev]);

      setTimeout(() => {
        chatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch {
      setInputText(text);
    }
  }, [inputText, selectedConversation]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(ref, () => ({
    present: async (conversation: MessagePreview) => {
      setSelectedConversation(conversation);
      await loadChatMessages(conversation.id);
      sheetRef.current?.present();
    },
    dismiss: () => {
      handleBack();
    },
  }));

  const renderChatBubble = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  const chatKeyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <TrueSheet
      ref={sheetRef}
      name="conversation"
      detents={[0.7, 1]}
      backgroundBlur="dark"
      backgroundColor={DARK}
      scrollable
      header={<ConversationHeader user={selectedConversation?.user ?? null} onBack={handleBack} />}
      footer={
        <ChatInput
          ref={chatInputRef}
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
        />
      }
      onBackPress={handleBack}
    >
      {chatLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GRAY} />
        </View>
      ) : (
        <FlatList
          ref={chatListRef}
          inverted
          data={chatMessages}
          renderItem={renderChatBubble}
          keyExtractor={chatKeyExtractor}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chatContent}
          onEndReached={loadMoreChatMessages}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            chatLoadingMore ? (
              <View style={styles.headerLoader}>
                <ActivityIndicator size="small" color={GRAY} />
              </View>
            ) : null
          }
        />
      )}
    </TrueSheet>
  );
});

ConversationSheet.displayName = 'ConversationSheet';

const styles = StyleSheet.create({
  chatContent: {
    paddingTop: SPACING + 100,
    paddingBottom: SPACING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING * 2,
  },
  headerLoader: {
    paddingVertical: SPACING,
    alignItems: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: SPACING,
    backgroundColor: DARK,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: DARK_GRAY,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerButtonText: {
    color: LIGHT_GRAY,
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  conversationUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  conversationUserName: {
    color: LIGHT_GRAY,
    fontSize: 16,
    fontWeight: '600',
  },
});
