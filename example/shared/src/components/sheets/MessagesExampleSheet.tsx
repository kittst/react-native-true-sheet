import { TrueSheet, type TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  clearCache,
  fetchMessagePreviews,
  type MessagePreview,
} from '../../services/messageService';
import { DARK, DARK_GRAY, GRAY, LIGHT_GRAY, SPACING } from '../../utils';
import { MessageItem } from '../MessageItem';
import { Spacer } from '../Spacer';
import { ConversationSheet, type ConversationSheetRef } from './ConversationSheet';

interface MessagesExampleSheetProps extends TrueSheetProps {
  itemCount?: number;
}

const MessagesHeader = ({ onClose }: { onClose: () => void }) => (
  <View style={styles.messagesHeader}>
    <Pressable
      onPress={onClose}
      style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
    >
      <Text style={styles.headerButtonText}>Close</Text>
    </Pressable>
    <Text style={styles.headerTitle}>Messages</Text>
    <View style={styles.headerSpacer} />
  </View>
);

export const MessagesExampleSheet = forwardRef<TrueSheet, MessagesExampleSheetProps>(
  (props, ref) => {
    const { itemCount = 20, ...rest } = props;
    const insets = useSafeAreaInsets();

    const sheetRef = useRef<TrueSheet>(null);
    const conversationSheetRef = useRef<ConversationSheetRef>(null);
    const messagesLoadingRef = useRef(false);

    const [messages, setMessages] = useState<MessagePreview[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesHasMore, setMessagesHasMore] = useState(true);
    const [messagesCursor, setMessagesCursor] = useState<string | undefined>();

    useImperativeHandle<TrueSheet | null, TrueSheet | null>(ref, () => sheetRef.current);

    const loadMessages = useCallback(async () => {
      messagesLoadingRef.current = false;
      setMessagesLoading(true);
      clearCache();
      try {
        const response = await fetchMessagePreviews(itemCount);
        setMessages(response.data);
        setMessagesHasMore(response.hasMore);
        setMessagesCursor(response.nextCursor);
      } finally {
        setMessagesLoading(false);
      }
    }, [itemCount]);

    const loadMoreMessages = useCallback(async () => {
      if (messagesLoadingRef.current || !messagesHasMore || !messagesCursor) return;

      messagesLoadingRef.current = true;
      setMessagesLoading(true);
      try {
        const response = await fetchMessagePreviews(itemCount, messagesCursor);
        setMessages((prev) => [...prev, ...response.data]);
        setMessagesHasMore(response.hasMore);
        setMessagesCursor(response.nextCursor);
      } finally {
        setMessagesLoading(false);
        messagesLoadingRef.current = false;
      }
    }, [itemCount, messagesCursor, messagesHasMore]);

    const handleOpenConversation = useCallback((message: MessagePreview) => {
      conversationSheetRef.current?.present(message);
    }, []);

    const handleClose = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    useEffect(() => {
      loadMessages();
    }, [loadMessages]);

    const renderMessageItem = useCallback(
      ({ item }: { item: MessagePreview }) => (
        <MessageItem message={item} onPress={() => handleOpenConversation(item)} />
      ),
      [handleOpenConversation]
    );

    const messageKeyExtractor = useCallback((item: MessagePreview) => item.id, []);

    return (
      <TrueSheet
        ref={sheetRef}
        name="messages-example"
        detents={[0.6]}
        backgroundBlur="dark"
        backgroundColor={DARK}
        scrollable
        header={<MessagesHeader onClose={handleClose} />}
        onDidPresent={() => console.log('MessagesExample sheet presented')}
        onDidDismiss={() => console.log('MessagesExample sheet dismissed')}
        {...rest}
      >
        <Pressable style={styles.wrapper} onPress={Keyboard.dismiss}>
          {messagesLoading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={GRAY} />
            </View>
          ) : (
            <FlatList
              nestedScrollEnabled
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={messageKeyExtractor}
              contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom }]}
              ItemSeparatorComponent={Spacer}
              onEndReached={loadMoreMessages}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                messagesLoading && messages.length > 0 ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={GRAY} />
                  </View>
                ) : null
              }
            />
          )}
        </Pressable>

        <ConversationSheet ref={conversationSheetRef} />
      </TrueSheet>
    );
  }
);

MessagesExampleSheet.displayName = 'MessagesExampleSheet';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING * 2,
  },
  footerLoader: {
    paddingVertical: SPACING,
    alignItems: 'center',
  },
  messagesHeader: {
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
  headerTitle: {
    color: LIGHT_GRAY,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
});
