import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import {
  dailyFinanceData,
  transactionHistoryData,
  Transaction,
} from "../../../dummyData";
import { Transaction as TransactionType } from "../../types";

// 아이콘 타입 정의
type CategoryIconType =
  | "cash"
  | "food"
  | "coffee"
  | "store"
  | "ticket"
  | "bank";

// 카테고리 인터페이스
interface Category {
  name: string;
  amount: number;
  icon: CategoryIconType;
}

// 최근 거래 인터페이스
interface RecentTransaction {
  id: number;
  title: string;
  amount: number;
  isExpense: boolean;
  date: string;
  category: string;
}

// 요약 데이터 인터페이스
interface SummaryData {
  totalSpent: number;
  totalEarned: number;
  monthlyAverage: number;
  categories: Category[];
  recentTransactions: RecentTransaction[];
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardScreen() {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSpent: 0,
    totalEarned: 0,
    monthlyAverage: 0,
    categories: [],
    recentTransactions: [],
  });

  useEffect(() => {
    // Calculate total spent from daily finance data
    const totalConsume = dailyFinanceData.data.days.reduce(
      (total: number, day) => total + day.consume,
      0
    );
    const totalEarn = dailyFinanceData.data.days.reduce(
      (total: number, day) => total + day.earn,
      0
    );

    // Group transactions by category
    const categoryMap = new Map<string, number>();

    transactionHistoryData.data.history.forEach(
      (transaction: TransactionType) => {
        if (transaction.remittance) {
          const currentAmount =
            categoryMap.get(transaction.category || "") || 0;
          categoryMap.set(
            transaction.category || "",
            currentAmount + transaction.amount
          );
        }
      }
    );

    // Convert category map to array
    const categories = Array.from(categoryMap)
      .map(([name, amount]) => {
        // 타입 안전한 아이콘 할당
        let icon: CategoryIconType = "cash";

        // Assign icons based on category name
        if (name === "식비") icon = "food";
        else if (name === "카페") icon = "coffee";
        else if (name === "마트/편의점") icon = "store";
        else if (name === "문화/여가") icon = "ticket";
        else if (name === "현금인출") icon = "bank";

        return { name, amount, icon };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4); // Take top 4 categories

    // Get recent transactions
    const recentTransactions = transactionHistoryData.data.history
      .slice()
      .sort(
        (a: TransactionType, b: TransactionType) =>
          new Date(b.time || "").getTime() - new Date(a.time || "").getTime()
      )
      .slice(0, 5)
      .map((transaction: TransactionType) => ({
        id: Number(transaction.transactionid) || 0,
        title: transaction.targetname || "",
        amount: transaction.amount,
        isExpense: transaction.remittance,
        date: transaction.time?.split("T")[0] || "",
        category: transaction.category || "",
      }));

    setSummaryData({
      totalSpent: totalConsume,
      totalEarned: totalEarn,
      monthlyAverage: Math.round(totalConsume / 30),
      categories,
      recentTransactions,
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header title="지출 분석" showBack={false} showClose={false} />
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>재정 요약</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewColumn}>
            <Text style={styles.overviewLabel}>총 지출</Text>
            <Text
              style={[styles.amount, { color: theme.colors.error || "red" }]}
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
                { color: theme.colors.success || "green" },
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
      {summaryData.recentTransactions.map((transaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionCategory}>
                {transaction.category}
              </Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              transaction.isExpense
                ? styles.expenseAmount
                : styles.incomeAmount,
            ]}
          >
            {transaction.isExpense ? "- " : "+ "}
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
  overviewCard: {
    margin: theme.spacing.md,
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
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
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
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
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
    margin: theme.spacing.sm,
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
    color: theme.colors.error || "red",
  },
  incomeAmount: {
    color: theme.colors.success || "green",
  },
});
