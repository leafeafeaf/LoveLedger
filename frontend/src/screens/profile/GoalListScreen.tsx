import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, ProfileStackParamList } from "../../types";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { ProfileScreenProps } from "../../types";
import { useGoalList } from "../../hooks/goal/useGoalList";
import { useGoalDelete } from "../../hooks/goal/useGoalDelete";
import {
  useGoalCreate,
  GoalCreateRequest,
} from "../../hooks/goal/useGoalCreate";
import { useGoalUpdate } from "../../hooks/goal/useGoalUpdate";
import CreateGoalModal from "./CreateGoalModal";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 금액을 억, 만, 천 단위로 포맷하는 함수
const formatKoreanCurrency = (amount: number): string => {
  if (amount === 0) return "0원";

  const billion = Math.floor(amount / 1000000000);
  const million = Math.floor((amount % 1000000000) / 10000);
  const thousand = Math.floor((amount % 10000) / 1000);
  const remainder = amount % 1000;

  let result = "";

  if (billion > 0) {
    result += `${billion}억 `;
  }

  if (million > 0) {
    result += `${million}만 `;
  }

  if (thousand > 0) {
    result += `${thousand}천 `;
  }

  if (remainder > 0) {
    result += `${remainder}`;
  }

  return result.trim() + "원";
};

// API 응답 타입 정의
interface GoalResponse {
  status: number;
  message: string;
  data: {
    goalId: string;
    id?: string;
  } | null;
  timestamp: string;
}

type GoalListScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  "GoalList"
>;

interface GoalListScreenProps {
  navigation: GoalListScreenNavigationProp;
}

export default function GoalListScreen({ navigation }: GoalListScreenProps) {
  const { data: goalData, isLoading, error, refetch } = useGoalList();
  const goalCreateMutation = useGoalCreate();
  const goalUpdateMutation = useGoalUpdate();
  const deleteGoalMutation = useGoalDelete();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // 컴포넌트 마운트 시 목표 이미지 로드
  useEffect(() => {
    if (goalData?.id) {
      loadLocalImage(goalData.id);
    }
  }, [goalData]);

  // 목표 ID로 로컬 이미지 로드
  const loadLocalImage = async (goalId: string) => {
    try {
      const storageKey = `goalImage_${goalId}`;
      const storedImage = await AsyncStorage.getItem(storageKey);

      if (storedImage) {
        setLocalImage(storedImage);
      } else {
        setLocalImage(null);
      }
    } catch (error) {
      console.error("이미지 로드 오류:", error);
      setLocalImage(null);
    }
  };

  // 이미지 선택 및 업로드 처리
  const handleImageUpload = async () => {
    try {
      // 목표가 없으면 이미지 업로드를 막음
      if (!goalData || error) {
        Alert.alert("알림", "먼저 목표를 생성해주세요.");
        return;
      }

      setIsImageLoading(true);

      // 이미지 권한 요청
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      // 이미지 선택기 실행
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const selectedImageUri = result.assets[0].uri;

        // 목표 ID를 사용해 이미지 저장
        const storageKey = `goalImage_${goalData.id}`;

        // AsyncStorage에 이미지 저장
        await AsyncStorage.setItem(storageKey, selectedImageUri);

        // 로컬 상태 업데이트
        setLocalImage(selectedImageUri);

        Alert.alert("성공", "이미지가 성공적으로 변경되었습니다.");
      }
    } catch (error) {
      console.error("이미지 처리 오류:", error);
      Alert.alert("오류", "이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsImageLoading(false);
    }
  };

  // 목표 생성 모달 열기
  const openCreateModal = () => {
    setIsUpdateMode(false);
    setIsModalVisible(true);
  };

  // 목표 업데이트 모달 열기
  const openUpdateModal = () => {
    setIsUpdateMode(true);
    setIsModalVisible(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleGoalSubmit = async (goalData: GoalCreateRequest) => {
    try {
      if (isUpdateMode) {
        // 업데이트 모드일 경우
        await goalUpdateMutation.mutateAsync(goalData);
        closeModal();
        refetch();
        Alert.alert("성공", "목표가 성공적으로 업데이트되었습니다.");
      } else {
        // 생성 모드일 경우
        const response = (await goalCreateMutation.mutateAsync(
          goalData
        )) as GoalResponse;

        closeModal();
        refetch();
        Alert.alert("성공", "목표가 성공적으로 생성되었습니다.");
      }
    } catch (error: any) {
      console.error("목표 처리 실패:", error);
      Alert.alert(
        "오류",
        isUpdateMode
          ? "목표 업데이트에 실패했습니다."
          : "목표 생성에 실패했습니다."
      );
    }
  };

  const handleDeleteGoal = async () => {
    try {
      Alert.alert("목표 삭제", "정말 이 목표를 삭제하시겠습니까?", [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              // 목표 ID로 저장된 이미지 삭제
              if (goalData?.id) {
                await AsyncStorage.removeItem(`goalImage_${goalData.id}`);
              }

              await deleteGoalMutation.mutateAsync();
              setLocalImage(null);
              Alert.alert("삭제 완료", "목표가 성공적으로 삭제되었습니다.");
              refetch();
            } catch (error) {
              console.error("목표 삭제 실패:", error);
              Alert.alert("오류", "목표 삭제에 실패했습니다.");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("목표 삭제 실패:", error);
      Alert.alert("오류", "목표 삭제에 실패했습니다.");
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

  return (
    <View style={styles.container}>
      <Header title="목표 관리" onBack={() => navigation.goBack()} />

      {error || !goalData ? (
        // 목표가 없을 때
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="target"
            size={64}
            color={theme.colors.textLight}
          />
          <Text style={styles.emptyText}>설정된 목표가 없습니다.</Text>
          <Text style={styles.emptySubtext}>
            아래 버튼을 눌러 새로운 목표를 설정해보세요.
          </Text>

          <Pressable
            style={[styles.createButton, styles.marginTop]}
            onPress={openCreateModal}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.colors.white}
            />
            <Text style={styles.createButtonText}>새로운 목표 만들기</Text>
          </Pressable>
        </View>
      ) : (
        // 목표가 있을 때
        <>
          <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.goalItem}>
                <View style={styles.goalHeaderContainer}>
                  <Text style={styles.goalTitle}>{goalData.title}</Text>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={handleDeleteGoal}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={28}
                      color={theme.colors.error}
                    />
                  </Pressable>
                </View>

                {/* 이미지 컨테이너 */}
                <View style={styles.imageContainer}>
                  {isImageLoading ? (
                    <View style={styles.emptyImageContainer}>
                      <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                      />
                    </View>
                  ) : localImage ? (
                    <Image
                      source={{ uri: localImage }}
                      style={styles.goalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.emptyImageContainer}>
                      <MaterialCommunityIcons
                        name="image-outline"
                        size={40}
                        color={theme.colors.textLight}
                      />
                      <Text style={styles.emptyImageText}>
                        목표 사진을 업로드 해주세요
                      </Text>
                    </View>
                  )}

                  {/* 이미지 편집 버튼 */}
                  <Pressable
                    style={styles.editImageButton}
                    onPress={handleImageUpload}
                    disabled={isImageLoading}
                  >
                    <MaterialCommunityIcons
                      name="image-edit"
                      size={20}
                      color={theme.colors.white}
                    />
                  </Pressable>
                </View>

                <View style={styles.goalDetailsContainer}>
                  <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>진행 상황</Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${
                              (goalData.currentAmount / goalData.goalAmount) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalAmount}>
                        {formatKoreanCurrency(goalData.currentAmount)} /{" "}
                        {formatKoreanCurrency(goalData.goalAmount)}
                      </Text>
                      <Text style={styles.goalPercentage}>
                        {Math.round(
                          (goalData.currentAmount / goalData.goalAmount) * 100
                        )}
                        %
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateSection}>
                    <Text style={styles.sectionTitle}>기간</Text>
                    <View style={styles.dateContainer}>
                      <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>시작일</Text>
                        <Text style={styles.dateValue}>
                          {goalData.startDate}
                        </Text>
                      </View>
                      <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>목표일</Text>
                        <Text style={styles.dateValue}>
                          {goalData.goalDate}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Pressable
                  style={[styles.createButton, styles.updateButton]}
                  onPress={openUpdateModal}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color={theme.colors.white}
                  />
                  <Text style={styles.createButtonText}>목표 수정하기</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </>
      )}

      {/* 목표 생성/수정 모달 */}
      <CreateGoalModal
        visible={isModalVisible}
        onClose={closeModal}
        onSubmit={handleGoalSubmit}
        isSubmitting={
          goalCreateMutation.isPending || goalUpdateMutation.isPending
        }
        isUpdate={isUpdateMode}
        currentGoal={goalData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  goalItem: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
  },
  goalHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.text,
    flex: 1,
  },
  // 이미지 관련 스타일 추가
  imageContainer: {
    width: "100%",
    height: 280,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: theme.colors.textLight,
    position: "relative",
  },
  goalImage: {
    width: "100%",
    height: "100%",
  },
  // 이미지 편집 버튼 스타일 추가
  editImageButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  goalDetailsContainer: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 10,
  },
  progressContainer: {
    height: 12,
    backgroundColor: theme.colors.textLight,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
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
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  },
  goalPercentage: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  dateSection: {
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
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
    gap: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    marginBottom: 20,
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
  marginTop: {
    marginTop: 20,
  },
  deleteButton: {
    padding: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    elevation: 3,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyImageText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
});
