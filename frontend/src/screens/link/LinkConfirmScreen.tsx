import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";
import { ProfileStackParamList } from "../../types";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useJoinCouple } from "../../hooks/couple/useJoinCouple";

type LinkConfirmScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkConfirm"
>;

const LinkConfirmScreen: FC<LinkConfirmScreenProps> = ({
  navigation,
  route,
}) => {
  const { linkCode: initialLinkCode } = route.params;
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const userId = userInfo?.id || "";
  const [linkCode, setLinkCode] = useState(initialLinkCode);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: joinCouple, isPending: isJoining } = useJoinCouple();



  // 유효성 검사 완료 후 처리

  const handleJoinCouple = () => {
    if (!linkCode.trim()) {
      Alert.alert("알림", "초대 링크를 입력해주세요.");
      return;
    }

    console.log("연동 시도:", { linkCode });

    joinCouple(
      linkCode,
      {
        onSuccess: () => {
          Alert.alert("성공", "부부 연동이 완료되었습니다.");
          navigation.goBack();
        },
        onError: (error: any) => {
          console.error("연동 실패", error);
          Alert.alert("실패", "연동에 실패했습니다. 올바른 링크인지 확인해주세요.");
        },
      }
    );
  };

  if (isLoading || isJoining) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            {isJoining ? "부부 연동 처리 중..." : "초대 링크 확인 중..."}
          </Text>
        </View>
      </View>
    );
  }

  // 초기 링크 입력 화면 (딥링크가 없는 경우)
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
        <Text style={styles.headerTitle}>초대 링크 등록</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="link-variant-plus"
            size={60}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>초대 링크를 입력하세요</Text>
        <Text style={styles.description}>
          배우자로부터 받은 초대 링크를 입력하여 부부 연동을 진행하세요.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={linkCode}
            onChangeText={setLinkCode}
            placeholder="초대 링크를 입력하세요"
            placeholderTextColor={theme.colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={styles.validateButton}
            onPress={handleJoinCouple}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.validateButtonText}>확인</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
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
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    marginBottom: theme.spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  validateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: theme.spacing.sm,
    ...theme.shadows.small,
  },
  validateButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    minWidth: "45%",
    ...theme.shadows.small,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
});

export default LinkConfirmScreen;
