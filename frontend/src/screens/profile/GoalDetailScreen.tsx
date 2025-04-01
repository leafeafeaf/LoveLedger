import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import {
  Goal,
  Transaction,
  ProfileScreenProps,
} from "../../types";
import { useGoalList } from "../../hooks/useGoalList";
import { useGoalUpdate } from "../../hooks/useGoalUpdate";
import { useGoalTransactions } from "../../hooks/useGoalTransactions";
import { useGoalDelete } from "../../hooks/useGoalDelete";

const GoalDetailScreen: FC<ProfileScreenProps<"GoalDetail">> = ({
  navigation,
  route,
}) => {
  const { goal: initialGoal } = route.params;
  const [goal, setGoal] = useState<Goal>(initialGoal);
  const [showAddProgressModal, setShowAddProgressModal] =
    useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [progressAmount, setProgressAmount] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    title: goal.title,
    description: goal.description,
    target: goal.target.toString(),
    deadline: goal.deadline,
  });
  
  const { data: goalData, isLoading, error } = useGoalList();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGoalTransactions();
  const { mutate: updateGoal, isPending: isUpdating } = useGoalUpdate();
  const { mutate: deleteGoal, isPending: isDeleting } = useGoalDelete();

  useEffect(() => {
    if (goalData) {
      setGoal({
        id: "1",
        title: goalData.title,
        description: "목표 설명",
        target: goalData.goalamount,
        current: goalData.currentamount,
        deadline: goalData.goaldate,
        icon: "target",
      });
    }
  }, [goalData]);

  // Function to handle delete confirmation
  const handleDelete = () => {
    deleteGoal(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigation.goBack();
      },
      onError: (error) => {
        Alert.alert("오류", error.message);
      },
    });
  };

  // Function to add progress
  const handleAddProgress = () => {
    const amount = parseInt(progressAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("알림", "유효한 금액을 입력해주세요.");
      return;
    }

    const newCurrent = goal.current + amount;
    
    // API 호출을 통한 목표 업데이트
    updateGoal(
      { currentamount: newCurrent },
      {
        onSuccess: () => {
          setGoal((prev) => ({
            ...prev,
            current: newCurrent,
          }));

          setShowAddProgressModal(false);
          setProgressAmount("");

          // Check if goal is completed
          if (newCurrent >= goal.target) {
            Alert.alert("축하합니다!", "목표를 달성했습니다! 🎉");
          }
        },
        onError: (error) => {
          Alert.alert("오류", error.message);
        },
      }
    );
  };

  // Function to handle goal edit
  const handleEdit = () => {
    const target = parseInt(editForm.target);
    if (isNaN(target) || target <= 0) {
      Alert.alert("알림", "유효한 목표 금액을 입력해주세요.");
      return;
    }

    updateGoal(
      {
        title: editForm.title,
        goalamount: target,
        goaldate: editForm.deadline,
      },
      {
        onSuccess: () => {
          setGoal((prev) => ({
            ...prev,
            title: editForm.title,
            description: editForm.description,
            target: target,
            deadline: editForm.deadline,
          }));
          setShowEditModal(false);
          Alert.alert("성공", "목표 정보가 수정되었습니다.");
        },
        onError: (error) => {
          Alert.alert("오류", error.message);
        },
      }
    );
  };

  // Function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to calculate progress percentage
  const calculateProgress = (current: number, target: number): number => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={styles.headerTitle}>목표 상세</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowEditModal(true)}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color={theme.colors.error}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.goalOverview}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <MaterialCommunityIcons
                name={goal.icon}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDeadline}>
                마감일: {new Date(goal.deadline).toLocaleDateString("ko-KR")}
              </Text>
            </View>
          </View>

          <Text style={styles.goalDescription}>{goal.description}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${calculateProgress(goal.current, goal.target)}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressDetails}>
              <Text style={styles.progressPercentage}>
                {calculateProgress(goal.current, goal.target)}% 달성
              </Text>
              <Text style={styles.progressAmount}>
                {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
              </Text>
              <Text style={styles.remainingAmount}>
                남은 금액: {formatCurrency(goal.target - goal.current)}
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.addProgressButton, isUpdating && styles.disabledButton]}
            onPress={() => setShowAddProgressModal(true)}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.addProgressText}>
              {isUpdating ? "업데이트 중..." : "진행 상황 업데이트"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>진행 내역</Text>

          {isTransactionsLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : transactionsData?.data && transactionsData.data.length > 0 ? (
            transactionsData.data.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={24}
                    color={theme.colors.success}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString("ko-KR")}
                  </Text>
                  {transaction.notes && (
                    <Text style={styles.transactionNotes}>
                      {transaction.notes}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyTransactions}>
              아직 진행 내역이 없습니다.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal
        visible={showAddProgressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>진행 상황 업데이트</Text>
              <Pressable
                style={styles.closeModalButton}
                onPress={() => setShowAddProgressModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>추가할 금액 (원)</Text>
              <TextInput
                style={styles.modalInput}
                value={progressAmount}
                onChangeText={setProgressAmount}
                placeholder="금액을 입력하세요"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="number-pad"
                autoFocus
              />

              <Text style={styles.modalInfo}>
                현재 진행 상황: {formatCurrency(goal.current)} /{" "}
                {formatCurrency(goal.target)}
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowAddProgressModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleAddProgress}
              >
                <Text style={styles.confirmButtonText}>추가</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>목표 정보 수정</Text>
              <Pressable
                style={styles.closeModalButton}
                onPress={() => setShowEditModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>목표 제목</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.title}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, title: text }))}
                placeholder="목표 제목을 입력하세요"
                placeholderTextColor={theme.colors.textLight}
              />

              <Text style={styles.modalLabel}>목표 금액 (원)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.target}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, target: text }))}
                placeholder="목표 금액을 입력하세요"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="number-pad"
              />

              <Text style={styles.modalLabel}>목표일</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.deadline}
                onChangeText={(text) => setEditForm((prev) => ({ ...prev, deadline: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleEdit}
              >
                <Text style={styles.confirmButtonText}>수정</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.deleteModalContent]}>
            <Text style={styles.deleteModalTitle}>목표 삭제</Text>
            <Text style={styles.deleteModalText}>
              정말로 이 목표를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </Text>

            <View style={styles.deleteModalButtons}>
              <Pressable
                style={[styles.deleteButton, styles.cancelDeleteButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelDeleteText}>취소</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteButton, styles.confirmDeleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.confirmDeleteText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  goalOverview: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  goalDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  progressDetails: {
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  addProgressButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addProgressText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  transactionsSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.success}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginVertical: 2,
  },
  transactionNotes: {
    fontSize: 14,
    fontStyle: "italic",
    color: theme.colors.textLight,
  },
  emptyTransactions: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    padding: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    ...theme.shadows.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  closeModalButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    padding: theme.spacing.md,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalInfo: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    marginLeft: theme.spacing.sm,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteModalContent: {
    padding: theme.spacing.lg,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  deleteModalText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  cancelDeleteButton: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmDeleteButton: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.error,
  },
  cancelDeleteText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
