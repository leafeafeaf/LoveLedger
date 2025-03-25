import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
  ScrollView,
  Image,
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MainTabParamList,
  RootStackParamList,
  StoryStackParamList,
  ProfileStackParamList,
} from "../../navigation/navigation";
import type { Transaction } from "../../types/index";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import PartnerSwitch from "../../components/profile/PartnerSwitch";
import { dailyFinanceData, transactionHistoryData } from "../../../dummyData";

type MainScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Main">,
  NavigationProp<RootStackParamList>
>;

type NavigateType = {
  navigate(screen: keyof RootStackParamList): void;
  navigate<RouteName extends keyof RootStackParamList>(
    screen: RouteName,
    params: RootStackParamList[RouteName]
  ): void;
};

interface MainScreenProps {
  navigation: MainScreenNavigationProp;
}

// Helper function to format currency in Korean Won
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get finance data for a specific date
const getFinanceForDate = (date: Date, activeView: string) => {
  const dateString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  let financeData = { earn: 0, consume: 0 };

  dailyFinanceData.data.days
    .filter((day) => {
      if (activeView === "you") return day.userId === "user1";
      if (activeView === "partner") return day.userId === "user2";
      return true; // combined view
    })
    .forEach((day) => {
      if (day.day === dateString) {
        financeData.earn += day.earn;
        financeData.consume += day.consume;
      }
    });

  return financeData.earn > 0 || financeData.consume > 0 ? financeData : null;
};

// Helper function to get transactions for a specific date
const getTransactionsForDate = (date: Date): Transaction[] => {
  const dateString = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return transactionHistoryData.data.history.filter(
    (transaction) => transaction.time?.startsWith(dateString) ?? false
  );
};

// Helper function to safely get value from Animated.Value
const getValueFromAnimated = (animatedValue: Animated.Value): number => {
  let currentValue = 0;
  animatedValue.addListener(({ value }) => {
    currentValue = value;
  });
  const valueToReturn = currentValue;
  animatedValue.removeAllListeners();
  return valueToReturn;
};

interface FABComponentProps {
  navigation: MainScreenNavigationProp & NavigateType;
  showFabMenu: boolean;
  toggleFabMenu: () => void;
  fabAnimation: Animated.Value;
  menuAnimation: Animated.Value;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
}

const FABComponent = React.memo(
  ({
    navigation,
    showFabMenu,
    toggleFabMenu,
    fabAnimation,
    menuAnimation,
    position,
    setPosition,
  }: FABComponentProps) => {
    const [panPosition, setPanPosition] = useState(position);
    const pan = useRef(new Animated.ValueXY(position)).current;
    const { width, height } = useWindowDimensions();

    const defaultPosition = {
      x: width - 80,
      y: height - 192,
    };

    useEffect(() => {
      // position이 외부에서 변경되면 pan 값도 업데이트
      pan.setValue(position);
    }, [position]);

    return (
      <PanGestureHandler
        onGestureEvent={(event) => {
          // 드래그 중 위치 업데이트
          pan.x.setValue(event.nativeEvent.translationX);
          pan.y.setValue(event.nativeEvent.translationY);
        }}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.BEGAN) {
            // 제스처 시작 시
            const xValue = getValueFromAnimated(pan.x);
            const yValue = getValueFromAnimated(pan.y);

            pan.setOffset({
              x: xValue,
              y: yValue,
            });
            pan.x.setValue(0);
            pan.y.setValue(0);
          } else if (event.nativeEvent.state === State.END) {
            // 제스처 종료 시
            pan.flattenOffset();

            // 현재 위치 가져오기
            const newX = getValueFromAnimated(pan.x);
            const newY = getValueFromAnimated(pan.y);

            // Calculate bounds
            const maxX = width - 80;
            const maxY = height - 200;
            const minX = 0;
            const minY = 0;

            // Check if FAB is dragged too far
            const isOffScreenX = newX < minX || newX > maxX;
            const isOffScreenY = newY < minY || newY > maxY;

            let finalX = newX;
            let finalY = newY;

            // If off screen, snap to nearest edge
            if (isOffScreenX) {
              finalX = newX < minX ? minX : maxX;
            }
            if (isOffScreenY) {
              finalY = newY < minY ? minY : maxY;
            }

            // Snap to edges if close
            const snapThreshold = 40;
            if (Math.abs(newX - maxX) < snapThreshold) finalX = maxX;
            if (Math.abs(newX - minX) < snapThreshold) finalX = minX;
            if (Math.abs(newY - maxY) < snapThreshold) finalY = maxY;
            if (Math.abs(newY - minY) < snapThreshold) finalY = minY;

            const finalPosition = { x: finalX, y: finalY };

            Animated.spring(pan, {
              toValue: finalPosition,
              useNativeDriver: false,
              friction: 7,
              tension: 40,
            }).start(() => {
              setPosition(finalPosition);
              setPanPosition(finalPosition);
            });
          }
        }}
      >
        <Animated.View
          style={[
            styles.fabContainer,
            {
              transform: pan.getTranslateTransform(),
              zIndex: 1000,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.fabMenu,
              {
                opacity: menuAnimation,
                transform: [
                  { scale: menuAnimation },
                  {
                    translateY: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              style={styles.fabMenuItem}
              onPress={() => {
                toggleFabMenu();
                navigation.navigate("Story", {
                  screen: "StorySettings",
                  params: {},
                });
              }}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.fabMenuText}>Create Story</Text>
            </Pressable>

            <Pressable
              style={styles.fabMenuItem}
              onPress={() => {
                toggleFabMenu();
                navigation.navigate("Diary", {
                  screen: "DiaryCreate",
                  params: {},
                });
              }}
            >
              <MaterialCommunityIcons
                name="notebook"
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.fabMenuText}>Write Diary</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              styles.fab,
              {
                transform: [
                  {
                    rotate: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "45deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={toggleFabMenu} style={styles.fabButton}>
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={theme.colors.white}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
);

interface CalendarDayItem {
  isEmpty?: boolean;
  index?: number;
  date?: Date;
  isToday?: boolean;
  financeData?: {
    earn: number;
    consume: number;
  } | null;
}

interface CalendarDayProps {
  day: CalendarDayItem;
  navigation: MainScreenNavigationProp & NavigateType;
  onSelectDate: (date: Date) => void;
  isSelected?: boolean;
}

const CalendarDay = React.memo(
  ({ day, navigation, onSelectDate, isSelected }: CalendarDayProps) => {
    if (day.isEmpty) {
      return <View key={`empty-${day.index}`} style={styles.emptyDay} />;
    }

    const financeData = day.financeData;

    return (
      <Pressable
        style={[
          styles.dayCard,
          financeData &&
            (financeData.earn > 0 || financeData.consume > 0) &&
            styles.dayCardWithEntry,
          day.isToday && styles.todayCard,
          isSelected && {
            backgroundColor: theme.colors.primary,
            transform: [{ scale: 1.1 }],
            borderWidth: 2,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => {
          if (day.date) {
            onSelectDate(day.date);
          }
        }}
      >
        <Text style={[styles.dayNumber, day.isToday && styles.todayText]}>
          {day.date?.getDate()}
        </Text>

        {financeData && (financeData.earn > 0 || financeData.consume > 0) && (
          <View style={styles.financeIndicator}>
            {financeData.earn > 0 && (
              <Text style={styles.earnText}>
                +{(financeData.earn / 10000).toFixed(1)}만
              </Text>
            )}
            {financeData.consume > 0 && (
              <Text style={styles.consumeText}>
                -{(financeData.consume / 10000).toFixed(1)}만
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  }
);

interface DailySummaryProps {
  selectedDate: Date;
  transactions: Array<{
    remittance: boolean;
    amount: number;
    [key: string]: any;
  }>;
}

const DailySummary = React.memo(
  ({ selectedDate, transactions }: DailySummaryProps) => {
    const total = transactions.reduce((acc: number, curr) => {
      return curr.remittance ? acc - curr.amount : acc + curr.amount;
    }, 0);

    return (
      <View style={styles.dailySummaryContainer}>
        <Text style={styles.dailySummaryDate}>
          {selectedDate.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </Text>
        <View style={styles.dailySummaryAmounts}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>수입</Text>
            <Text
              style={[styles.summaryAmount, { color: theme.colors.success }]}
            >
              {formatCurrency(
                transactions.reduce(
                  (acc: number, curr) =>
                    !curr.remittance ? acc + curr.amount : acc,
                  0
                )
              )}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>지출</Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
              {formatCurrency(
                transactions.reduce(
                  (acc: number, curr) =>
                    curr.remittance ? acc + curr.amount : acc,
                  0
                )
              )}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>합계</Text>
            <Text
              style={[
                styles.summaryAmount,
                {
                  color: total >= 0 ? theme.colors.success : theme.colors.error,
                },
              ]}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

export default function MainScreen({ navigation }: MainScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<
    Transaction[]
  >([]);
  const [activeView, setActiveView] = useState("you");
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const dimensions = useWindowDimensions();

  const translateX = useRef(new Animated.Value(0)).current;
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // 이전 달과 다음 달 계산
  const prevMonth = useMemo(() => {
    const date = new Date(displayedMonth);
    date.setMonth(date.getMonth() - 1);
    return date;
  }, [displayedMonth]);

  const nextMonth = useMemo(() => {
    const date = new Date(displayedMonth);
    date.setMonth(date.getMonth() + 1);
    return date;
  }, [displayedMonth]);

  useEffect(() => {
    const transactions = getTransactionsForDate(selectedDate);
    setSelectedDayTransactions(transactions);
  }, [selectedDate]);

  const toggleFabMenu = () => {
    const toValue = showFabMenu ? 0 : 1;
    setShowFabMenu(!showFabMenu);

    Animated.parallel([
      Animated.spring(fabAnimation, {
        toValue,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(menuAnimation, {
        toValue,
        friction: 6,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date: Date): CalendarDayItem[] => {
    const days: CalendarDayItem[] = [];
    const totalDays = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);

    // 빈 날짜 추가
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, index: i });
    }

    // 실제 날짜 추가
    for (let i = 1; i <= totalDays; i++) {
      const calendarDate = new Date(date.getFullYear(), date.getMonth(), i);
      const isToday = calendarDate.toDateString() === new Date().toDateString();
      const financeData = getFinanceForDate(calendarDate, activeView);

      days.push({
        date: calendarDate,
        isToday,
        financeData,
      });
    }

    return days;
  };

  // 이전 달, 현재 달, 다음 달 캘린더 데이터 미리 계산
  const prevMonthCalendar = useMemo(
    () => generateCalendarDays(prevMonth),
    [prevMonth, activeView]
  );
  const currentMonthCalendar = useMemo(
    () => generateCalendarDays(displayedMonth),
    [displayedMonth, activeView]
  );
  const nextMonthCalendar = useMemo(
    () => generateCalendarDays(nextMonth),
    [nextMonth, activeView]
  );

  const handleSelectDate = (date: Date) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const transactions = getTransactionsForDate(date).map((t) => {
      const transactionDate = t.time ? t.time.split("T")[0] : currentDate;
      return {
        id: t.id.toString(),
        amount: t.amount,
        date: transactionDate,
        time: t.time || undefined,
        notes: t.notes || undefined,
        remittance: t.remittance,
        targetname: t.targetname || undefined,
        category: t.category || undefined,
      } as Transaction;
    });

    navigation.navigate("Daily", {
      screen: "DailyDetail",
      params: {
        selectedDate: date.toISOString(),
        transactions,
      },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header
          showBack={false}
          rightElement={
            <Pressable
              style={styles.settingsButton}
              onPress={() =>
                navigation.navigate("Profile", {
                  screen: "ProfileMain",
                  params: {},
                })
              }
            >
              <MaterialCommunityIcons
                name="account-heart"
                size={28}
                color={theme.colors.text}
              />
            </Pressable>
          }
          centerElement={
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          }
        />
        <View style={styles.partnerSwitchContainer}>
          <PartnerSwitch />
        </View>
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>
            {`${displayedMonth.getFullYear()}년 ${
              displayedMonth.getMonth() + 1
            }월`}
          </Text>
        </View>
        <View style={styles.weekdayHeader}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>
        <PanGestureHandler
          onGestureEvent={(event) => {
            if (!isAnimating) {
              translateX.setValue(event.nativeEvent.translationX);
            }
          }}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              if (isAnimating) return;

              const threshold = dimensions.width * 0.15;
              const distance = event.nativeEvent.translationX;

              if (Math.abs(distance) > threshold) {
                const direction = distance > 0 ? 1 : -1;
                const newDate = new Date(displayedMonth);
                newDate.setMonth(displayedMonth.getMonth() - direction);

                setDisplayedMonth(newDate);
                translateX.setValue(0);
              } else {
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                  friction: 10,
                  tension: 60,
                }).start();
              }
            }
          }}
          enabled={true}
        >
          <View style={styles.calendarWrapper}>
            {/* 이전 달 캘린더 */}
            <Animated.View
              style={[
                styles.calendarContainer,
                styles.adjacentCalendar,
                {
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [-dimensions.width, 0, dimensions.width],
                        outputRange: [
                          -dimensions.width * 2,
                          -dimensions.width,
                          0,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.calendar}>
                {prevMonthCalendar.map((day, index) => (
                  <CalendarDay
                    key={`prev-${
                      day.isEmpty ? `empty-${index}` : day.date?.toString()
                    }`}
                    day={day}
                    navigation={navigation}
                    onSelectDate={handleSelectDate}
                    isSelected={
                      selectedDate &&
                      day.date &&
                      selectedDate.toDateString() === day.date.toDateString()
                    }
                  />
                ))}
              </View>
            </Animated.View>

            {/* 현재 달 캘린더 */}
            <Animated.View
              style={[
                styles.calendarContainer,
                {
                  transform: [{ translateX }],
                  zIndex: 1,
                },
              ]}
            >
              <View style={styles.calendar}>
                {currentMonthCalendar.map((day, index) => (
                  <CalendarDay
                    key={`current-${
                      day.isEmpty ? `empty-${index}` : day.date?.toString()
                    }`}
                    day={day}
                    navigation={navigation}
                    onSelectDate={handleSelectDate}
                    isSelected={
                      selectedDate &&
                      day.date &&
                      selectedDate.toDateString() === day.date.toDateString()
                    }
                  />
                ))}
              </View>
            </Animated.View>

            {/* 다음 달 캘린더 */}
            <Animated.View
              style={[
                styles.calendarContainer,
                styles.adjacentCalendar,
                {
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [-dimensions.width, 0, dimensions.width],
                        outputRange: [
                          0,
                          dimensions.width,
                          dimensions.width * 2,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.calendar}>
                {nextMonthCalendar.map((day, index) => (
                  <CalendarDay
                    key={`next-${
                      day.isEmpty ? `empty-${index}` : day.date?.toString()
                    }`}
                    day={day}
                    navigation={navigation}
                    onSelectDate={handleSelectDate}
                    isSelected={
                      selectedDate &&
                      day.date &&
                      selectedDate.toDateString() === day.date.toDateString()
                    }
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </PanGestureHandler>
        <View style={{ flex: 1 }} />
        <FABComponent
          navigation={navigation}
          showFabMenu={showFabMenu}
          toggleFabMenu={toggleFabMenu}
          fabAnimation={fabAnimation}
          menuAnimation={menuAnimation}
          position={fabPosition}
          setPosition={setFabPosition}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  settingsButton: {
    padding: 8,
  },
  partnerSwitchContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  monthText: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.5,
    textAlign: "center",
    // 폰트 수정하고 싶으면 여기서 수정, 지금 마음에 안들긴 하는데 나중에 같이 수정보자자
    fontFamily: "OTEnjoystoriesBA",
  },
  weekdayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  weekdayText: {
    width: "13.28%",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textLight,
  },
  calendarWrapper: {
    height: "70%",
    position: "relative",
    overflow: "hidden",
  },
  calendarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
  },
  adjacentCalendar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 4,
  },
  emptyDay: {
    width: "13.28%",
    aspectRatio: 0.85,
    padding: 2,
  },
  dayCard: {
    width: "13.28%",
    aspectRatio: 0.85,
    padding: 2,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  dayCardWithEntry: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  todayCard: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  todayText: {
    color: theme.colors.white,
  },
  financeIndicator: {
    marginTop: 3,
    alignItems: "center",
  },
  earnText: {
    fontSize: 10,
    color: theme.colors.success || "green",
    fontWeight: "600",
  },
  consumeText: {
    fontSize: 10,
    color: theme.colors.error || "red",
    fontWeight: "600",
  },
  dailyOverview: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  dailySummaryContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  dailySummaryDate: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dailySummaryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  transactionsContainer: {
    padding: theme.spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  transactionDetails: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  transactionTarget: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  transactionTime: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  expenseAmount: {
    color: theme.colors.error,
  },
  incomeAmount: {
    color: theme.colors.success,
  },
  noTransactionsContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  noTransactionsText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  fabContainer: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: 90,
    alignItems: "flex-end",
    elevation: 1000,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.medium,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fabMenu: {
    position: "absolute",
    bottom: 70,
    right: 0,
    backgroundColor: "transparent",
    gap: theme.spacing.md,
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    transform: [{ scale: 1.05 }],
    maxWidth: 140,
    minWidth: 126,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  fabMenuText: {
    color: theme.colors.white,
    fontWeight: "600",
    marginLeft: theme.spacing.md,
    fontSize: 13,
    flexShrink: 1,
  },
  logo: {
    width: 600,
    height: 200,
  },
});
