// import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
// import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// export const AnimatedCarouselItem = ({
//   item,
//   index,
//   itemHeight,
//   itemWidth,
//   spacing,
//   type,
//   snapToInterval,
//   scrollX
// }: {
//   item: T;
//   scrollX: Animated.SharedValue<number>;
//   index: number;
//   type?: "scale" | "fade" | "slide" | "rotation" | "perspective";
//   spacing?: number;
//   itemWidth?: number;
//   itemHeight?: number;
//     snapToInterval?: boolean;
// }) => {
//   const ITEM_WIDTH = itemWidth as number
//   const SPACING = spacing as number
//   const SNAP_INTERVAL = snapToInterval ? ITEM_WIDTH! + SPACING! : undefined;
//   const animatedStyle = useAnimatedStyle(() => {
//     const inputRange = [
//       (index - 1) * (ITEM_WIDTH + SPACING),
//       index * (ITEM_WIDTH + SPACING),
//       (index + 1) * (ITEM_WIDTH + SPACING),
//     ];

//     let transform = [];
//     let opacity = 1;

//     switch (type) {
//       case "scale":
//         const scale = interpolate(
//           scrollX.value,
//           inputRange,
//           [0.8, 1, 0.8],
//           Extrapolation.CLAMP,
//         );
//         transform.push({ scale });
//         break;

//       case "fade":
//         opacity = interpolate(
//           scrollX.value,
//           inputRange,
//           [0.5, 1, 0.5],
//           Extrapolation.CLAMP,
//         );
//         break;

//       case "slide":
//         const translateX = interpolate(
//           scrollX.value,
//           inputRange,
//           [-50, 0, 50],
//           Extrapolation.CLAMP,
//         );
//         transform.push({ translateX });
//         break;

//       case "rotation":
//         const rotate = interpolate(
//           scrollX.value,
//           inputRange,
//           [-15, 0, 15],
//           Extrapolation.CLAMP,
//         );
//         transform.push({ rotate: `${rotate}deg` });
//         break;

//       case "perspective":
//         const rotateY = interpolate(
//           scrollX.value,
//           inputRange,
//           [45, 0, -45],
//           Extrapolation.CLAMP,
//         );
//         const perspective = interpolate(
//           scrollX.value,
//           inputRange,
//           [800, 1200, 800],
//           Extrapolation.CLAMP,
//         );
//         transform.push({ perspective }, { rotateY: `${rotateY}deg` });
//         break;
//     }

//     return {
//       opacity,
//       transform,
//     };
//   });

//   return (
//     <Animated.View style={[styles.defaultItemContainer, animatedStyle]}>
//       <TouchableOpacity
//         style={[
//           styles.imageContainer,
//           { width: ITEM_WIDTH, height: itemHeight },
//           enableShadow && (shadowStyle || styles.defaultShadow),
//           cardStyle,
//         ]}
//         onPress={() => onItemPress?.(item, index)}
//         activeOpacity={0.9}
//       >
//         <Image
//           source={{ uri: item.uri }}
//           style={[styles.image, imageStyle]}
//           resizeMode="cover"
//         />

//         {overlayComponent?.(item, index)}

//         {(item.title || item.subtitle || item.description) && (
//           <View style={styles.textOverlay}>
//             {item.title && (
//               <Text style={[styles.title, titleStyle]}>{item.title}</Text>
//             )}
//             {item.subtitle && (
//               <Text style={[styles.subtitle, subtitleStyle]}>
//                 {item.subtitle}
//               </Text>
//             )}
//             {item.description && (
//               <Text
//                 style={[styles.description, descriptionStyle]}
//                 numberOfLines={2}
//               >
//                 {item.description}
//               </Text>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };
