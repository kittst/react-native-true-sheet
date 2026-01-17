import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { DARK_GRAY, GAP, GRAY, LIGHT_GRAY, SPACING, BLUE } from '../utils';
import type { MessagePreview } from '../services/messageService';

interface MessageItemProps {
  message: MessagePreview;
  onPress: () => void;
}

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export const MessageItem = ({ message, onPress }: MessageItemProps) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Avatar uri={message.user.avatar} size={48} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {message.user.name}
          </Text>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {message.lastMessage}
        </Text>
      </View>
      {message.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{message.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING,
    backgroundColor: DARK_GRAY,
    borderRadius: SPACING,
    gap: GAP,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: LIGHT_GRAY,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    color: GRAY,
    fontSize: 12,
    marginLeft: GAP,
  },
  preview: {
    color: GRAY,
    fontSize: 14,
  },
  badge: {
    backgroundColor: BLUE,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
