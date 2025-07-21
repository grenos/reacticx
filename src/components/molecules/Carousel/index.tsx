import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  FlatList,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { CarouselProps, CarouselRef } from "./types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Types
export interface CarouselItem {
  id: string | number;
  uri: string;
  title?: string;
  subtitle?: string;
  description?: string;
  [key: string]: any;
}

export const EnhancedCarousel = forwardRef<CarouselRef, CarouselProps>(
  <T,>(
    {
      data,
      renderItem,
      itemWidth = screenWidth * 0.7,
      itemHeight = screenWidth * 0.9,
      spacing = screenWidth * 0.05,
      enableBlurBackground = true,
      blurIntensity = 60,
      blurTint = "dark",
      blurRadius = 20,
      pagingEnabled = false,
      snapToInterval = false,
      onIndexChange,
      containerStyle,
      contentContainerStyle,
      backgroundImageArray,
      decelerationRate = "fast",
      scrollEventThrottle = 16,
      showsHorizontalScrollIndicator = false,
      bounces = true,
      bouncesZoom = true,
      enableMomentum = true,
    }: CarouselProps<T>,
    ref: React.Ref<CarouselRef>,
    // eslint-disable-next-line react/display-name
  ) => {
    const scrollX = useSharedValue(0);
    const currentIndex = useRef(0);
    const flatListRef = useRef<FlatList>(null);

    const ITEM_WIDTH = itemWidth;
    const SPACING = spacing;
    const SNAP_INTERVAL = snapToInterval ? ITEM_WIDTH + SPACING : undefined;

    const updateCurrentIndex = useCallback(
      (index: number) => {
        currentIndex.current = index;
        onIndexChange?.(index);
      },
      [onIndexChange],
    );

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
      },
      onMomentumEnd: (event) => {
        const index = Math.round(
          event.contentOffset.x / (ITEM_WIDTH + SPACING),
        );
        runOnJS(updateCurrentIndex)(index);
      },
    });

    const scrollToIndex = useCallback(
      (index: number, animated = true) => {
        flatListRef.current?.scrollToIndex({ index, animated });
        updateCurrentIndex(index);
      },
      [updateCurrentIndex],
    );

    const next = useCallback(() => {
      const nextIndex = Math.min(currentIndex.current + 1, data.length - 1);
      scrollToIndex(nextIndex);
    }, [data.length, scrollToIndex]);

    const prev = useCallback(() => {
      const prevIndex = Math.max(currentIndex.current - 1, 0);
      scrollToIndex(prevIndex);
    }, [data.length, scrollToIndex]);

    const renderBlurBackground = () => {
      if (!enableBlurBackground || !backgroundImageArray?.length) return null;

      return (
        <View style={StyleSheet.absoluteFillObject}>
          {data.map((_, index) => {
            const imageIndex = index % backgroundImageArray.length;
            const imageSource = backgroundImageArray[imageIndex];

            const animatedStyle = useAnimatedStyle(() => {
              const inputRange = [
                (index - 1) * (ITEM_WIDTH + SPACING),
                index * (ITEM_WIDTH + SPACING),
                (index + 1) * (ITEM_WIDTH + SPACING),
              ];

              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0, 1, 0],
                Extrapolate.CLAMP,
              );

              // Add a slight scale effect for smoother transitions
              const scale = interpolate(
                scrollX.value,
                inputRange,
                [1.1, 1, 1.1],
                Extrapolate.CLAMP,
              );

              return {
                opacity,
                transform: [{ scale }],
              };
            });

            return (
              <Animated.View
                key={`bg-${index}`}
                style={[StyleSheet.absoluteFillObject, animatedStyle]}
              >
                <Image
                  source={imageSource}
                  style={[StyleSheet.absoluteFillObject, { opacity: 0.8 }]}
                  blurRadius={blurRadius}
                  resizeMode="cover"
                  // Preload images to prevent flickering
                  onLoadStart={() => {}}
                  onLoad={() => {}}
                />
                <BlurView
                  intensity={blurIntensity}
                  tint={blurTint}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            );
          })}
        </View>
      );
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Improved Blur Background */}
        {renderBlurBackground()}

        <Animated.FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(_, index) => `item-${index}`}
          horizontal
          pagingEnabled={pagingEnabled}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          contentContainerStyle={[
            { paddingHorizontal: SPACING / 2 },
            contentContainerStyle,
          ]}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate={decelerationRate}
          scrollEventThrottle={scrollEventThrottle}
          bounces={bounces}
          bouncesZoom={bouncesZoom}
          onScroll={scrollHandler}
          renderItem={({ item, index }) =>
            renderItem!(item, index, scrollX) as any
          }
          onMomentumScrollEnd={(
            event: NativeSyntheticEvent<NativeScrollEvent>,
          ) => {
            if (!enableMomentum) return;
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (ITEM_WIDTH + SPACING),
            );
            updateCurrentIndex(index);
          }}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH + SPACING,
            offset: (ITEM_WIDTH + SPACING) * index,
            index,
          })}
          // Additional props for smoother scrolling
          removeClippedSubviews={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  defaultItemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 10,
    backgroundColor: "#222",
  },
  defaultShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#aaa",
    lineHeight: 16,
  },
});
