import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  ProfileStackParamList,
  Goal,
  NewGoal,
} from "../../types";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { ProfileScreenProps } from "../../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DatePicker from "../../components/common/DatePicker";

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

const goals: Goal[] = [
  {
    id: "1",
    title: "여행 자금",
    description: "일본 여행을 위한 자금",
    target: 2000000,
    current: 1500000,
    deadline: "2024-12-31",
    icon: "airplane",
  },
  {
    id: "2",
    title: "결혼 자금",
    description: "결혼 준비를 위한 자금",
    target: 30000000,
    current: 10000000,
    deadline: "2025-06-30",
    icon: "heart",
  },
];

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    description: "",
    target: "0",
    deadline: "",
    icon: "star",
  });

  const handleGoalPress = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      navigation.navigate("GoalDetail", { goal });
    }
  };

  const handleCreateGoal = () => {
    // TODO: API 호출하여 목표 생성
    setIsModalVisible(false);
    setNewGoal({
      title: "",
      description: "",
      target: "0",
      deadline: "",
      icon: "star",
    });
  };

  const handleDateSelect = (date: Date) => {
    setShowDatePicker(false);
    setNewGoal({
      ...newGoal,
      deadline: date.toISOString().split("T")[0],
    });
  };

  const handleInputChange = (field: keyof NewGoal, value: string) => {
    setNewGoal({
      ...newGoal,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="목표 관리" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={styles.goalItem}
            onPress={() => handleGoalPress(goal.id)}
          >
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${(goal.current / goal.target) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>
                {goal.current.toLocaleString()}원 /{" "}
                {goal.target.toLocaleString()}원
              </Text>
              <Text style={styles.goalDeadline}>목표일: {goal.deadline}</Text>
            </View>
          </Pressable>
        ))}
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
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  createButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    ...theme.shadows.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
