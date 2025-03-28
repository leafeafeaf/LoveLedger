import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTransactionsStart, fetchTransactionsSuccess, fetchTransactionsFailure } from "../../store/financeSlice";
import { CategorySummary, IconName, Transaction } from "../../types";
import { transactionHistoryData } from "../../../dummyData";

// 통화 포맷 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading } = useAppSelector(state => state.finance);
  const { activeView } = useAppSelector(state => state.partner);

  // 데이터 로드
  useEffect(() => {
    dispatch(fetchTransactionsStart());
    
    // 더미 데이터에서 activeView에 따라 필터링
    try {
      let filteredTransactions;
      if (activeView === 'you') {
        filteredTransactions = transactionHistoryData.data.history.filter(t => t.userId === 'user1');
      } else if (activeView === 'partner') {
        filteredTransactions = transactionHistoryData.data.history.filter(t => t.userId === 'user2');
      } else {
        filteredTransactions = transactionHistoryData.data.history;
      }
      
      dispatch(fetchTransactionsSuccess(filteredTransactions));
    } catch (error) {
      dispatch(fetchTransactionsFailure('데이터 로드 중 오류가 발생했습니다.'));
    }
  }, [activeView, dispatch]);
  

  // 데이터 계산을 memoize
  const summaryData = useMemo(() => {
    // 총 지출 계산
    const totalSpent = transactions.reduce(
      (total, transaction) => 
        transaction.remittance ? total + transaction.amount : total, 
      0
    );

    // 총 수입 계산
    const totalEarned = transactions.reduce(
      (total, transaction) => 
        !transaction.remittance ? total + transaction.amount : total, 
      0
    );

    // 카테고리별 지출 계산
    const categoryMap = new Map<string, number>();
    transactions.forEach(transaction => {
      if (transaction.remittance && transaction.category) {
        const currentAmount = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, currentAmount + transaction.amount);
      }
    });

    // 카테고리 정렬 및 상위 4개 추출
    const categories: CategorySummary[] = Array.from(categoryMap)
      .map(([name, amount]) => {
        // 카테고리에 따른 아이콘 지정
        let icon: IconName = "cash";
        if (name === "식비") icon = "food";
        else if (name === "카페") icon = "coffee";
        else if (name === "마트/편의점") icon = "store";
        else if (name === "문화/여가") icon = "ticket";
        else if (name === "현금인출") icon = "bank";

        return { name, amount, icon };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // 최근 거래 추출
    const recentTransactions = [...transactions]
      .sort((a, b) => 
        new Date(b.time || b.date).getTime() - new Date(a.time || a.date).getTime()
      )
      .slice(0, 5);

    return {
      totalSpent,
      totalEarned,
      monthlyAverage: Math.round(totalSpent / 30),
      categories,
      recentTransactions
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>재정 요약</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewColumn}>
            <Text style={styles.overviewLabel}>총 지출</Text>
            <Text
              style={[styles.amount, { color: theme.colors.error }]}
            >
              {formatCurrency(summaryData.totalSpent)}
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewColumn}>
            <Text style={styles.overviewLabel}>총 수입</Text>
            <Text
              style={[
                styles.amount,
                { color: theme.colors.success },
              ]}
            >
              {formatCurrency(summaryData.totalEarned)}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          일일 평균: {formatCurrency(summaryData.monthlyAverage)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>주요 카테고리</Text>
      <View style={styles.categoriesContainer}>
        {summaryData.categories.map((category) => (
          <View key={category.name} style={styles.categoryCard}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={category.icon}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryAmount}>
              {formatCurrency(category.amount)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>최근 거래</Text>
      {summaryData.recentTransactions.map((transaction: Transaction) => (
        <View
          key={transaction.id}
          style={styles.transactionCard}
        >
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>
              {transaction.targetname || "무제 거래"}
            </Text>
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionCategory}>
                {transaction.category || "기타"}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString("ko-KR")}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              transaction.remittance
                ? styles.expenseAmount
                : styles.incomeAmount,
            ]}
          >
            {transaction.remittance ? "- " : "+ "}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 76,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  overviewCard: {
    margin: theme.spacing.md,
    marginTop: 76,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  overviewTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overviewColumn: {
    flex: 1,
    alignItems: "center",
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  overviewLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    margin: theme.spacing.md,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    // padding: theme.spacing.md,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  categoryCard: {
    width: "48.5%",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    // margin: theme.spacing.sm,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  transactionMeta: {
    flexDirection: "row",
    marginTop: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.textLight,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseAmount: {
    color: theme.colors.error,
  },
  incomeAmount: {
    color: theme.colors.success,
  },
});