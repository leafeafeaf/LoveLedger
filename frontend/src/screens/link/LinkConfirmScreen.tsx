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
import { ProfileStackParamList, PartnerInfo } from "../../types";
import { useValidateInviteLink, useJoinCouple } from "../../hooks/useInvite";
import { useCoupleAuth } from "../../hooks/useCoupleAuth";

type LinkConfirmScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkConfirm"
>;

const LinkConfirmScreen: FC<LinkConfirmScreenProps> = ({
  navigation,
  route,
}) => {
  const { linkCode: initialLinkCode } = route.params;
  const { user } = useCoupleAuth();
  const [linkCode, setLinkCode] = useState(initialLinkCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [errorType, setErrorType] = useState<
    "expired" | "invalid" | "already_linked" | "generic" | null
  >(null);

  const {
    data,
    error,
    isLoading: isValidationLoading,
    refetch: validateLink,
  } = useValidateInviteLink(linkCode, user?.id || "");

  const { mutate: joinCouple, isPending: isJoining } = useJoinCouple();

  useEffect(() => {
    if (initialLinkCode) {
      validateLink();
    }
  }, [initialLinkCode]);

  useEffect(() => {
    if (!isValidationLoading) {
      setIsLoading(false);
      if (error) {
        // 에러 타입에 따른 처리
        if (error.status === "404") {
          setErrorType("invalid");
        } else if (error.status === "410") {
          setErrorType("expired");
        } else if (error.status === "409") {
          setErrorType("already_linked");
        } else {
          setErrorType("generic");
        }
        navigation.replace("LinkError", { errorType: errorType || "generic" });
      } else if (data) {
        setIsValid(data.data.isValid);
        // 파트너 정보 설정 (API 응답에 포함된 경우)
        if (data.data.partnerInfo) {
          setPartnerInfo(data.data.partnerInfo);
        }
      }
    }
  }, [isValidationLoading, data, error, navigation, errorType]);

  const handleValidateLink = async () => {
    if (!linkCode.trim()) {
      Alert.alert("알림", "초대 링크를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    await validateLink();
  };

  const handleConfirm = () => {
    Alert.alert("부부 연동", "정말로 부부 연동을 진행하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "연동하기",
        onPress: () => {
          joinCouple(linkCode, {
            onSuccess: () => {
              navigation.replace("LinkSuccess", {});
            },
            onError: (error) => {
              Alert.alert(
                "오류",
                "부부 연동에 실패했습니다. 다시 시도해주세요."
              );
            },
          });
        },
      },
    ]);
  };

  const handleReject = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>초대 링크 확인 중...</Text>
        </View>
      </View>
    );
  }

  if (!initialLinkCode) {
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
  }

  if (!isValid) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={60}
            color={theme.colors.error}
          />
          <Text style={styles.errorTitle}>유효하지 않은 초대 링크</Text>
          <Text style={styles.errorText}>
            이 초대 링크는 만료되었거나 유효하지 않습니다.
          </Text>
          <Pressable style={styles.button} onPress={handleReject}>
            <Text style={styles.buttonText}>돌아가기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>부부 연동 확인</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="heart-multiple"
            size={60}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>부부 연동을 확인해주세요</Text>
        <Text style={styles.description}>
          {partnerInfo?.name || "상대방"}님과 부부 연동을 진행하시겠습니까?
        </Text>

        {partnerInfo && (
          <View style={styles.partnerInfo}>
            {partnerInfo.avatar ? (
              <Image
                source={{ uri: partnerInfo.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={theme.colors.white}
                />
              </View>
            )}
            <Text style={styles.partnerName}>{partnerInfo.name}</Text>
            <Text style={styles.partnerJoinDate}>
              가입일: {new Date(partnerInfo.joinDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.rejectButton]}
            onPress={handleReject}
            disabled={isJoining}
          >
            <Text style={styles.rejectButtonText}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.confirmButtonText}>연동하기</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
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
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  validateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: "center",
    ...theme.shadows.small,
  },
  validateButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  partnerInfo: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  partnerJoinDate: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    ...theme.shadows.small,
  },
  rejectButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  rejectButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
});

export default LinkConfirmScreen;
