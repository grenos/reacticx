// EnhancedCalendarExample.tsx
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  StatusBar,
  Platform,
  Alert,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SFSymbol, SymbolView } from "expo-symbols";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp,
  FadeIn,
  withSequence,
  withRepeat,
  interpolateColor,
} from "react-native-reanimated";
import {
  CalendarView,
  CalendarViewRef,
  DateRange,
} from "@/components/molecules/Calendar/index";

const theme = {
  background: "#0a0a0a",
  card: "#0f0f0f",
  cardHover: "#171717",
  foreground: "#fafafa",
  muted: "#171717",
  mutedForeground: "#737373",
  border: "#262626",
  primary: "#fafafa",
  primaryForeground: "#0a0a0a",
  secondary: "#1a1a1a",
  accent: "#fafafa",
  accentForeground: "#0a0a0a",
  success: "#22c55e",
  warning: "#f59e0b",
  destructive: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  orange: "#f97316",
  alarm: "#ff6b6b",
  alarmLight: "#ff8e8e",
  gradients: {
    primary: ["#0a0a0a", "#171717"],
    accent: ["#fafafa", "#a3a3a3"],
    success: ["#22c55e", "#16a34a"],
    purple: ["#8b5cf6", "#7c3aed"],
    orange: ["#f97316", "#ea580c"],
    blue: ["#3b82f6", "#1d4ed8"],
    alarm: ["black", "black"],
    alarmDark: ["#2c2c2c", "#1a1a1a"],
  },
};

interface CalendarDemo {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  config: any;
}

interface AlertItem {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: "reminder" | "event" | "deadline" | "meeting";
  isActive: boolean;
}

const calendarDemos: CalendarDemo[] = [
  {
    id: "date",
    title: "Date Picker",
    description: "Single date selection with alarm alerts",
    icon: "calendar.circle.fill",
    color: theme.accent,
    config: {
      initialMode: "date",
      enableRangeMode: false,
      showModeSelector: false,
      showRangeToggle: false,
    },
  },
  {
    id: "range",
    title: "Date Range",
    description: "Period selection with smart notifications",
    icon: "calendar.badge.plus",
    color: theme.success,
    config: {
      initialMode: "date",
      enableRangeMode: true,
      showModeSelector: false,
      showRangeToggle: false,
    },
  },
  {
    id: "time",
    title: "Date & Time",
    description: "Precision scheduling with alarm system",
    icon: "alarm.fill",
    color: theme.alarm,
    config: {
      initialMode: "time",
      enableRangeMode: false,
      showModeSelector: false,
      showRangeToggle: false,
    },
  },
  {
    id: "full",
    title: "Smart Scheduler",
    description: "Complete alarm & notification system",
    icon: "bell.badge.fill",
    color: theme.orange,
    config: {
      initialMode: "date",
      enableRangeMode: false,
      showModeSelector: true,
      showRangeToggle: true,
    },
  },
];

const DemoCard = React.memo<{
  demo: CalendarDemo;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}>(({ demo, index, isSelected, onSelect }) => {
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1);
      glowAnim.value = withTiming(0);
    }
  }, [isSelected]);

  const handlePress = useCallback(() => {
    onSelect(demo.id);
    Vibration.vibrate(50);
  }, [demo.id, onSelect]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    shadowOpacity: 0.1 + glowAnim.value * 0.3,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value * 0.3,
    backgroundColor: interpolateColor(
      glowAnim.value,
      [0, 1],
      ["transparent", demo.color + "20"],
    ),
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.demoCard,
        animatedStyle,
        {
          borderColor: isSelected ? demo.color : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      {isSelected && <Animated.View style={[styles.cardGlow, glowStyle]} />}
      <Pressable style={styles.cardContent} onPress={handlePress}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: demo.color + "20" },
            ]}
          >
            <SymbolView
              name={demo.icon as SFSymbol}
              size={24}
              type="hierarchical"
              tintColor={demo.color}
            />
          </View>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>
            {demo.title}
          </Text>
        </View>
        <Text
          style={[styles.cardDescription, { color: theme.mutedForeground }]}
        >
          {demo.description}
        </Text>

        {isSelected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.selectedIndicator}
          >
            <SymbolView
              name="checkmark.circle.fill"
              size={20}
              type="hierarchical"
              tintColor={demo.color}
            />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
});

const AlertCard = React.memo<{
  alert: AlertItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}>(({ alert, onToggle, onDelete }) => {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (alert.isActive) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.01, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [alert.isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const getAlertIcon = () => {
    switch (alert.type) {
      case "reminder":
        return "bell.fill";
      case "event":
        return "calendar.circle.fill";
      case "deadline":
        return "exclamationmark.triangle.fill";
      case "meeting":
        return "person.2.fill";
      default:
        return "bell.fill";
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case "reminder":
        return theme.info;
      case "event":
        return theme.success;
      case "deadline":
        return theme.alarm;
      case "meeting":
        return theme.purple;
      default:
        return theme.info;
    }
  };

  return (
    <Animated.View style={[styles.alertCard, animatedStyle]}>
      <LinearGradient
        colors={
          alert.isActive
            ? theme.gradients.alarm
            : (theme.gradients.alarmDark as any)
        }
        style={styles.alertGradient}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertLeft}>
            <View
              style={[
                styles.alertIcon,
                { backgroundColor: getAlertColor() + "20" },
              ]}
            >
              <SymbolView
                name={getAlertIcon() as SFSymbol}
                size={18}
                type="hierarchical"
                tintColor={getAlertColor()}
              />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: theme.foreground }]}>
                {alert.title}
              </Text>
              <Text
                style={[styles.alertDate, { color: theme.mutedForeground }]}
              >
                {alert.date} {alert.time && `at ${alert.time}`}
              </Text>
            </View>
          </View>
          <View style={styles.alertActions}>
            <Pressable
              style={[
                styles.alertToggle,
                {
                  backgroundColor: alert.isActive
                    ? theme.success + "20"
                    : theme.muted,
                },
              ]}
              onPress={() => onToggle(alert.id)}
            >
              <SymbolView
                name={alert.isActive ? "bell.fill" : "bell.slash.fill"}
                size={14}
                type="hierarchical"
                tintColor={
                  alert.isActive ? theme.success : theme.mutedForeground
                }
              />
            </Pressable>
            <Pressable
              style={[
                styles.alertDelete,
                { backgroundColor: theme.destructive + "20" },
              ]}
              onPress={() => onDelete(alert.id)}
            >
              <SymbolView
                name="trash.fill"
                size={14}
                type="hierarchical"
                tintColor={theme.destructive}
              />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

const ActionButton = React.memo<{
  title: string;
  icon: string;
  onPress: () => void;
  variant?: "default" | "destructive" | "success" | "alarm";
}>(({ title, icon, onPress, variant = "default" }) => {
  const colors = useMemo(
    () => ({
      default: {
        bg: theme.secondary,
        text: theme.foreground,
        icon: theme.foreground,
      },
      destructive: {
        bg: theme.destructive + "15",
        text: theme.destructive,
        icon: theme.destructive,
      },
      success: {
        bg: theme.success + "15",
        text: theme.success,
        icon: theme.success,
      },
      alarm: {
        bg: theme.alarm + "15",
        text: theme.alarm,
        icon: theme.alarm,
      },
    }),
    [],
  );

  const buttonStyle = useMemo(
    () => [
      styles.actionButton,
      {
        backgroundColor: colors[variant].bg,
        borderColor: colors[variant].text + "20",
      },
    ],
    [colors, variant],
  );

  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      <SymbolView
        name={icon as SFSymbol}
        size={14}
        type="hierarchical"
        tintColor={colors[variant].icon}
      />
      <Text style={[styles.actionButtonText, { color: colors[variant].text }]}>
        {title}
      </Text>
    </Pressable>
  );
});

const EnhancedCalendarExample: React.FC = () => {
  const calendarRefs = useRef<{ [key: string]: CalendarViewRef | null }>({});
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string;
  }>({});
  const [selectedDemo, setSelectedDemo] = useState<string>("date");
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "1",
      date: "Today",
      time: "10:30 AM",
      title: "Team Meeting",
      type: "meeting",
      isActive: true,
    },
    {
      id: "2",
      date: "Tomorrow",
      title: "Project Deadline",
      type: "deadline",
      isActive: true,
    },
  ]);

  const headerScale = useSharedValue(1);
  const alarmPulse = useSharedValue(1);

  useEffect(() => {
    alarmPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const handleDemoSelect = useCallback((demoId: string) => {
    setSelectedDemo(demoId);
    Vibration.vibrate(50);
  }, []);

  const handleDateSelect = useCallback(
    (demoId: string) => (date: string) => {
      setSelectedValues((prev) => ({ ...prev, [demoId]: date }));

      Alert.alert("📅 Date Selected", `Selected date: ${date}`, [
        {
          text: "Set Reminder",
          onPress: () => addAlert(date, "reminder"),
        },
        {
          text: "OK",
          style: "default",
        },
      ]);

      headerScale.value = withSpring(1.01, { damping: 20 }, () => {
        headerScale.value = withSpring(1);
      });
      Vibration.vibrate(100);
    },
    [],
  );

  const handleRangeSelect = useCallback(
    (demoId: string) => (range: DateRange) => {
      const rangeText = range.start
        ? `${range.start}${range.end ? ` to ${range.end}` : " (select end)"}`
        : "No range selected";
      setSelectedValues((prev) => ({ ...prev, [demoId]: rangeText }));

      if (range.start && range.end) {
        Alert.alert(
          "📊 Range Selected",
          `Period: ${range.start} to ${range.end}`,
          [
            {
              text: "Set Period Alert",
              onPress: () => addAlert(rangeText, "event"),
            },
            {
              text: "OK",
              style: "default",
            },
          ],
        );
        Vibration.vibrate([100, 50, 100]);
      }
    },
    [],
  );

  const handleTimeSelect = useCallback(
    (demoId: string) =>
      (time: { hour: number; minute: number; period: string }) => {
        const timeText = `${time.hour}:${time.minute.toString().padStart(2, "0")} ${time.period}`;
        const fullDateTime = `${selectedValues[demoId]?.split(" at ")[0] || "Today"} at ${timeText}`;
        setSelectedValues((prev) => ({
          ...prev,
          [demoId]: fullDateTime,
        }));

        Alert.alert("⏰ Time Set", `Scheduled for: ${fullDateTime}`, [
          {
            text: "Set Alarm",
            onPress: () => addAlert("Today", "reminder", timeText),
          },
          {
            text: "OK",
            style: "default",
          },
        ]);
        Vibration.vibrate([50, 100, 50]);
      },
    [selectedValues],
  );

  const addAlert = useCallback(
    (date: string, type: AlertItem["type"], time?: string) => {
      const newAlert: AlertItem = {
        id: Date.now().toString(),
        date,
        time,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${date}`,
        type,
        isActive: true,
      };
      setAlerts((prev) => [...prev, newAlert]);
      Vibration.vibrate(200);
    },
    [],
  );

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert,
      ),
    );
    Vibration.vibrate(50);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    Alert.alert("Delete Alert", "Are you sure you want to delete this alert?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAlerts((prev) => prev.filter((alert) => alert.id !== id));
          Vibration.vibrate(100);
        },
      },
    ]);
  }, []);

  const openCalendar = useCallback(() => {
    calendarRefs.current[selectedDemo]?.open();
    Vibration.vibrate(50);
  }, [selectedDemo]);

  const goToToday = useCallback(() => {
    calendarRefs.current[selectedDemo]?.goToToday();
    Vibration.vibrate(50);
  }, [selectedDemo]);

  const resetCalendar = useCallback(() => {
    calendarRefs.current[selectedDemo]?.reset();
    setSelectedValues((prev) => ({ ...prev, [selectedDemo]: "" }));
    Vibration.vibrate(100);
  }, [selectedDemo]);

  const selectedDemoConfig = useMemo(
    () => calendarDemos.find((d) => d.id === selectedDemo),
    [selectedDemo],
  );

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const animatedAlarmStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alarmPulse.value }],
  }));

  const renderCustomTrigger = useCallback(
    ({
      selectedValue,
      onPress,
      isRangeMode,
    }: {
      selectedValue: string;
      onPress: () => void;
      isRangeMode: boolean;
    }) => (
      <Pressable
        style={[
          styles.customTrigger,
          {
            backgroundColor: theme.card,
            borderColor: selectedDemoConfig?.color || theme.border,
          },
        ]}
        onPress={onPress}
      >
        <LinearGradient
          colors={theme.gradients.alarmDark as any}
          style={styles.triggerGradient}
        >
          <View style={styles.triggerContent}>
            <View style={styles.triggerLeft}>
              <View
                style={[
                  styles.triggerIcon,
                  {
                    backgroundColor:
                      selectedDemoConfig?.color + "20" || theme.muted,
                  },
                ]}
              >
                <SymbolView
                  name={(selectedDemoConfig?.icon as SFSymbol) || "calendar"}
                  size={18}
                  type="hierarchical"
                  tintColor={selectedDemoConfig?.color || theme.accent}
                />
              </View>
              <View style={styles.triggerTextContainer}>
                <Text
                  style={[
                    styles.triggerLabel,
                    { color: theme.mutedForeground },
                  ]}
                >
                  {isRangeMode
                    ? "DATE RANGE"
                    : selectedDemoConfig?.title.toUpperCase()}
                </Text>
                <Text
                  style={[styles.triggerValue, { color: theme.foreground }]}
                >
                  {selectedValue || "Select date..."}
                </Text>
              </View>
            </View>
            <SymbolView
              name="chevron.right"
              size={14}
              type="hierarchical"
              tintColor={theme.mutedForeground}
            />
          </View>
        </LinearGradient>
      </Pressable>
    ),
    [selectedDemoConfig],
  );

  const features = useMemo(
    () => [
      {
        icon: "bell.badge.fill",
        title: "Smart Alerts",
        desc: "Intelligent notification system",
      },
      {
        icon: "alarm.fill",
        title: "Precision Timing",
        desc: "Exact time scheduling",
      },
      {
        icon: "calendar.badge.plus",
        title: "Range Selection",
        desc: "Intuitive date range picking",
      },
      {
        icon: "paintbrush.fill",
        title: "Alarm Theme",
        desc: "Beautiful dark alarm aesthetic",
      },
      {
        icon: "wand.and.rays",
        title: "Smooth Animations",
        desc: "Reanimated 3 transitions",
      },
      {
        icon: "hand.tap.fill",
        title: "Haptic Feedback",
        desc: "Rich tactile responses",
      },
    ],
    [],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
      scrollEnabled={true}
      contentInsetAdjustmentBehavior="always"
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.background}
        />

        <Animated.View entering={FadeInUp} style={styles.header}>
          <LinearGradient
            colors={theme?.gradients?.alarm as any}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.headerContent, animatedHeaderStyle]}>
              <View style={styles.headerTitleContainer}>
                <Animated.View
                  style={[styles.headerIconContainer, animatedAlarmStyle]}
                >
                  <SymbolView
                    name="alarm.fill"
                    size={28}
                    type="hierarchical"
                    tintColor={"white"}
                  />
                </Animated.View>
                <View>
                  <Text style={[styles.headerTitle, { color: "white" }]}>
                    Smart Calendar
                  </Text>
                  <Text
                    style={[
                      styles.headerSubtitle,
                      { color: theme.mutedForeground },
                    ]}
                  >
                    Intelligent scheduling with alerts
                  </Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name="bell.badge.fill"
                size={20}
                type="hierarchical"
                tintColor={theme.alarm}
              />
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Active Alerts ({alerts.filter((a) => a.isActive).length})
              </Text>
            </View>

            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onToggle={toggleAlert}
                  onDelete={deleteAlert}
                />
              ))}
              {alerts.length === 0 && (
                <View style={styles.emptyState}>
                  <SymbolView
                    name="bell.slash"
                    size={32}
                    type="hierarchical"
                    tintColor={theme.mutedForeground}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.mutedForeground }]}
                  >
                    No alerts set
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name="square.grid.2x2.fill"
                size={20}
                type="hierarchical"
                tintColor={theme.accent}
              />
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Choose Demo
              </Text>
            </View>

            <View style={styles.demoGrid}>
              {calendarDemos.map((demo, index) => (
                <DemoCard
                  key={demo.id}
                  demo={demo}
                  index={index}
                  isSelected={selectedDemo === demo.id}
                  onSelect={handleDemoSelect}
                />
              ))}
            </View>
          </Animated.View>

          {selectedDemoConfig && (
            <Animated.View
              entering={FadeInUp.delay(300)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <SymbolView
                  name="slider.horizontal.3"
                  size={20}
                  type="hierarchical"
                  tintColor={selectedDemoConfig.color}
                />
                <Text
                  style={[styles.sectionTitle, { color: theme.foreground }]}
                >
                  {selectedDemoConfig.title} Demo
                </Text>
              </View>

              <View
                style={[
                  styles.calendarContainer,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <CalendarView
                  ref={(ref) => (calendarRefs.current[selectedDemo] = ref)}
                  {...selectedDemoConfig.config}
                  onDateSelect={handleDateSelect(selectedDemo)}
                  onRangeSelect={handleRangeSelect(selectedDemo)}
                  onTimeSelect={handleTimeSelect(selectedDemo)}
                  theme={{
                    accent: selectedDemoConfig.color,
                    primary: selectedDemoConfig.color,
                    info: selectedDemoConfig.color,
                  }}
                  maxDate=""
                  renderTrigger={renderCustomTrigger}
                />

                {/* Enhanced Action Buttons */}
                <View style={styles.actionGrid}>
                  <ActionButton
                    title="Open"
                    icon="calendar"
                    onPress={openCalendar}
                  />
                  <ActionButton
                    title="Today"
                    icon="location.fill"
                    onPress={goToToday}
                    variant="success"
                  />
                  <ActionButton
                    title="Alert"
                    icon="bell.badge.fill"
                    onPress={() => addAlert("Today", "reminder")}
                    variant="alarm"
                  />
                  <ActionButton
                    title="Reset"
                    icon="arrow.counterclockwise"
                    onPress={resetCalendar}
                    variant="destructive"
                  />
                </View>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name="star.fill"
                size={20}
                type="hierarchical"
                tintColor={theme.warning}
              />
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Features
              </Text>
            </View>

            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <Animated.View
                  key={feature.title}
                  entering={FadeInUp.delay(600 + index * 50)}
                  style={[
                    styles.featureItem,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: theme.accent + "15" },
                    ]}
                  >
                    <SymbolView
                      name={feature.icon as SFSymbol}
                      size={18}
                      type="hierarchical"
                      tintColor={theme.accent}
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text
                      style={[styles.featureTitle, { color: theme.foreground }]}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={[
                        styles.featureDesc,
                        { color: theme.mutedForeground },
                      ]}
                    >
                      {feature.desc}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <SymbolView
                name="doc.text.fill"
                size={20}
                type="hierarchical"
                tintColor={theme.info}
              />
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Usage Example
              </Text>
            </View>

            <View
              style={[
                styles.codeContainer,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.codeText, { color: theme.mutedForeground }]}>
                {`import { EnhancedCalendarView } from '@/components';

<EnhancedCalendarView
  initialMode="date"
  enableAlerts={true}
  onDateSelect={(date) => showAlert(date)}
  onAlertCreate={(alert) => console.log(alert)}
  theme={{
    accent: "#ff6b6b",
    alarmColor: "#ff4757"
  }}
/>`}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    gap: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 32,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  alertsList: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  alertGradient: {
    padding: 16,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  alertDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  alertActions: {
    flexDirection: "row",
    gap: 8,
  },
  alertToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  alertDelete: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },

  demoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  demoCard: {
    width: "47%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
  },
  cardGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    zIndex: -1,
  },

  cardContent: {
    backgroundColor: "#0a0a0a",
    padding: 20,
    borderRadius: 16,
    minHeight: 130,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  selectedIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
  },

  calendarContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  customTrigger: {
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  triggerGradient: {
    padding: 18,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  triggerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  triggerTextContainer: {
    flex: 1,
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  triggerValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  codeContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    backgroundColor: "#050505",
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    lineHeight: 20,
    color: "#a3a3a3",
  },
});

export default EnhancedCalendarExample;
