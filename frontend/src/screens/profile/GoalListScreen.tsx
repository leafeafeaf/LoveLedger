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
import { useFocusEffect } from "@react-navigation/native";

// 금액을 억 단위로 포맷하는 함수
const formatKoreanCurrency = (amount: number): string => {
  if (amount === 0) return "0원";

  // 억 단위로 변환 (소수점 첫째자리까지 표시)
  const billionAmount = amount / 100000000;
  
  // 소수점 첫째자리까지 표시하고 반올림
  const roundedAmount = Math.round(billionAmount * 10) / 10;
  
  return `${roundedAmount}억원`;
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
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  // 컴포넌트 초기 마운트 시 이미지 캐시 초기화
  useEffect(() => {
    const initImageCache = async () => {
      try {
        console.log("이미지 캐시 초기화 시작");
        
        // AsyncStorage의 모든 키를 가져옴
        const keys = await AsyncStorage.getAllKeys();
        console.log("AsyncStorage 키 목록 조회:", keys.length, "개");
        
        // 목표 이미지 키만 필터링
        const imageKeys = keys.filter(key => key.startsWith('goalImage_'));
        console.log("필터링된 이미지 키:", imageKeys);
        
        if (imageKeys.length > 0) {
          console.log(`${imageKeys.length}개의 목표 이미지 키를 찾았습니다`);
          
          // 모든 키에 대한 값을 가져옴
          const keyValuePairs = await AsyncStorage.multiGet(imageKeys);
          console.log("키-값 조회 결과:", keyValuePairs.length, "개 항목");
          
          // 캐시 객체 생성
          const cache: Record<string, string> = {};
          keyValuePairs.forEach(([key, value]) => {
            if (value) {
              const goalId = key.replace('goalImage_', '');
              cache[goalId] = value;
              console.log(`이미지 캐시에 추가됨: ${goalId}, URI 시작부분: ${value.substring(0, 15)}...`);
            } else {
              console.log(`NULL 값 발견: ${key}`);
            }
          });
          
          // 캐시 설정
          console.log("이미지 캐시 설정:", Object.keys(cache).length, "개 이미지");
          setImageCache(cache);
          
          // 목표 데이터가 있고 현재 캐시에 목표 ID가 있으면 이미지 미리 표시
          if (goalData?.id && cache[goalData.id]) {
            console.log("초기화 중 목표 이미지 발견, 즉시 표시:", goalData.id);
            setLocalImage(cache[goalData.id]);
          }
        } else {
          console.log('캐시할 목표 이미지가 없습니다');
        }
      } catch (error) {
        console.error('이미지 캐시 초기화 오류:', error);
      }
    };
    
    initImageCache();
  }, []);  // goalData 의존성 제거하여 초기 렌더링 시에만 실행

  // 화면에 포커스가 맞춰질 때마다 이미지를 새로 로드
  useFocusEffect(
    React.useCallback(() => {
      console.log("화면 포커스: 목표 및 이미지 데이터 새로고침");
      
      // 데이터 및 이미지 캐시 갱신
      const refreshData = async () => {
        try {
          // 먼저 목표 데이터 다시 불러오기
          const refreshedData = await refetch();
          
          // 이미지 캐시 초기화
          const keys = await AsyncStorage.getAllKeys();
          const imageKeys = keys.filter(key => key.startsWith('goalImage_'));
          
          if (imageKeys.length > 0) {
            const keyValuePairs = await AsyncStorage.multiGet(imageKeys);
            const cache: Record<string, string> = {};
            
            keyValuePairs.forEach(([key, value]) => {
              if (value) {
                const goalId = key.replace('goalImage_', '');
                cache[goalId] = value;
              }
            });
            
            setImageCache(cache);
            
            // 새로 불러온 목표 데이터에 ID가 있고 해당 ID의 이미지가 캐시에 있으면 표시
            const goalId = refreshedData.data?.id;
            if (goalId && typeof goalId === 'string') {
              if (cache[goalId]) {
                console.log("새로고침 후 이미지 발견:", goalId);
                setLocalImage(cache[goalId]);
              } else {
                // 캐시에 없지만 목표 ID가 있으면 AsyncStorage에서 직접 로드
                console.log("캐시에 없는 이미지 직접 로드 시도:", goalId);
                loadLocalImage(goalId);
              }
            }
          }
        } catch (error) {
          console.error("데이터 및 이미지 새로고침 오류:", error);
        }
      };
      
      refreshData();

      return () => {
        // 화면 포커스를 잃을 때는 특별한 정리 작업 필요 없음
      };
    }, [])  // 의존성 배열을 비워 매번 포커스될 때마다 실행
  );

  // 목표 데이터 변경 시 이미지 로드
  useEffect(() => {
    if (goalData?.id) {
      console.log("목표 ID 확인됨, 이미지 로드 시도:", goalData.id);
      
      // 이미지 로드 시도
      loadLocalImage(goalData.id);
    } else {
      console.log("목표 ID가 없어 이미지 로드를 건너뜁니다.");
      setLocalImage(null);
    }
  }, [goalData]);

  // 목표 ID로 로컬 이미지 로드
  const loadLocalImage = async (goalId: string) => {
    try {
      console.log("로컬 이미지 로드 시작, 목표 ID:", goalId);
      if (!goalId) {
        console.log("유효하지 않은 목표 ID");
        setLocalImage(null);
        return;
      }
      
      // AsyncStorage 키 구성
      const storageKey = `goalImage_${goalId}`;
      console.log("이미지 로드 키:", storageKey);
      
      // 먼저 메모리 캐시에서 확인
      if (imageCache[goalId]) {
        console.log("메모리 캐시에서 이미지 발견:", goalId);
        console.log("캐시 이미지 URI:", imageCache[goalId].substring(0, 30) + "...");
        
        setLocalImage(imageCache[goalId]);
        return;
      }
      
      // AsyncStorage에서 이미지 로드 시도
      try {
        const storedImage = await AsyncStorage.getItem(storageKey);
        console.log("AsyncStorage 조회 결과:", storedImage ? "이미지 발견" : "이미지 없음");
        
        if (storedImage) {
          console.log("AsyncStorage에서 이미지를 불러옴, URI 시작부분:", storedImage.substring(0, 30) + "...");
          
          // 유효한 URI 형식인지 확인
          if (storedImage.startsWith('file://') || storedImage.startsWith('content://') || storedImage.startsWith('ph://')) {
            console.log("유효한 URI 형식 확인됨");
            
            // 메모리 캐시에 저장
            setImageCache(prev => {
              const newCache = { ...prev, [goalId]: storedImage };
              console.log("이미지 캐시에 추가됨, 캐시 크기:", Object.keys(newCache).length);
              return newCache;
            });
            
            // 이미지 표시
            setLocalImage(storedImage);
            console.log("이미지 로드 완료");
          } else {
            console.error("저장된 이미지 URI가 유효하지 않음:", storedImage.substring(0, 10));
            setLocalImage(null);
          }
        } else {
          console.log("저장된 이미지가 없습니다.");
          setLocalImage(null);
        }
      } catch (storageError) {
        console.error("AsyncStorage 접근 오류:", storageError);
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
      // 디버깅을 위한 목표 데이터 출력
      console.log("목표 데이터 확인:", goalData);
      
      // 유효한 목표가 있는지 확인
      if (!goalData || (!goalData.id && !goalData.title)) {
        console.log("목표가 없음 - goalData:", goalData);
        Alert.alert("알림", "먼저 목표를 생성해주세요.");
        return;
      }
      
      // 목표 ID 생성 (없는 경우 타이틀과 현재 시간으로 고유 ID 생성)
      const goalId = goalData.id || `${goalData.title.replace(/\s+/g, '')}_${Date.now()}`;
      console.log("사용할 목표 ID:", goalId);

      // 이미지 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
        console.log("이미지 선택됨:", selectedImageUri);

        try {
          setIsImageLoading(true);

          // AsyncStorage 키 구성
          const storageKey = `goalImage_${goalId}`;
          
          // 이전 이미지가 있다면 삭제
          const previousImage = await AsyncStorage.getItem(storageKey);
          if (previousImage) {
            console.log("이전 이미지 삭제");
            await AsyncStorage.removeItem(storageKey);
          }

          // 새 이미지 저장
          await AsyncStorage.setItem(storageKey, selectedImageUri);
          console.log("새 이미지 저장 완료");

          // 메모리 캐시 업데이트
          setImageCache(prev => ({
            ...prev,
            [goalId]: selectedImageUri
          }));

          // 로컬 상태 업데이트
          setLocalImage(selectedImageUri);
          console.log("이미지 상태 업데이트 완료");

          Alert.alert("성공", "이미지가 저장되었습니다.");
        } catch (error) {
          console.error("이미지 저장 중 오류:", error);
          Alert.alert("오류", "이미지 저장에 실패했습니다.");
        } finally {
          setIsImageLoading(false);
        }
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      Alert.alert("오류", "이미지 업로드에 실패했습니다.");
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
        
        // 목표 데이터를 다시 가져오지만 이미지는 유지
        await refetch();
        
        Alert.alert("성공", "목표가 성공적으로 업데이트되었습니다.");
      } else {
        // 생성 모드일 경우
        const response = (await goalCreateMutation.mutateAsync(
          goalData
        )) as GoalResponse;

        closeModal();
        
        // 새 목표 ID를 얻고, 기존에 임시로 저장된 이미지가 있다면 새 ID로 이동
        if (response?.data?.goalId || response?.data?.id) {
          const newGoalId = response.data.goalId || response.data.id;
          console.log("새 목표 ID 생성됨:", newGoalId);
          
          // 새 목표 데이터를 불러옴
          await refetch();
          
          // 새 목표 ID로 이미지 로드
          if (newGoalId) {
            loadLocalImage(newGoalId);
          }
        } else {
          // 정상적인 ID를 받지 못한 경우 그냥 데이터 리로드
          await refetch();
        }
        
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
                const imageKey = `goalImage_${goalData.id}`;
                console.log("이미지 삭제 시도:", imageKey);
                await AsyncStorage.removeItem(imageKey);
                console.log("이미지가 AsyncStorage에서 삭제되었습니다");
                
                // 메모리 캐시에서도 삭제
                setImageCache(prev => {
                  const newCache = { ...prev };
                  if (goalData?.id && newCache[goalData.id]) {
                    delete newCache[goalData.id];
                    console.log("이미지가 메모리 캐시에서 삭제되었습니다");
                  }
                  return newCache;
                });
                
                // 로컬 이미지 상태 초기화
                setLocalImage(null);
              }

              // 목표 삭제 API 호출
              await deleteGoalMutation.mutateAsync();
              Alert.alert("삭제 완료", "목표가 성공적으로 삭제되었습니다.");
              
              // 데이터 새로고침
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
      <Header 
        title="목표 관리" 
        onBack={() => navigation.goBack()} 
      />

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
                <Pressable 
                  style={styles.imageContainer}
                  onPress={handleImageUpload}
                  disabled={isImageLoading}
                >
                  {isImageLoading ? (
                    <View style={styles.emptyImageContainer}>
                      <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                      />
                      <Text style={[styles.emptyImageText, {marginTop: 10}]}>
                        이미지 처리 중...
                      </Text>
                    </View>
                  ) : localImage ? (
                    <>
                      <View style={styles.goalImage}>
                        <Image
                          source={{ uri: localImage }}
                          style={{width: '100%', height: '100%'}}
                          resizeMode="cover"
                          onLoad={() => console.log("이미지 렌더링 성공")}
                          onError={(error) => {
                            console.error("이미지 렌더링 실패:", error.nativeEvent.error);
                            // 실패 시 기본 UI로 대체
                            setLocalImage(null);
                          }}
                        />
                      </View>
                      <Text style={styles.debugText}>
                        {localImage.substring(0, 20)}...
                      </Text>
                    </>
                  ) : (
                    <View style={styles.emptyImageContainer}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={40}
                        color={theme.colors.textLight}
                      />
                      <Text style={styles.emptyImageText}>
                        클릭하여 목표 사진 추가하기
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
                </Pressable>

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
  debugText: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    fontSize: 10,
    padding: 2,
    borderRadius: 2,
    opacity: 0.7,
  },
});
