import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";
import { PanGestureHandler, State } from "react-native-gesture-handler";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_HEIGHT = 380;
const HANDLE_HEIGHT = 4;

interface ThemeOption {
  id: string;
  title: string;
  isSelected?: boolean;
  style: "light" | "dark" | "sepia";
}

export const AppleBooksFloatingActions: React.FC = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("original");
  const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const themeOptions: ThemeOption[] = [
    { id: "original", title: "Original", style: "light" },
    { id: "quiet", title: "Quiet", style: "dark" },
    { id: "paper", title: "Paper", style: "sepia" },
    { id: "bold", title: "Bold", style: "dark" },
    { id: "calm", title: "Calm", style: "dark" },
    { id: "focus", title: "Focus", style: "dark" },
  ];

  const showPanel = () => {
    setIsPanelVisible(true);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hidePanel = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: PANEL_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPanelVisible(false);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;

      if (translationY > 100 || velocityY > 1000) {
        hidePanel();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const getThemeStyle = (style: string) => {
    switch (style) {
      case "light":
        return { backgroundColor: "#FFFFFF", color: "#000000" };
      case "dark":
        return { backgroundColor: "#1C1C1E", color: "#FFFFFF" };
      case "sepia":
        return { backgroundColor: "#F7F3E9", color: "#5D4E37" };
      default:
        return { backgroundColor: "#FFFFFF", color: "#000000" };
    }
  };

  const renderBookContent = () => (
    <View style={styles.bookContent}>
      <View style={styles.bookHeader}>
        <Text style={styles.chapterTitle}>Chapter 8</Text>
        <Text style={styles.pageInfo}>89 of 125</Text>
      </View>

      <Text style={styles.bookText}>
        Falling through time. That's what it feels like, lying here. Compass.
        Paper. Pencils. All the shades of grey. Floating up, out of reach. Out
        of sight. I snatch at photos of the park scattering, different points of
        view, merging, dispersing. A picture of the past flashes by. The residue
        of a memory. Stay calm, I remember thinking...
      </Text>

      <Text style={styles.bookTextItalic}>
        I look up from my watch at the giant mirror and notice my skewed
        bow-tie. I stop to fix it, and glance behind me at the jostle of tiaras
        and raised silk lapels as they move past the gilded walls of the
        palatial foyer. A bejewelled wrist inches to its partner's clasp. Faint
        guffaws mingle in the wandering crowd. My senses grate. It's all empty.
        A charade. He is not among them.
      </Text>

      <Text style={styles.bookText}>
        But you should be bouncing, Nominee! Outstanding contribution to urban
        design? Didn't see that coming!
      </Text>

      <Text style={styles.bookTextItalic}>
        Dread broods inside me. For three long years the South Bank apartment
        complex stood empty, changed hands twice, got sold on to a property
        mogul eager to shake up the layout of the land. I saw no hope for it. I
        consigned the design to my vast dumping ground of bad ideas, I moved on.
        It seemed the right thing to do.
      </Text>

      <TouchableOpacity style={styles.floatingButton} onPress={showPanel}>
        <Text style={styles.buttonIcon}>☰</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFloatingPanel = () => {
    if (!isPanelVisible) return null;

    return (
      <>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={hidePanel}
            activeOpacity={1}
          />
        </Animated.View>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.floatingPanel,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <BlurView style={styles.blurView} tint="dark" intensity={20}>
              <View style={styles.panelContent}>
                {/* Handle */}
                <View style={styles.handle} />

                {/* Slide Toggle */}
                <View style={styles.slideSection}>
                  <Text style={styles.sectionTitle}>Slide</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity style={styles.toggleOption}>
                      <Text style={styles.toggleIcon}>✓</Text>
                      <Text style={styles.toggleText}>Curl</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleOption, styles.toggleInactive]}
                    >
                      <Text style={styles.toggleText}>None</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Theme Section */}
                <View style={styles.themeSection}>
                  <Text style={styles.sectionTitle}>Theme</Text>
                  <Text style={styles.sectionSubtitle}>Original</Text>

                  <View style={styles.themeGrid}>
                    {themeOptions.map((theme) => (
                      <TouchableOpacity
                        key={theme.id}
                        style={[
                          styles.themeOption,
                          getThemeStyle(theme.style),
                          selectedTheme === theme.id && styles.selectedTheme,
                        ]}
                        onPress={() => setSelectedTheme(theme.id)}
                      >
                        <Text
                          style={[
                            styles.themeText,
                            { color: getThemeStyle(theme.style).color },
                          ]}
                        >
                          Aa
                        </Text>
                        <Text
                          style={[
                            styles.themeName,
                            { color: getThemeStyle(theme.style).color },
                          ]}
                        >
                          {theme.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Additional Controls */}
                <View style={styles.controlsRow}>
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlIcon}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlIcon}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlIcon}>☰</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlIcon}>◐</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlIcon}>●</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </PanGestureHandler>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderBookContent()}
      {renderFloatingPanel()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  bookContent: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 20,
    paddingTop: 60,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  chapterTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  pageInfo: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.7,
  },
  bookText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: "Georgia",
  },
  bookTextItalic: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: "italic",
    fontFamily: "Georgia",
  },
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  floatingPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
  },
  blurView: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  panelContent: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: HANDLE_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  slideSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  sectionSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 255, 0, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 0, 0.5)",
  },
  toggleInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  toggleIcon: {
    color: "#00FF00",
    fontSize: 14,
    marginRight: 5,
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  themeSection: {
    marginBottom: 30,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  themeOption: {
    width: (SCREEN_WIDTH - 80) / 3,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTheme: {
    borderColor: "#007AFF",
  },
  themeText: {
    fontSize: 24,
    fontWeight: "300",
    marginBottom: 5,
  },
  themeName: {
    fontSize: 12,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default AppleBooksFloatingActions;
