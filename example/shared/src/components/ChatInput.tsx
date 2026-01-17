import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DARK, DARK_BLUE, GAP, INPUT_HEIGHT, LIGHT_GRAY, SPACING } from '../utils';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatInput = forwardRef<TextInput, ChatInputProps>(
  ({ value, onChangeText, onSend }, ref) => {
    const insets = useSafeAreaInsets();
    const canSend = value.trim().length > 0;

    return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING) }]}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Type a message..."
            placeholderTextColor={LIGHT_GRAY}
            returnKeyType="send"
            onSubmitEditing={canSend ? onSend : undefined}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendDisabled,
            pressed && canSend && styles.sendPressed,
          ]}
          onPress={onSend}
          disabled={!canSend}
        >
          <Text style={[styles.sendText, !canSend && styles.sendTextDisabled]}>Send</Text>
        </Pressable>
      </View>
    );
  }
);

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingTop: SPACING,
    gap: GAP,
    backgroundColor: DARK,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: SPACING,
    height: INPUT_HEIGHT,
    borderRadius: INPUT_HEIGHT,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    height: INPUT_HEIGHT,
    color: 'white',
  },
  sendButton: {
    backgroundColor: DARK_BLUE,
    height: INPUT_HEIGHT,
    paddingHorizontal: SPACING,
    borderRadius: INPUT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendPressed: {
    opacity: 0.8,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendTextDisabled: {
    opacity: 0.7,
  },
});
