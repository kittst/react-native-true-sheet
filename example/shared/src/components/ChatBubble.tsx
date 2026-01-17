import { StyleSheet, Text, View } from 'react-native';
import { BLUE, DARK_GRAY, GRAY, LIGHT_GRAY, SPACING } from '../utils';
import type { ChatMessage } from '../services/messageService';

interface ChatBubbleProps {
  message: ChatMessage;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isSent = message.isSent;

  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.text, isSent ? styles.sentText : styles.receivedText]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const BUBBLE_RADIUS = 18;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING,
    paddingVertical: 4,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING,
    paddingVertical: 10,
    borderRadius: BUBBLE_RADIUS,
  },
  sentBubble: {
    backgroundColor: BLUE,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: DARK_GRAY,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: LIGHT_GRAY,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  receivedTimestamp: {
    color: GRAY,
  },
});
