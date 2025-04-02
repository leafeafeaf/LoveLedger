import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, ProfileStackParamList } from "../../types";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { ProfileScreenProps } from "../../types";
import { useGoalList, useCreateGoal } from "../../hooks/useGoalList";
import DatePicker from "../../components/common/DatePicker";

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

interface NewGoal {
  title: string;
  description: string;
  target: string;
  deadline: string;
  icon: string;
}

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const { data: goalData, isLoading, error } = useGoalList();
  const createGoalMutation = useCreateGoal();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    description: "",
    target: "0",
    deadline: "",
    icon: "star",
  });

  const handleInputChange = (field: keyof NewGoal, value: string) => {
    setNewGoal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateSelect = (date: Date) => {
    setNewGoal((prev) => ({
      ...prev,
      deadline: date.toISOString().split("T")[0],
    }));
    setShowDatePicker(false);
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      // TODO: 에러 메시지 표시
      return;
    }

    try {
      await createGoalMutation.mutateAsync(newGoal);
      setIsModalVisible(false);
      setNewGoal({
        title: "",
        description: "",
        target: "0",
        deadline: "",
        icon: "star",
      });
    } catch (error) {
      // TODO: 에러 메시지 표시
      console.error("목표 생성 실패:", error);
    }
  };

  const handleGoalPress = () => {
    if (goalData) {
      navigation.navigate("GoalDetail", {
        goal: {
          id: "1",
          title: goalData.title,
          description: "목표 설명",
          target: goalData.goalamount,
          current: goalData.currentamount,
          deadline: goalData.goaldate,
          icon: "target",
        },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="목표 관리" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>목표를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="목표 관리" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="목표 관리" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {goalData && (
          <Pressable style={styles.goalItem} onPress={handleGoalPress}>
            <Text style={styles.goalTitle}>{goalData.title}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      (goalData.currentamount / goalData.goalamount) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>
                {goalData.currentamount.toLocaleString()}원 /{" "}
                {goalData.goalamount.toLocaleString()}원
              </Text>
              <Text style={styles.goalDeadline}>
                목표일: {goalData.goaldate}
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.createButton}
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.createButtonText}>새로운 목표 만들기</Text>
        </Pressable>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새로운 목표</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>제목</Text>
                <TextInput
                  style={styles.input}
                  value={newGoal.title}
                  onChangeText={(value) => handleInputChange("title", value)}
                  placeholder="목표 제목을 입력하세요"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>설명</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newGoal.description}
                  onChangeText={(value) =>
                    handleInputChange("description", value)
                  }
                  placeholder="목표에 대한 설명을 입력하세요"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>목표 금액</Text>
                <TextInput
                  style={styles.input}
                  value={newGoal.target}
                  onChangeText={(value) => handleInputChange("target", value)}
                  placeholder="목표 금액을 입력하세요"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>마감일</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {newGoal.deadline || "마감일을 선택하세요"}
                  </Text>
                </Pressable>
              </View>

              <DatePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={handleDateSelect}
                selectedDate={
                  newGoal.deadline ? new Date(newGoal.deadline) : undefined
                }
              />

              <Pressable style={styles.submitButton} onPress={handleCreateGoal}>
                <Text style={styles.submitButtonText}>목표 생성</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  goalItem: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.textLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalAmount: {
    fontSize: 14,
    color: theme.colors.text,
  },
  goalDeadline: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
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
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    padding: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
