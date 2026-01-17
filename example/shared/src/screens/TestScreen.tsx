import { useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TrueSheetProvider, type TrueSheet } from '@lodev09/react-native-true-sheet';

import { BLUE, GAP, LIGHT_GRAY, SPACING } from '../utils';
import { Button, ButtonGroup, Spacer } from '../components';
import { BasicSheet, PromptSheet, FlatListSheet, MessagesExampleSheet } from '../components/sheets';

interface TestScreenProps {
  onGoBack: () => void;
}

export const TestScreen = ({ onGoBack }: TestScreenProps) => {
  const basicSheet = useRef<TrueSheet>(null);
  const promptSheet = useRef<TrueSheet>(null);
  const flatListSheet = useRef<TrueSheet>(null);
  const messagesExampleSheet = useRef<TrueSheet>(null);

  const [itemCount, setItemCount] = useState(20);

  return (
    <TrueSheetProvider>
      <View style={styles.content}>
        <Button text="Go Back" onPress={onGoBack} />
        <Spacer />

        {/* Settings for Messages Example */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsLabel}>Messages Example Items: {itemCount}</Text>
          <ButtonGroup>
            <Button text="-5" onPress={() => setItemCount(Math.max(5, itemCount - 5))} />
            <Button text="+5" onPress={() => setItemCount(itemCount + 5)} />
          </ButtonGroup>
        </View>
        <Spacer />

        <Button text="Basic Sheet" onPress={() => basicSheet.current?.present()} />
        <Button text="Prompt Sheet" onPress={() => promptSheet.current?.present()} />
        <Button text="FlatList Sheet" onPress={() => flatListSheet.current?.present()} />
        <Button text="Messages Example" onPress={() => messagesExampleSheet.current?.present()} />

        <BasicSheet dimmed={false} ref={basicSheet} />
        <PromptSheet ref={promptSheet} />
        <FlatListSheet ref={flatListSheet} />
        <MessagesExampleSheet ref={messagesExampleSheet} itemCount={itemCount} />
      </View>
    </TrueSheetProvider>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: BLUE,
    padding: SPACING,
    gap: GAP,
  },
  settingsSection: {
    gap: GAP,
  },
  settingsLabel: {
    color: LIGHT_GRAY,
    fontSize: 16,
    fontWeight: '600',
  },
});
