# Issue: FlatList won't scroll to bottom when TrueSheet opens

## Problem

In `ConversationSheet.tsx`, we have a chat interface inside a TrueSheet (bottom sheet). Messages are stored in chronological order (oldest first, newest last). When the sheet opens, we want the list to start scrolled to the bottom so users see the newest messages first.

**Current behavior:** The list always starts at the top (oldest messages visible).

**Expected behavior:** The list should start at the bottom (newest messages visible).

## Environment

- TrueSheet with `scrollable` prop enabled
- FlatList (non-inverted) inside the sheet
- Messages loaded before `present()` is called
- Variable height chat bubbles

## Attempts

### Attempt 1: Inverted FlatList

**Approach:** Use `inverted` prop on FlatList, reverse data order, scroll to offset 0.

**Result:** Inverted FlatList doesn't work properly inside TrueSheet - likely conflicts with the sheet's scroll handling.

### Attempt 2: setTimeout after present()

**Approach:** Call `scrollToEnd()` with a 150ms delay after `sheetRef.current?.present()`.

```tsx
sheetRef.current?.present();
setTimeout(() => {
  chatListRef.current?.scrollToEnd({ animated: false });
}, 150);
```

**Result:** Does not work. The timeout fires but the scroll doesn't happen - likely because the FlatList isn't fully laid out yet.

### Attempt 3: onDidPresent callback

**Approach:** Use TrueSheet's `onDidPresent` callback which fires after the sheet animation completes.

```tsx
<TrueSheet
  onDidPresent={() => {
    chatListRef.current?.scrollToEnd({ animated: false });
  }}
>
```

**Result:** Does not work. The callback fires but the FlatList content layout isn't finished yet.

### Attempt 4: onContentSizeChange on FlatList

**Approach:** Use FlatList's `onContentSizeChange` callback with a ref flag to trigger scroll when content is measured.

```tsx
const shouldScrollToEndRef = useRef(false);

// In present():
shouldScrollToEndRef.current = true;

// On FlatList:
onContentSizeChange={() => {
  if (shouldScrollToEndRef.current) {
    chatListRef.current?.scrollToEnd({ animated: false });
    shouldScrollToEndRef.current = false;
  }
}}
```

**Result:** Does not work. The callback fires but scroll still doesn't happen - possibly due to iOS scroll pinning not being complete.

### Attempt 5: nestedScrollEnabled + wrapper View + double requestAnimationFrame

**Approach:** Match the working `FlatListSheet.tsx` pattern:
1. Add `nestedScrollEnabled` to FlatList (required for scrolling inside TrueSheet)
2. Wrap FlatList in `<View style={{ flex: 1 }}>`
3. Use `onDidPresent` with double `requestAnimationFrame` for timing

```tsx
<TrueSheet
  onDidPresent={() => {
    if (shouldScrollToEndRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chatListRef.current?.scrollToEnd({ animated: false });
          shouldScrollToEndRef.current = false;
        });
      });
    }
  }}
>
  <View style={{ flex: 1 }}>
    <FlatList
      nestedScrollEnabled
      // ...
    />
  </View>
</TrueSheet>
```

**Result:** Does not work. Same behavior - list starts at top.

## Current Code State

File: `example/shared/src/components/sheets/ConversationSheet.tsx`

- Uses `scrollable` prop on TrueSheet
- Uses `nestedScrollEnabled` on FlatList
- FlatList wrapped in View with `flex: 1`
- `onDidPresent` with double `requestAnimationFrame`
- `shouldScrollToEndRef` flag set in `present()` method

## Observations

1. The `scrollToEnd()` call appears to execute (no errors), but has no visible effect
2. The FlatListSheet.tsx example works for normal scrolling but doesn't attempt scroll-to-bottom on present
3. The issue may be related to how TrueSheet's iOS scroll pinning interacts with programmatic scrolling
4. All timing-based approaches have failed, suggesting the issue isn't purely timing-related

### Attempt 6: initialScrollIndex + getItemLayout

**Approach:** Use `initialScrollIndex` to set initial position immediately, with `getItemLayout` providing estimated heights.

```tsx
const ESTIMATED_ITEM_HEIGHT = 80;
const getItemLayout = useCallback(
  (_data, index) => ({
    length: ESTIMATED_ITEM_HEIGHT,
    offset: ESTIMATED_ITEM_HEIGHT * index,
    index,
  }),
  []
);

<FlatList
  getItemLayout={getItemLayout}
  initialScrollIndex={chatMessages.length > 0 ? chatMessages.length - 1 : undefined}
  // ...
/>
```

**Result:** Partially worked - scrolled ~150px (about 2 items) but not to the bottom. FlatList calculates initial position before knowing true content height.

### Attempt 7: ScrollView with contentOffset

**Approach:** Replace FlatList with ScrollView which supports `contentOffset` prop for setting initial scroll position directly. Use a large Y value to start at bottom.

```tsx
<ScrollView
  ref={chatListRef}
  nestedScrollEnabled
  contentOffset={{ x: 0, y: 99999 }}  // Large value to start at bottom
  // ...
>
  {chatMessages.map((message) => (
    <ChatBubble key={message.id} message={message} />
  ))}
</ScrollView>
```

**Result:** Does not work - no scrolling at all. TrueSheet's native scroll pinning likely overrides the `contentOffset` prop.

### Attempt 8: CSS-based inversion with scaleY: -1

**Approach:** Use `transform: [{ scaleY: -1 }]` on ScrollView and each item to create a visually inverted list that starts at offset 0 (which appears at the bottom).

```tsx
<ScrollView style={{ transform: [{ scaleY: -1 }] }}>
  {[...chatMessages].reverse().map((message) => (
    <View key={message.id} style={{ transform: [{ scaleY: -1 }] }}>
      <ChatBubble message={message} />
    </View>
  ))}
</ScrollView>
```

**Result:** Does not work - `scaleY: -1` inverts touch coordinates, causing swipe-down to trigger sheet dismiss instead of scrolling up. Conflicts with TrueSheet's gesture handling.

### Attempt 9: FlashList v2 with maintainVisibleContentPosition

**Approach:** Use FlashList v2 with `maintainVisibleContentPosition` and `startRenderingFromBottom: true` which is designed for chat apps.

```tsx
<FlashList
  data={chatMessages}
  renderItem={({ item }) => <ChatBubble message={item} />}
  maintainVisibleContentPosition={{
    startRenderingFromBottom: true,
    autoscrollToBottomThreshold: 100,
  }}
  onStartReached={loadMoreChatMessages}
  drawDistance={500}
/>
```

**Result:** Does not work - content is blank with loading spinner, and scrolling triggers sheet dismiss instead of list scroll. FlashList v2 doesn't properly capture scroll events inside TrueSheet.

## Resolution

After 9 failed attempts, reverted to a simple FlatList that starts at the top. The "start at bottom" feature would require native changes to TrueSheet to support initial scroll offset.

## Remaining Options (if needed in future)

1. Disable TrueSheet's `scrollable` prop and manage scroll independently
2. Add native support for initial scroll offset in TrueSheet
3. File an issue with react-native-true-sheet repository
