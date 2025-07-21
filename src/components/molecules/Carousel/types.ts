import type {
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";

export interface CarouselProps<T = any> {
  data: T[];
  renderItem: (
    item: T,
    index: number,
    scrollX: SharedValue<number>,
  ) => React.ReactNode;
  itemWidth?: number;
  itemHeight?: number;
  spacing?: number;
  enableBlurBackground?: boolean;
  blurIntensity?: number;

  blurTint?: "light" | "dark" | "default";
  blurRadius?: number;
  pagingEnabled?: boolean;
  snapToInterval?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  showPagination?: boolean;
  paginationStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  activeDotStyle?: ViewStyle;
  showArrows?: boolean;
  arrowStyle?: ViewStyle;
  onIndexChange?: (index: number) => void;
  onItemPress?: (item: T, index: number) => void;
  cardStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  animationType?: "scale" | "fade" | "slide" | "rotation" | "perspective";
  parallaxFactor?: number;
  enableShadow?: boolean;
  shadowStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  decelerationRate?: "normal" | "fast" | number;
  scrollEventThrottle?: number;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean;
  bouncesZoom?: boolean;
  enableMomentum?: boolean;
  overlayComponent?: (item: T, index: number) => React.ReactNode;
  headerComponent?: () => React.ReactNode;
  footerComponent?: () => React.ReactNode;
  backgroundImageArray?: ImageSourcePropType[];
  renderBackgroundItem?: (
    item: T,
    index: number,
    scrollX: SharedValue<number>,
  ) => React.ReactNode;
}

export interface CarouselRef {
  scrollToIndex: (index: number, animated?: boolean) => void;
  getCurrentIndex: () => number;
  next: () => void;
  prev: () => void;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
}
