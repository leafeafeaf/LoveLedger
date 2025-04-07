import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DiaryStackParamList, TransactionHistory, TransactionChange } from "../../types";
import Header from "../../components/common/Header";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useTransactionHistory} from "../../hooks/useTransactionHistory";
import { useUpdateTransactionHistory} from "../../hooks/useUpdateTransactionHistory";


type DiaryEditDailyScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DiaryStackParamList, "DiaryEditDaily">,
  NativeStackNavigationProp<RootStackParamList>
>;

type DiaryEditDailyScreenProps = {
  navigation: DiaryEditDailyScreenNavigationProp;
  route: NativeStackScreenProps<DiaryStackParamList, "DiaryEditDaily">["route"];
};

// 기분 타입 정의
type MoodType = "happy" | "excited" | "peaceful" | "sad";

interface MoodOption {
  id: MoodType;
  label: string;
  icon: string;
}

// interface TransactionHistory {
//   transactionId: number;
//   time: string;
//   remittance: boolean;
//   targetName: string;
//   updatedTargetName: string;
//   category: string;
//   afterAmount: number;
//   amount: number;
// }

// interface TransactionChange {
//   original: TransactionHistory;
//   modified: TransactionHistory;
//   isSelected: boolean;
// }

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DiaryEditDailyScreen({
  navigation,
  route,
}: DiaryEditDailyScreenProps) {
  const { diaryId, selectedDate } = route.params;
  const [changes, setChanges] = useState<TransactionChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedDateObj = new Date(selectedDate);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const { mutate: fetchTransactionHistory } = useTransactionHistory(diaryId, setChanges, setIsLoading);
  const updateMutation = useUpdateTransactionHistory();

  const toggleChangeSelection = (index: number) => {
    console.log(index);

    setChanges((prev) =>
      prev.map((change, i) =>
        i === index ? { ...change, isSelected: !change.isSelected } : change
      )
    );
  };

  const handleSave = () => {
    const selectedChanges = changes.filter((change) => change.isSelected);
    if (selectedChanges.length === 0) {
      Alert.alert("알림", "수정할 내역을 선택해주세요.");
      return;
    }
    const transactionIds = selectedChanges.map(
      (change) => change.modified.transactionId
    );
  
    const updatedTargetNames = selectedChanges.map(
      (change) => {
        if (change.modified.updatedTargetName === null || 
            change.modified.updatedTargetName === change.original.targetname) {
          return change.original.targetname;
        }
        return change.modified.updatedTargetName;
      }
    );
    console.log(transactionIds);

    console.log("updatedTargetNames : " + updatedTargetNames);

    updateMutation.mutate(
      {
        transactionId: transactionIds,
        updatedTargetNames,
      },
      {
        onSuccess: () => {
          Alert.alert("완료", "거래 내역이 성공적으로 수정되었습니다.");
          navigation.goBack();
        },
        onError: () => {
          Alert.alert("오류", "거래 내역 수정에 실패했습니다.");
        },
      }
    );
  };


  return (
    <View style={styles.container}>
      <Header
        title="가계부 수정"
        subtitle={selectedDateObj.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>거래 내역을 불러오는 중...</Text>
          </View>
        ) : changes.length > 0 ? (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>수정 내역 요약</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>수정된 항목</Text>
                  <Text style={styles.summaryValue}>{changes.length}개</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>선택된 항목</Text>
                  <Text style={styles.summaryValue}>
                    {changes.filter((change) => change.isSelected).length}개
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.changesContainer}>
              {changes.map((change, index) => (
                <View
                  key={change.original.transactionId}
                  style={styles.changeItem}
                >
                  <View style={styles.changeContent}>
                    <View style={styles.originalTransaction}>
                      <Text style={styles.transactionTime}>
                        {new Date(change.original.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text style={styles.transactionName}>
                        {change.original.targetname}
                      </Text>
                      <Text
                        style={[
                          styles.transactionAmount,
                          change.original.remittance
                            ? styles.expenseAmount
                            : styles.incomeAmount,
                        ]}
                      >
                        {change.original.remittance ? "- " : "+ "}
                        {formatCurrency(change.original.amount)}
                      </Text>
                    </View>

                    <View style={styles.arrowContainer}>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>

                    <View style={styles.modifiedTransaction}>
                      <Text style={styles.transactionTime}>
                        {new Date(change.modified.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text style={[styles.transactionName, styles.editedTransactionName]}>
                        {change.modified.targetname}
                      </Text>
                      <Text
                        style={[
                          styles.transactionAmount,
                          change.modified.remittance
                            ? styles.expenseAmount
                            : styles.incomeAmount,
                        ]}
                      >
                        {change.modified.remittance ? "- " : "+ "}
                        {formatCurrency(change.modified.amount)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      change.isSelected && styles.checkedBox,
                    ]}
                    onPress={() => toggleChangeSelection(index)}
                  >
                    {change.isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.white}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="script-text-outline"
              size={48}
              color={theme.colors.textLight}
            />
            <Text style={styles.emptyText}>수정할 내역이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons
            name="content-save"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.saveButtonText}>수정사항 저장</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  summaryContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  changesContainer: {
    gap: theme.spacing.md,
  },
  changeItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  changeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  originalTransaction: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  modifiedTransaction: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  arrowContainer: {
    justifyContent: "center",
  },
  transactionTime: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  editedTransactionName:{
    color: theme.colors.success,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.md,
  },
  checkedBox: {
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
});