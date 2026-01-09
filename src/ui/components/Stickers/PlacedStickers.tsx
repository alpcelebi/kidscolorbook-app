import React, { memo, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useStickersStore } from '../../../features/stickers/store/stickersStore';
import { getStickerById, type PlacedSticker } from '../../../domain/entities/Sticker';

interface PlacedStickersProps {
  editable?: boolean;
}

function PlacedStickerItem({
  sticker,
  editable,
}: {
  sticker: PlacedSticker;
  editable: boolean;
}) {
  const updateStickerPosition = useStickersStore((state) => state.updateStickerPosition);
  const updateStickerScale = useStickersStore((state) => state.updateStickerScale);
  const removeSticker = useStickersStore((state) => state.removeSticker);

  const stickerData = getStickerById(sticker.stickerId);

  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const savedScale = useSharedValue(sticker.scale);

  // Keep refs for callbacks
  const callbacksRef = useRef({
    updateStickerPosition,
    updateStickerScale,
    removeSticker,
    stickerId: sticker.id
  });
  callbacksRef.current = {
    updateStickerPosition,
    updateStickerScale,
    removeSticker,
    stickerId: sticker.id
  };

  // Pan gesture for moving
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(editable)
        .onUpdate((event) => {
          translateX.value = event.translationX + sticker.x;
          translateY.value = event.translationY + sticker.y;
        })
        .onEnd(() => {
          const { updateStickerPosition: update, stickerId } = callbacksRef.current;
          runOnJS(update)(stickerId, translateX.value, translateY.value);
        })
        .runOnJS(true),
    [editable, sticker.x, sticker.y]
  );

  // Pinch gesture for scaling
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(editable)
        .onStart(() => {
          savedScale.value = scale.value;
        })
        .onUpdate((event) => {
          // Limit scale between 0.5 and 3
          const newScale = savedScale.value * event.scale;
          scale.value = Math.min(Math.max(newScale, 0.5), 3);
        })
        .onEnd(() => {
          const { updateStickerScale: update, stickerId } = callbacksRef.current;
          runOnJS(update)(stickerId, scale.value);
        })
        .runOnJS(true),
    [editable]
  );

  // Double tap for quick size change
  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(editable)
        .numberOfTaps(2)
        .onEnd(() => {
          // Cycle through sizes: 1 -> 1.5 -> 2 -> 0.75 -> 1
          const currentScale = scale.value;
          let newScale = 1;
          if (currentScale < 1) {
            newScale = 1;
          } else if (currentScale < 1.3) {
            newScale = 1.5;
          } else if (currentScale < 1.8) {
            newScale = 2;
          } else {
            newScale = 0.75;
          }
          scale.value = withSpring(newScale);
          const { updateStickerScale: update, stickerId } = callbacksRef.current;
          runOnJS(update)(stickerId, newScale);
        })
        .runOnJS(true),
    [editable]
  );

  // Long press for delete
  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .enabled(editable)
        .minDuration(500)
        .onEnd(() => {
          const { removeSticker: remove, stickerId } = callbacksRef.current;
          runOnJS(remove)(stickerId);
        })
        .runOnJS(true),
    [editable]
  );

  // Combine gestures: pinch + pan simultaneous, with double tap and long press
  const composedGesture = useMemo(
    () => Gesture.Race(
      Gesture.Simultaneous(panGesture, pinchGesture),
      doubleTapGesture,
      longPressGesture
    ),
    [panGesture, pinchGesture, doubleTapGesture, longPressGesture]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value - 25 },
      { translateY: translateY.value - 25 },
      { scale: scale.value },
      { rotate: `${sticker.rotation}deg` },
    ],
  }));

  if (!stickerData) return null;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.stickerContainer, animatedStyle]}>
        <Text style={styles.stickerEmoji}>{stickerData.emoji}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function PlacedStickersComponent({ editable = true }: PlacedStickersProps) {
  const placedStickers = useStickersStore((state) => state.placedStickers);

  return (
    <View style={styles.container} pointerEvents={editable ? 'auto' : 'none'}>
      {placedStickers.map((sticker) => (
        <PlacedStickerItem
          key={sticker.id}
          sticker={sticker}
          editable={editable}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  stickerContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerEmoji: {
    fontSize: 40,
  },
});

export const PlacedStickers = memo(PlacedStickersComponent);
