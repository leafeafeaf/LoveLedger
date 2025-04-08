import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { ProfileScreenProps, UserProfile } from "../../types";
import { useUserDetail, useUpdateUserProfile } from "../../hooks/useUserApi";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "../../components/common/DatePicker";

type RootStackParamList = {
  ProfileEdit: {
    partner: "partner1" | "partner2";
  };
  ProfileMain: undefined;
};

type ProfileEditScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileEdit"
>;
type ProfileEditScreenRouteProp = RouteProp<RootStackParamList, "ProfileEdit">;

type IconName = "arrow-left" | "close" | "account" | "camera";

interface FormData {
  name: string;
  gender: boolean;
  birthDay: string;
  isMarried: boolean;
  photo: string | null;
}

interface ProfileEditScreenProps {
  navigation: ProfileEditScreenNavigationProp;
  route: ProfileEditScreenRouteProp;
}

const ProfileEditScreen: FC<ProfileScreenProps<"ProfileEdit">> = ({
  navigation,
  route,
}) => {
  const { partner } = route.params || { partner: "partner1" };
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: true, // true는 남성
    birthDay: "",
    isMarried: false,
    photo: null,
  });

  // API 호출 훅 사용
  const { data: userDetail, isLoading: isLoadingUserDetail } = useUserDetail();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateUserProfile();

  // 사용자 정보 로드
  useEffect(() => {
    if (userDetail) {
      setFormData({
        name: userDetail.name || "",
        gender: userDetail.gender,
        birthDay: userDetail.birthDay || "",
        isMarried: userDetail.isMarried,
        photo: null, // API에서 프로필 사진을 제공하지 않아 null로 설정
      });
    }
  }, [userDetail]);

  const handleSave = () => {
    // 필드 검증
    if (!formData.name.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    if (!formData.birthDay) {
      Alert.alert("알림", "생년월일을 입력해주세요.");
      return;
    }

    // API 요청 데이터 생성
    const updateData = {
      name: formData.name,
      gender: formData.gender,
      birthDay: formData.birthDay,
      isMarried: formData.isMarried,
    };

    // 프로필 정보 업데이트 호출
    updateProfile(updateData, {
      onSuccess: (data) => {
        if (data.success) {
          Alert.alert("완료", "프로필이 업데이트되었습니다.", [
            { text: "확인", onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert("오류", "프로필 업데이트에 실패했습니다.");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          "프로필 업데이트 중 오류가 발생했습니다.";
        Alert.alert("오류", errorMessage);
      },
    });
  };

  const handlePhotoSelect = async () => {
    // 이미지 선택 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "권한 필요",
        "사진 선택을 위해 갤러리 접근 권한이 필요합니다."
      );
      return;
    }

    // 이미지 선택기 실행
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      // 선택한 이미지 URI 저장
      setFormData((prev) => ({ ...prev, photo: result.assets[0].uri }));

      // 여기서 이미지 업로드 API 호출을 추가할 수 있음
      // 이미지 업로드는 현재 API에서 지원하지 않음
    }
  };

  const handleDateSelect = (date: Date) => {
    // 날짜를 yyyy-MM-dd 형식으로 포맷하여 저장
    const formattedDate = date.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, birthDay: formattedDate }));
    setShowDatePicker(false);
  };

  if (isLoadingUserDetail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="close"
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {formData.photo ? (
              <Image
                source={{ uri: formData.photo }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={60}
                  color={theme.colors.textLight}
                />
              </View>
            )}
          </View>

          <Pressable
            style={styles.changePhotoButton}
            onPress={handlePhotoSelect}
          >
            <MaterialCommunityIcons
              name="camera"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.changePhotoText}>사진 변경</Text>
          </Pressable>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="이름을 입력하세요"
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>성별</Text>
            <View style={styles.radioGroup}>
              <Pressable
                style={[
                  styles.radioButton,
                  formData.gender && styles.radioButtonSelected,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, gender: true }))
                }
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    formData.gender && styles.radioButtonTextSelected,
                  ]}
                >
                  남성
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.radioButton,
                  !formData.gender && styles.radioButtonSelected,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, gender: false }))
                }
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    !formData.gender && styles.radioButtonTextSelected,
                  ]}
                >
                  여성
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>생년월일</Text>
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dateText,
                  !formData.birthDay && styles.placeholderText,
                ]}
              >
                {formData.birthDay || "생년월일을 선택하세요"}
              </Text>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={theme.colors.primary}
              />
            </Pressable>

            {/* 커스텀 DatePicker 사용 */}
            <DatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onSelectDate={handleDateSelect}
              selectedDate={
                formData.birthDay ? new Date(formData.birthDay) : undefined
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>결혼 여부</Text>
            <View style={styles.radioGroup}>
              <Pressable
                style={[
                  styles.radioButton,
                  formData.isMarried && styles.radioButtonSelected,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, isMarried: true }))
                }
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    formData.isMarried && styles.radioButtonTextSelected,
                  ]}
                >
                  기혼
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.radioButton,
                  !formData.isMarried && styles.radioButtonSelected,
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, isMarried: false }))
                }
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    !formData.isMarried && styles.radioButtonTextSelected,
                  ]}
                >
                  미혼
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.infoText}>
          이 정보는 파트너와 공유되며 앱 내에서만 표시됩니다.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isUpdating}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </Pressable>

        <Pressable
          style={[styles.saveButton, isUpdating && styles.disabledButton]}
          onPress={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
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
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
  },
  photoContainer: {
    marginBottom: theme.spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
  },
  changePhotoButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  changePhotoText: {
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    fontWeight: "600",
  },
  formSection: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
  },
  radioButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  radioButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  radioButtonTextSelected: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  infoText: {
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textLight,
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    marginLeft: theme.spacing.sm,
    justifyContent: "center",
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
});

export default ProfileEditScreen;
