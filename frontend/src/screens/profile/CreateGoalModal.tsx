import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import DatePicker from "../../components/common/DatePicker";
import { GoalCreateRequest } from "../../hooks/goal/useGoalCreate";
import { Goal } from "../../types";

// 숫자 포맷팅 함수: 천 단위로 콤마 추가
const formatNumberWithCommas = (value: string | number): string => {
  if (!value) return "";
  const stringValue = String(value).replace(/,/g, "");
  // 값이 0이면 빈 문자열 반환 (0원 강제 입력 방지)
  if (stringValue === "0") return "";
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (goalData: GoalCreateRequest) => Promise<void>;
  isSubmitting: boolean;
  isUpdate?: boolean;
  currentGoal?: Goal | null;
}

interface NewGoalForm {
  title: string;
  goalAmount: string;
  currentAmount: string;
  startDate: string;
  goalDate: string;
  contentURL: string;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  isUpdate = false,
  currentGoal,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<"start" | "goal">(
    "goal"
  );

  // 현재 날짜 구하기
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

  const [newGoal, setNewGoal] = useState<NewGoalForm>({
    title: "",
    goalAmount: "",
    currentAmount: "",
    startDate: formattedToday,
    goalDate: "",
    contentURL: "",
  });

  // 목표 데이터가 있으면 초기화
  useEffect(() => {
    if (isUpdate && currentGoal) {
      setNewGoal({
        title: currentGoal.title || "",
        goalAmount: currentGoal.goalAmount
          ? String(Math.floor(currentGoal.goalAmount / 1000))
          : "",
        currentAmount: currentGoal.currentAmount
          ? String(Math.floor(currentGoal.currentAmount / 1000))
          : "",
        startDate: currentGoal.startDate || formattedToday,
        goalDate: currentGoal.goalDate || "",
        contentURL: currentGoal.contentURL || "",
      });
    } else {
      resetForm();
    }
  }, [visible, isUpdate, currentGoal]);

  const handleInputChange = (field: keyof NewGoalForm, value: string) => {
    // 숫자 입력 필드의 경우 콤마 제거 후 숫자만 추출
    if (field === "goalAmount" || field === "currentAmount") {
      const numericValue = value.replace(/[^0-9]/g, "");

      // 목표 금액에 1000 곱하는 로직은 제거하고 입력 값 그대로 저장
      setNewGoal((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
    } else {
      setNewGoal((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDateSelect = (date: Date) => {
    // 날짜를 YYYY-MM-DD 형식으로 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (datePickerType === "start") {
      // 시작일이 오늘보다 미래인지 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간 부분 초기화
      
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0); // 시간 부분 초기화
      
      if (selectedDate > today) {
        Alert.alert(
          "날짜 오류", 
          "시작일은 오늘 또는 과거 날짜만 선택 가능합니다.",
          [{ text: "확인" }]
        );
        return;
      }
      
      setNewGoal((prev) => ({ ...prev, startDate: formattedDate }));
    } else {
      // 목표일 선택 시 시작일보다 미래인지 확인
      const startDate = new Date(newGoal.startDate);
      const selectedDate = new Date(date);
      
      if (selectedDate <= startDate) {
        Alert.alert(
          "날짜 오류", 
          "목표일은 시작일보다 미래 날짜여야 합니다.",
          [{ text: "확인" }]
        );
        return;
      }
      
      setNewGoal((prev) => ({ ...prev, goalDate: formattedDate }));
    }

    setShowDatePicker(false);
  };

  const openDatePicker = (type: "start" | "goal") => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  const resetForm = () => {
    setNewGoal({
      title: "",
      goalAmount: "",
      currentAmount: "",
      startDate: formattedToday,
      goalDate: "",
      contentURL: "",
    });
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  // 목표 생성 또는 업데이트 처리
  const handleCreateOrUpdateGoal = async () => {
    // 필수 입력값 검증 강화
    if (!newGoal.title.trim()) {
      Alert.alert("입력 오류", "목표 제목을 입력해주세요.");
      return;
    }

    if (!newGoal.goalAmount || parseInt(newGoal.goalAmount) <= 0) {
      Alert.alert("입력 오류", "목표 금액을 입력해주세요.");
      return;
    }

    if (!newGoal.currentAmount) {
      Alert.alert("입력 오류", "현재 소지 금액을 입력해주세요.");
      return;
    }

    if (!newGoal.startDate) {
      Alert.alert("입력 오류", "시작일을 선택해주세요.");
      return;
    }

    if (!newGoal.goalDate) {
      Alert.alert("입력 오류", "목표일을 선택해주세요.");
      return;
    }
    
    // 시작일이 오늘보다 미래인지 다시 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(newGoal.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate > today) {
      Alert.alert("날짜 오류", "시작일은 오늘 또는 과거 날짜만 선택 가능합니다.");
      return;
    }
    
    // 목표일이 시작일보다 미래인지 확인
    const goalDate = new Date(newGoal.goalDate);
    
    if (goalDate <= startDate) {
      Alert.alert("날짜 오류", "목표일은 시작일보다 미래 날짜여야 합니다.");
      return;
    }

    try {
      // 목표 데이터 구성
      const goalData: GoalCreateRequest = {
        ...currentGoal, // 기존 id와 다른 필드들 유지 (업데이트 시)
        title: newGoal.title.trim(),
        goalAmount: parseInt(newGoal.goalAmount.replace(/,/g, "")) * 1000, // 천원 단위로 변환
        currentAmount: parseInt(newGoal.currentAmount.replace(/,/g, "")) * 1000, // 천원 단위로 변환
        startDate: newGoal.startDate,
        goalDate: newGoal.goalDate,
        contentURL: newGoal.contentURL,
      };

      // 제출
      await onSubmit(goalData);

      resetForm();
    } catch (error) {
      console.error("목표 처리 실패:", error);
      Alert.alert("오류", "목표 처리 중 오류가 발생했습니다.");
    }
  };

  // 입력된 금액에 콤마 추가하여 표시
  const formattedGoalAmount = formatNumberWithCommas(newGoal.goalAmount);
  const formattedCurrentAmount = formatNumberWithCommas(newGoal.currentAmount);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isUpdate ? "목표 업데이트" : "목표 설정"}
            </Text>
            <Pressable style={styles.closeButton} onPress={handleCloseModal}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>목표 제목</Text>
              <TextInput
                style={styles.input}
                value={newGoal.title}
                onChangeText={(value) => handleInputChange("title", value)}
                placeholderTextColor={theme.colors.textLight}
                placeholder="예: 강남 한강뷰 아파트"
                maxLength={100}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>목표 금액</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formattedGoalAmount}
                  onChangeText={(value) =>
                    handleInputChange("goalAmount", value)
                  }
                  placeholder="목표 금액을 입력하세요"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>천원</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>현재 소지 금액</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formattedCurrentAmount}
                  onChangeText={(value) =>
                    handleInputChange("currentAmount", value)
                  }
                  placeholder="현재 보유한 금액을 입력하세요"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>천원</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>시작일</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => openDatePicker("start")}
              >
                <Text style={styles.dateButtonText}>
                  {newGoal.startDate || "시작일을 선택하세요"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.textLight}
                />
              </Pressable>
              <Text style={styles.helperText}>
                시작일은 오늘 또는 과거 날짜만 선택 가능합니다
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>목표일</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => openDatePicker("goal")}
              >
                <Text style={styles.dateButtonText}>
                  {newGoal.goalDate || "목표일을 선택하세요"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.textLight}
                />
              </Pressable>
              <Text style={styles.helperText}>
                목표일은 시작일보다 미래 날짜여야 합니다
              </Text>
            </View>

            <DatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onSelectDate={handleDateSelect}
              selectedDate={
                datePickerType === "start"
                  ? newGoal.startDate
                    ? new Date(newGoal.startDate)
                    : new Date()
                  : newGoal.goalDate
                    ? new Date(newGoal.goalDate)
                    : undefined
              }
            />

            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.cancelButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.submitButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleCreateOrUpdateGoal}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? "처리 중..."
                    : isUpdate
                      ? "목표 업데이트"
                      : "목표 설정 완료"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: "90%",
    maxHeight: "90%",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  inputSuffix: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  dateButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    backgroundColor: theme.colors.textLight,
  },
  cancelButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
});

export default CreateGoalModal;
