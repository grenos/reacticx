import React, {
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
  cancelAnimation,
  Easing,
  useDerivedValue,
  withRepeat,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export type AnimationType =
  | "fade"
  | "slideLeft"
  | "slideRight"
  | "slideUp"
  | "slideDown"
  | "scale"
  | "scaleRotate"
  | "flip"
  | "blur"
  | "slideScale"
  | "rotateSlide"
  | "elastic"
  | "bounce"
  | "spiral"
  | "wave"
  | "glitch";

export interface AnimatedBackgroundProps {
  sources: (ImageSourcePropType | string)[];
  duration?: number;
  animationType?: AnimationType;
  enableBlur?: boolean;
  blurIntensity?: number;
  style?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  onTransition?: (currentIndex: number) => void;
  paused?: boolean;
  loop?: boolean;
  children?: ReactNode;
  transitionDuration?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  sources,
  duration = 4000,
  animationType = "fade",
  enableBlur = false,
  blurIntensity = 20,
  style,
  resizeMode = "cover",
  onTransition,
  paused = false,
  loop = true,
  children,
  transitionDuration = 800,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fixed number of image layers (current and next)
  const currentOpacity = useSharedValue(1);
  const nextOpacity = useSharedValue(0);

  const currentTranslateX = useSharedValue(0);
  const currentTranslateY = useSharedValue(0);
  const currentScale = useSharedValue(1);
  const currentRotation = useSharedValue(0);
  const currentSkewX = useSharedValue(0);

  const nextTranslateX = useSharedValue(0);
  const nextTranslateY = useSharedValue(0);
  const nextScale = useSharedValue(1);
  const nextRotation = useSharedValue(0);
  const nextSkewX = useSharedValue(0);

  // Global effects
  const blurRadius = useSharedValue(0);
  const brightness = useSharedValue(1);
  const contrast = useSharedValue(1);

  // Ultra-smooth easing
  const ultraSmoothEasing = Easing.bezier(0.25, 0.46, 0.45, 0.94);
  const elasticEasing = Easing.bezier(0.68, -0.55, 0.265, 1.55);

  const getAnimationConfig = (
    type: "smooth" | "elastic" | "bounce" = "smooth",
  ) => {
    const configs = {
      smooth: {
        duration: transitionDuration,
        easing: ultraSmoothEasing,
      },
      elastic: {
        duration: transitionDuration * 1.2,
        easing: elasticEasing,
      },
      bounce: {
        duration: transitionDuration * 0.8,
        easing: Easing.bounce,
      },
    };
    return configs[type];
  };

  const preloadImage = async (source: ImageSourcePropType | string) => {
    if (typeof source === "string") {
      await Image.prefetch(source);
    }
  };

  // Reset animation values
  const resetValues = () => {
    "worklet";
    currentTranslateX.value = 0;
    currentTranslateY.value = 0;
    currentScale.value = 1;
    currentRotation.value = 0;
    currentSkewX.value = 0;

    nextTranslateX.value = 0;
    nextTranslateY.value = 0;
    nextScale.value = 1;
    nextRotation.value = 0;
    nextSkewX.value = 0;

    brightness.value = 1;
    contrast.value = 1;
  };

  const executeTransition = () => {
    "worklet";

    resetValues();

    const config = getAnimationConfig("smooth");

    switch (animationType) {
      case "fade":
        nextOpacity.value = withTiming(1, config, () => {
          currentOpacity.value = 0;
        });
        break;

      case "slideLeft":
        nextOpacity.value = withTiming(1, config, () => {
          currentOpacity.value = 0; // Fade out only AFTER next is fully visible
        });
        break;

      case "slideRight":
        nextTranslateX.value = -SCREEN_WIDTH;
        nextOpacity.value = 1;
        currentTranslateX.value = withTiming(SCREEN_WIDTH, config);
        nextTranslateX.value = withTiming(0, config);
        currentOpacity.value = withDelay(
          config.duration * 0.6,
          withTiming(0, { duration: config.duration * 0.4 }),
        );
        break;

      case "slideUp":
        nextTranslateY.value = SCREEN_HEIGHT;
        nextOpacity.value = 1;
        currentTranslateY.value = withTiming(-SCREEN_HEIGHT, config);
        nextTranslateY.value = withTiming(0, config);
        currentOpacity.value = withDelay(
          config.duration * 0.6,
          withTiming(0, { duration: config.duration * 0.4 }),
        );
        break;

      case "slideDown":
        nextTranslateY.value = -SCREEN_HEIGHT;
        nextOpacity.value = 1;
        currentTranslateY.value = withTiming(SCREEN_HEIGHT, config);
        nextTranslateY.value = withTiming(0, config);
        currentOpacity.value = withDelay(
          config.duration * 0.6,
          withTiming(0, { duration: config.duration * 0.4 }),
        );
        break;

      case "scale":
        currentScale.value = withTiming(0.8, config);
        currentOpacity.value = withTiming(0, config);
        nextScale.value = 1.2;
        nextOpacity.value = withTiming(1, config);
        nextScale.value = withTiming(1, config);
        break;

      case "scaleRotate":
        currentScale.value = withTiming(0.3, config);
        currentRotation.value = withTiming(180, config);
        currentOpacity.value = withTiming(0, config);

        nextScale.value = 0.3;
        nextRotation.value = -180;
        nextOpacity.value = withTiming(1, config);
        nextScale.value = withTiming(1, config);
        nextRotation.value = withTiming(0, config);
        break;

      case "flip":
        currentRotation.value = withTiming(90, {
          duration: config.duration / 2,
        });
        currentOpacity.value = withTiming(0, { duration: config.duration / 2 });

        nextRotation.value = -90;
        nextOpacity.value = 0;
        nextRotation.value = withDelay(
          config.duration / 2,
          withTiming(0, { duration: config.duration / 2 }),
        );
        nextOpacity.value = withDelay(
          config.duration / 2,
          withTiming(1, { duration: config.duration / 2 }),
        );
        break;

      case "blur":
        blurRadius.value = withTiming(30, { duration: config.duration / 2 });
        nextOpacity.value = withTiming(1, config);
        currentOpacity.value = withDelay(
          config.duration * 0.3,
          withTiming(0, { duration: config.duration * 0.7 }),
        );
        blurRadius.value = withDelay(
          config.duration / 2,
          withTiming(0, { duration: config.duration / 2 }),
        );
        break;

      case "slideScale":
        currentTranslateX.value = withTiming(-SCREEN_WIDTH * 0.3, config);
        currentScale.value = withTiming(0.7, config);
        currentOpacity.value = withTiming(0, config);

        nextTranslateX.value = SCREEN_WIDTH * 0.3;
        nextScale.value = 1.3;
        nextOpacity.value = withTiming(1, config);
        nextTranslateX.value = withTiming(0, config);
        nextScale.value = withTiming(1, config);
        break;

      case "rotateSlide":
        currentRotation.value = withTiming(45, config);
        currentTranslateY.value = withTiming(-SCREEN_HEIGHT, config);
        currentOpacity.value = withTiming(0, config);

        nextRotation.value = -45;
        nextTranslateY.value = SCREEN_HEIGHT;
        nextOpacity.value = withTiming(1, config);
        nextRotation.value = withTiming(0, config);
        nextTranslateY.value = withTiming(0, config);
        break;

      case "elastic":
        currentScale.value = withTiming(0, config);
        currentOpacity.value = withTiming(0, config);

        nextScale.value = 0;
        nextOpacity.value = withTiming(1, { duration: config.duration / 2 });
        nextScale.value = withSpring(1, {
          damping: 8,
          stiffness: 100,
          mass: 1,
        });
        break;

      case "bounce":
        currentTranslateY.value = withTiming(-SCREEN_HEIGHT, config);
        currentOpacity.value = withTiming(0, config);

        nextTranslateY.value = SCREEN_HEIGHT;
        nextOpacity.value = withTiming(1, { duration: config.duration / 2 });
        nextTranslateY.value = withSpring(0, {
          damping: 12,
          stiffness: 150,
          mass: 1,
        });
        break;

      case "spiral":
        currentRotation.value = withTiming(360, config);
        currentScale.value = withTiming(0, config);
        currentOpacity.value = withTiming(0, config);

        nextRotation.value = -360;
        nextScale.value = 0;
        nextOpacity.value = withTiming(1, config);
        nextRotation.value = withTiming(0, config);
        nextScale.value = withTiming(1, config);
        break;

      case "wave":
        currentSkewX.value = withTiming(30, { duration: config.duration / 3 });
        currentTranslateX.value = withTiming(-SCREEN_WIDTH, config);
        currentOpacity.value = withTiming(0, config);

        nextSkewX.value = -30;
        nextTranslateX.value = SCREEN_WIDTH;
        nextOpacity.value = withTiming(1, config);
        nextSkewX.value = withTiming(0, config);
        nextTranslateX.value = withTiming(0, config);
        break;

      case "glitch":
        currentTranslateX.value = withRepeat(
          withTiming(Math.random() * 20 - 10, { duration: 50 }),
          4,
          true,
        );
        currentOpacity.value = withTiming(0, config);
        brightness.value = withTiming(1.5, { duration: config.duration / 4 });
        contrast.value = withTiming(2, { duration: config.duration / 4 });

        nextOpacity.value = withDelay(
          config.duration / 2,
          withTiming(1, { duration: config.duration / 2 }),
        );
        brightness.value = withDelay(
          config.duration / 2,
          withTiming(1, { duration: config.duration / 2 }),
        );
        contrast.value = withDelay(
          config.duration / 2,
          withTiming(1, { duration: config.duration / 2 }),
        );
        break;

      default:
        currentOpacity.value = withTiming(0, config);
        nextOpacity.value = withTiming(1, config);
    }

    // Global blur effect
    if (enableBlur) {
      blurRadius.value = withTiming(blurIntensity, {
        duration: config.duration / 2,
      });
      blurRadius.value = withDelay(
        config.duration / 2,
        withTiming(0, { duration: config.duration / 2 }),
      );
    }
  };

  const transitionToNext = useCallback(() => {
    if (isTransitioning || sources.length <= 1) return;

    setIsTransitioning(true);

    preloadImage(sources[nextIndex]).then(() => {
      executeTransition();

      setTimeout(() => {
        const newCurrentIndex = nextIndex;
        const newNextIndex = loop
          ? (nextIndex + 1) % sources.length
          : Math.min(nextIndex + 1, sources.length - 1);

        setCurrentIndex(newCurrentIndex);
        setNextIndex(newNextIndex);
        setIsTransitioning(false);

        currentOpacity.value = 1;
        nextOpacity.value = 0;

        onTransition?.(newCurrentIndex);
      }, transitionDuration);
    });
  }, [isTransitioning, nextIndex, loop, sources.length]);

  // Update next index when current changes
  useEffect(() => {
    const newNextIndex = loop
      ? (currentIndex + 1) % sources.length
      : Math.min(currentIndex + 1, sources.length - 1);

    if (newNextIndex !== nextIndex && newNextIndex < sources.length) {
      setNextIndex(newNextIndex);
    }
  }, [currentIndex, loop, sources.length]);

  // Auto-advance timer
  useEffect(() => {
    if (paused || sources.length <= 1) return;

    intervalRef.current = setInterval(() => {
      transitionToNext();
    }, duration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transitionToNext, duration, paused]);

  // Cleanup animations
  useEffect(() => {
    return () => {
      const allValues = [
        currentOpacity,
        nextOpacity,
        currentTranslateX,
        currentTranslateY,
        currentScale,
        currentRotation,
        currentSkewX,
        nextTranslateX,
        nextTranslateY,
        nextScale,
        nextRotation,
        nextSkewX,
        blurRadius,
        brightness,
        contrast,
      ];
      allValues.forEach(cancelAnimation);
    };
  }, []);

  // Animated styles
  const currentAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: currentOpacity.value,
      transform: [
        { translateX: currentTranslateX.value },
        { translateY: currentTranslateY.value },
        { scale: currentScale.value },
        { rotateY: `${currentRotation.value}deg` },
        { skewX: `${currentSkewX.value}deg` },
      ],
    }),
    [],
  );

  const nextAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: nextOpacity.value,
      transform: [
        { translateX: nextTranslateX.value },
        { translateY: nextTranslateY.value },
        { scale: nextScale.value },
        { rotateY: `${nextRotation.value}deg` },
        { skewX: `${nextSkewX.value}deg` },
      ],
    }),
    [],
  );

  const blurAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(blurRadius.value, [0, blurIntensity], [0, 0.8]),
    }),
    [],
  );

  if (sources.length === 0) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  const currentSource = sources[currentIndex];
  const nextSource = sources[nextIndex];

  return (
    <View style={[styles.container, style]}>
      {/* Current Image */}
      <AnimatedImage
        source={
          typeof currentSource === "string"
            ? { uri: currentSource }
            : currentSource
        }
        style={[styles.image, currentAnimatedStyle]}
        resizeMode={resizeMode}
        fadeDuration={0}
      />

      {/* Next Image (preloaded) */}
      {nextSource && nextIndex < sources.length && (
        <AnimatedImage
          source={
            typeof nextSource === "string" ? { uri: nextSource } : nextSource
          }
          style={[styles.image, nextAnimatedStyle]}
          resizeMode={resizeMode}
          fadeDuration={0}
        />
      )}

      {/* Blur overlay */}
      {enableBlur && (
        <AnimatedBlurView
          style={[styles.overlay, blurAnimatedStyle]}
          intensity={blurRadius.value}
          tint="default"
        />
      )}

      {/* Content */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    position: "relative",
    zIndex: 10,
  },
});

export default AnimatedBackground;
