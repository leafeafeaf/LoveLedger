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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { ProfileScreenProps } from "../../types";

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
  age: string;
  motto: string;
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

  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    motto: "",
    photo: null,
  });

  // Simulate fetching data
  useEffect(() => {
    if (partner === "partner1") {
      setFormData({
        name: "철수",
        age: "29",
        motto: "매일 행복하게",
        photo: null,
      });
    } else {
      setFormData({
        name: "영희",
        age: "27",
        motto: "우리의 여행 기록하기",
        photo: null,
      });
    }
  }, [partner]);

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    // Would typically save to database here

    // Show success message and navigate back
    Alert.alert("완료", "프로필이 업데이트되었습니다.", [
      { text: "확인", onPress: () => navigation.goBack() },
    ]);
  };

  const handlePhotoSelect = () => {
    // In a real implementation, this would use the image picker
    const mockPhotoUrl = `https://api.a0.dev/assets/image?text=profile%20photo%20of%20${encodeURIComponent(
      formData.name
    )}%20portrait&seed=${Math.random()}`;
    setFormData((prev) => ({ ...prev, photo: mockPhotoUrl }));
  };

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
            <Text style={styles.inputLabel}>나이</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, age: text }))
              }
              placeholder="나이를 입력하세요"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>모토</Text>
            <TextInput
              style={styles.input}
              value={formData.motto}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, motto: text }))
              }
              placeholder="자신의 모토를 입력하세요"
              placeholderTextColor={theme.colors.textLight}
            />
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
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
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
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileEditScreen;
