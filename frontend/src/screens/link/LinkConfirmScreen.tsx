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
import { useValidateInvite } from "../../hooks/couple/useValidateInvite";
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
  const [isValidated, setIsValidated] = useState(false);

  const {
    data,
    error,
    isLoading: isValidationLoading,
    refetch: validateLink,
  } = useValidateInvite(linkCode, userId);

  const { mutate: joinCouple, isPending: isJoining } = useJoinCouple();


  // 유효성 검사 완료 후 처리
  useEffect(() => {
    if (!isValidationLoading && (data || error)) {
      setIsLoading(false);

      console.log("[LinkConfirmScreen] 링크 검증 결과:", {
        data: data ? JSON.stringify(data) : null,
        error: error ? JSON.stringify(error) : null,
        isError: !!error,
      });

      if (error) {
        // 에러 타입에 따른 Alert 처리
        console.log("[LinkConfirmScreen] 링크 검증 에러:", {
          status: error.status,
          message: error.message,
          code: error.code,
        });

        if (error.status === "410") {
          Alert.alert(
            "만료된 초대 링크",
            "이 초대 링크는 만료되었습니다. 새로운 링크를 요청해주세요.",
            [{ text: "확인", onPress: () => navigation.goBack() }]
          );
        } else if (error.status === "400") {
          Alert.alert(
            "이미 연동된 계정",
            "이미 다른 계정과 연동되어 있습니다.",
            [{ text: "확인", onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert("오류가 발생했습니다", "잠시 후 다시 시도해주세요.", [
            { text: "확인", onPress: () => navigation.goBack() },
          ]);
        }
      } else if (data) {
        try {
          // 중첩된 JSON 문자열 파싱
          const parsedData = typeof data === "string" ? JSON.parse(data) : data;
          const partnerData = parsedData.data?.data?.data || parsedData.data;

          console.log("[LinkConfirmScreen] 파싱된 파트너 정보:", partnerData);

          if (partnerData) {
            setIsValidated(true);
            // 유효성 검사 성공 시 바로 연동 시작
            console.log("[LinkConfirmScreen] 유효성 검사 성공 - 연동 시작");
            joinCouple(linkCode, {
              onSuccess: () => {
                console.log("[LinkConfirmScreen] 연동 성공");
                Alert.alert("연동 완료", "부부 연동이 완료되었습니다.", [
                  { text: "확인", onPress: () => navigation.goBack() },
                ]);
              },
              onError: (error) => {
                console.error("[LinkConfirmScreen] 연동 실패:", {
                  status: error.status,
                  message: error.message,
                  data: error.data,
                  timestamp: error.timestamp,
                });
                Alert.alert(
                  "오류",
                  error.message
                );
              },
            });
          }
        } catch (parseError) {
          console.error("[LinkConfirmScreen] 데이터 파싱 에러:", parseError);
          Alert.alert("오류가 발생했습니다", "잠시 후 다시 시도해주세요.", [
            { text: "확인", onPress: () => navigation.goBack() },
          ]);
        }
      }
    }
  }, [isValidationLoading, data, error, navigation, joinCouple]);

  const handleValidateLink = async () => {
    if (!linkCode.trim()) {
      Alert.alert("알림", "초대 링크를 입력해주세요.");
      return;
    }
    console.log(
      "[LinkConfirmScreen] 확인 버튼 클릭 - 유효성 검사 시작:",
      linkCode
    );
    console.log(
      "[LinkConfirmScreen] API 요청 URL:",
      `/invite/validate/${linkCode}`
    );
    console.log("[LinkConfirmScreen] API 요청 파라미터:", {
      userId: userId,
      linkCode: linkCode,
    });

    setIsLoading(true);
    setIsValidated(false);

    try {
      await validateLink();
    } catch (err) {
      console.error("[LinkConfirmScreen] 검증 요청 실패:", err);
    }
  };

  if (isLoading || isValidationLoading || isJoining) {
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
            onPress={handleValidateLink}
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
