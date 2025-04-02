import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchInviteLink } from "../../store/inviteSlice";

type LinkGenerationScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkGeneration"
>;

export default function LinkGenerationScreen({
  navigation,
}: LinkGenerationScreenProps) {
  console.log("[LinkGenerationScreen] 컴포넌트 렌더링 시작");
  const dispatch = useAppDispatch();
  const [isCopying, setIsCopying] = useState(false);
  const { link, isLoading, error } = useAppSelector((state) => {
    console.log("[LinkGenerationScreen] Redux 상태:", {
      hasLink: !!state.invite.link,
      isLoading: state.invite.isLoading,
      hasError: !!state.invite.error,
      errorMessage: state.invite.error,
    });
    return state.invite;
  });

  useEffect(() => {
    console.log("[LinkGenerationScreen] 컴포넌트 마운트");
    dispatch(fetchInviteLink());
  }, [dispatch]);

  useEffect(() => {
    console.log("[LinkGenerationScreen] isLoading 상태 변경:", isLoading);
  }, [isLoading]);

  const handleCopyLink = async () => {
    if (!link) return;

    try {
      setIsCopying(true);
      await Clipboard.setString(link);
      Alert.alert("링크 복사 완료", "초대 링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      Alert.alert("오류", "링크 복사에 실패했습니다.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareLink = async () => {
    if (!link) return;

    try {
      await Share.share({
        message: "Love Ledger 초대 링크입니다.\n" + link,
        title: "Love Ledger 초대",
      });
    } catch (err) {
      Alert.alert("오류", "링크 공유에 실패했습니다.");
    }
  };

  const handleRegenerateLink = () => {
    Alert.alert(
      "링크 재생성",
      "기존 링크는 더 이상 사용할 수 없습니다. 새로운 링크를 생성하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "재생성",
          onPress: () => dispatch(fetchInviteLink()),
        },
      ]
    );
  };

  if (error) {
    const errorData = error as any;
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color={theme.colors.error}
        />
        <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
        <Text style={styles.errorMessage}>{errorData.message}</Text>
        {errorData.data?.action && (
          <Text style={styles.errorAction}>{errorData.data.action}</Text>
        )}
        <Pressable
          style={styles.retryButton}
          onPress={() => dispatch(fetchInviteLink())}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

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

      <View style={styles.content}>
        <View style={styles.linkCard}>
          <Text style={styles.linkTitle}>초대 링크</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>
              {link}
            </Text>
            <Pressable
              style={styles.copyButton}
              onPress={handleCopyLink}
              disabled={isCopying}
            >
              <MaterialCommunityIcons
                name={isCopying ? "check" : "content-copy"}
                size={24}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
          <Pressable style={styles.shareButton} onPress={handleShareLink}>
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color={theme.colors.white}
            />
            <Text style={styles.shareButtonText}>링크 공유하기</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>링크 사용 안내</Text>
          <Text style={styles.infoText}>• 생성된 링크는 7일간 유효합니다.</Text>
          <Text style={styles.infoText}>
            • 링크는 한 번만 사용할 수 있습니다.
          </Text>
          <Text style={styles.infoText}>
            • 링크가 만료되거나 사용된 경우, 새로운 링크를 생성해주세요.
          </Text>
        </View>

        <Pressable
          style={styles.regenerateButton}
          onPress={handleRegenerateLink}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.regenerateButtonText}>새로운 링크 생성</Text>
        </Pressable>
      </View>
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
  },
  shareButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  infoTitle: {
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
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  regenerateButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
