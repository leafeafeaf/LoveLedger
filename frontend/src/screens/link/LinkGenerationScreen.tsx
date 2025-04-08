import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Share,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList, RootStackParamList } from "../../types";
import {
  useStoredInviteLink,
  useGenerateInvite,
} from "../../hooks/couple/useInvite";
import { useCurrentInvite } from "../../hooks/couple/useCurrentInvite";
import * as Clipboard from "expo-clipboard";
import { InviteConflictResponse } from "../../types";

type LinkGenerationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "LinkGeneration"
>;

// 확장된 링크 데이터 인터페이스
interface InviteLinkData {
  link: string;
  inviteCode?: string;
  createdAt?: string;
  expiresAt?: string;
  remainingHours?: number;
}

// 응답 데이터 통합 인터페이스
interface CombinedLinkResponse {
  status: string;
  message: string;
  data: InviteLinkData;
  timestamp?: string;
}

export default function LinkGenerationScreen({
  navigation,
}: LinkGenerationScreenProps) {
  const [isCopying, setIsCopying] = useState(false);
  const {
    data: storedLinkData,
    isLoading: isStoredLinkLoading,
    error: storedLinkError,
  } = useStoredInviteLink();

  const {
    data: currentLinkApiData,
    isLoading: isCurrentLinkLoading,
    error: currentLinkError,
  } = useCurrentInvite();

  const generateInviteMutation = useGenerateInvite();

  // API 응답 데이터와 로컬 저장 데이터 통합
  const data: CombinedLinkResponse | null = currentLinkApiData?.success
    ? {
        status: String(currentLinkApiData.status),
        message: "초대 링크가 조회되었습니다.",
        data: {
          link: currentLinkApiData.data?.link || "",
          inviteCode: currentLinkApiData.data?.inviteCode,
          createdAt: currentLinkApiData.data?.createdAt,
          expiresAt: currentLinkApiData.data?.expiresAt,
          remainingHours: currentLinkApiData.data?.remainingHours,
        },
        timestamp: currentLinkApiData.timestamp,
      }
    : storedLinkData;

  const isLoading = isCurrentLinkLoading || isStoredLinkLoading;
  const error = currentLinkError || storedLinkError;

  useEffect(() => {
    if (error) {
      const errorData = error as InviteConflictResponse;
      Alert.alert(
        "오류가 발생했습니다",
        errorData.message || "잠시 후 다시 시도해주세요.",
        [{ text: "확인", onPress: () =>  console.log("서버 오류 발생") }]
      );
    } else if (data?.status === "400") {
      Alert.alert("이미 연인과 연결된 상태입니다", data.message, [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    }
  }, [error, data, navigation]);

  const handleCopyCode = async () => {
    if (!data?.data?.inviteCode) return;

    try {
      setIsCopying(true);
      await Clipboard.setStringAsync(data.data.inviteCode);
      Alert.alert("코드 복사 완료", "초대 코드가 클립보드에 복사되었습니다.");
    } catch (err) {
      Alert.alert("오류", "코드 복사에 실패했습니다.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareCode = async () => {
    if (!data?.data?.inviteCode) return;

    try {
      await Share.share({
        message: `Love Ledger 초대 코드: ${data.data.inviteCode}`,
        title: "Love Ledger 초대",
      });
    } catch (err) {
      Alert.alert("오류", "코드 공유에 실패했습니다.");
    }
  };

  const handleGenerateLink = async () => {
    try {
      await generateInviteMutation.mutateAsync();
    } catch (err: any) {
      Alert.alert("오류", err.message || "링크 생성에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={styles.headerTitle}>초대 링크 생성</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {isLoading || generateInviteMutation.isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              초대 링크를 생성하고 있습니다...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.linkCard}>
              <Text style={styles.linkTitle}>
                {data?.message === "이미 활성화된 초대 링크가 있습니다."
                  ? "기존 초대 코드 안내"
                  : "초대 코드"}
              </Text>
              {data?.data?.inviteCode ? (
                <>
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText} numberOfLines={1}>
                      {data.data.inviteCode}
                    </Text>
                    <Pressable
                      style={styles.copyButton}
                      onPress={handleCopyCode}
                      disabled={isCopying}
                    >
                      <MaterialCommunityIcons
                        name={isCopying ? "check" : "content-copy"}
                        size={24}
                        color={theme.colors.primary}
                      />
                    </Pressable>
                  </View>

                  {data.data.createdAt && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>생성 일시:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(data.data.createdAt).toLocaleString("ko-KR")}
                      </Text>
                    </View>
                  )}

                  {data.data.expiresAt && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>만료 일시:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(data.data.expiresAt).toLocaleString("ko-KR")}
                      </Text>
                    </View>
                  )}

                  {typeof data.data.remainingHours === "number" && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>남은 시간:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          data.data.remainingHours < 12 && styles.warningText,
                        ]}
                      >
                        {data.data.remainingHours}시간
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={styles.shareButton}
                    onPress={handleShareCode}
                  >
                    <MaterialCommunityIcons
                      name="share-variant"
                      size={24}
                      color={theme.colors.white}
                    />
                    <Text style={styles.shareButtonText}>코드 공유하기</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.noLinkContainer}>
                  <Text style={styles.noLinkText}>
                    아직 생성된 초대 코드가 없습니다.
                  </Text>
                  <Text style={styles.noLinkSubtext}>
                    아래 버튼을 눌러 초대 코드를 생성해보세요.
                  </Text>
                </View>
              )}

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>초대 코드 사용 안내</Text>
                {data?.message === "이미 활성화된 초대 링크가 있습니다." ? (
                  <>
                    <Text style={styles.infoText}>
                      • 이미 생성된 초대 코드가 있습니다.
                    </Text>
                    <Text style={styles.infoText}>
                      • 관리자에게 문의하여 기존 코드 정보를 확인하세요.
                    </Text>
                    <Text style={styles.infoText}>
                      • 기존 코드가 만료되면 새로운 코드를 생성할 수 있습니다.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.infoText}>
                      • 생성된 코드는 7일간 유효합니다.
                    </Text>
                    <Text style={styles.infoText}>
                      • 코드는 한 번만 사용할 수 있습니다.
                    </Text>
                    <Text style={styles.infoText}>
                      • 코드가 만료되면 다시 초대 코드 생성 페이지를 방문하여 새
                      코드를 생성해주세요.
                    </Text>
                  </>
                )}
              </View>
            </View>

            <Pressable
              style={styles.generateButton}
              onPress={handleGenerateLink}
              disabled={generateInviteMutation.isPending}
            >
              <MaterialCommunityIcons
                name="link-plus"
                size={24}
                color={theme.colors.white}
              />
              <Text style={styles.generateButtonText}>
                {data?.data?.inviteCode
                  ? "새 초대 코드 생성하기"
                  : "초대 코드 생성하기"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

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
  backButton: {
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
  contentContainer: {
    padding: theme.spacing.md,
  },
  linkCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  copyButton: {
    padding: theme.spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  shareButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  generateButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  noLinkContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  noLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  noLinkSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  infoSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  errorAction: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  warningText: {
    color: theme.colors.error,
    fontWeight: "600",
  },
});
