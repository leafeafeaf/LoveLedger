import React, { useState, useRef, FC, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  useWindowDimensions,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { theme } from "../../utils/theme";
import { Transaction, TransactionDetail } from "../../types";
import {
  RootStackParamList,
  DailyScreenProps,
  DailyStackParamList,
} from "../../types";
import Header from "../../components/common/Header";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useAccountDetail } from "@hooks/useAccountDetail";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { 
  fetchAccountDetailStart, 
  fetchAccountDetailSuccess, 
  fetchAccountDetailFailure 
} from "../../store/financeSlice";

type DailyDetailScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DailyStackParamList, "DailyDetail">,
  NativeStackNavigationProp<RootStackParamList>
>;

type DailyDetailScreenRouteProp = RouteProp<DailyStackParamList, "DailyDetail">;

interface DailyDetailScreenProps {
  navigation: DailyDetailScreenNavigationProp;
  route: DailyDetailScreenRouteProp;
}

const DailySummary: FC<{
  selectedDate: Date;
  transactions: TransactionDetail[];
}> = ({ selectedDate, transactions }) => {
  const totalIncome = transactions
    .filter((t) => !t.remittance)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.remittance)
    .reduce((sum, t) => sum + t.amount, 0);
  const total = totalIncome - totalExpense;

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
          <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>지출</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
            {formatCurrency(totalExpense)}
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
};

const FABComponent: FC<{
  navigation: any;
  showFabMenu: boolean;
  toggleFabMenu: () => void;
  fabAnimation: Animated.Value;
  menuAnimation: Animated.Value;
  position: { x: number; y: number };
  setPosition: (pos: { x: number; y: number }) => void;
}> = ({
  navigation,
  showFabMenu,
  toggleFabMenu,
  fabAnimation,
  menuAnimation,
  position,
  setPosition,
}) => {
  const { width, height } = useWindowDimensions();
  const pan = useRef(new Animated.ValueXY()).current;

  const getValue = (value: Animated.Value) => {
    let result = 0;
    value.addListener((state) => {
      result = state.value;
    });
    value.removeAllListeners();
    return result;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: getValue(pan.x),
          y: getValue(pan.y),
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const newX = position.x + getValue(pan.x);
        const newY = position.y + getValue(pan.y);
        setPosition({
          x: Math.max(0, Math.min(newX, width - 56)),
          y: Math.max(0, Math.min(newY, height - 56)),
        });
      },
    })
  ).current;

  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });

  const menuOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          transform: [{ translateX: position.x }, { translateY: position.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.fabMenu,
          {
            transform: [{ translateY: menuTranslateY }],
            opacity: menuOpacity,
          },
        ]}
      >
        <Pressable
          style={styles.fabMenuItem}
          onPress={() => {
            toggleFabMenu();
            navigation.navigate("Story", {
              screen: "StorySettings",
              params: {
                themeStyle: undefined,
                toneStyle: undefined,
              },
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
      <Pressable style={styles.fab} onPress={toggleFabMenu}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: fabAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "45deg"],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.white}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

const DailyDetailScreen: FC<DailyScreenProps<"DailyDetail">> = ({
  navigation,
  route,
}) => {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const { accountDetail } = useSelector((state: RootState) => state.finance);

  const { selectedDate } = route.params;
  const selectedDateObj = new Date(selectedDate);
  
  const { data, isLoading, error } = useAccountDetail({
    year: selectedDateObj.getFullYear(),
    month: selectedDateObj.getMonth() + 1,
    day: selectedDateObj.getDate(),
    pageno: 1,
    size: 30,
    sort: 'DESC'
  });

  useEffect(() => {
    if (data) {
      dispatch(fetchAccountDetailSuccess(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(fetchAccountDetailFailure(error.message));
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(fetchAccountDetailStart());
  }, [dispatch]);

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

  if (isLoading || accountDetail.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || accountDetail.error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text style={styles.errorText}>데이터를 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  const transactions = data?.content || accountDetail.data?.content || [];

  return (
    <View style={styles.container}>
      <Header
        title="일별 상세"
        subtitle="지출 기록"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        <DailySummary
          selectedDate={selectedDateObj}
          transactions={transactions}
        />
        {transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction: TransactionDetail) => (
              <View
                key={transaction.transactionId}
                style={styles.transactionItem}
              >
                <Pressable
                  style={styles.transactionContent}
                  onPress={() =>
                    navigation.navigate("TransactionEdit", { 
                      transaction: {
                        id: transaction.transactionId,
                        transactionid: transaction.transactionId,
                        amount: transaction.amount,
                        date: transaction.date,
                        time: transaction.time,
                        remittance: transaction.remittance,
                        targetname: transaction.targetName,
                        category: transaction.categoryName,
                        accountNo: transaction.accountNo,
                      }
                    })
                  }
                >
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTarget}>
                      {transaction.targetName}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionCategory}>
                        {transaction.categoryName}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {transaction.time}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.remittance
                        ? { color: theme.colors.error }
                        : { color: theme.colors.success },
                    ]}
                  >
                    {transaction.remittance ? "- " : "+ "}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noTransactionsContainer}>
            <MaterialCommunityIcons
              name="script-text-outline"
              size={48}
              color={theme.colors.textLight}
            />
            <Text style={styles.noTransactionsText}>
              No transactions for this date
            </Text>
          </View>
        )}
      </ScrollView>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
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
  transactionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  noTransactionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  noTransactionsText: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
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
  menuContainer: {
    position: "absolute",
    bottom: 64,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  menuText: {
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default DailyDetailScreen;
