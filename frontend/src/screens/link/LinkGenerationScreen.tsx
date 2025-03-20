import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";

type RootStackParamList = {
  Main: undefined;
  LinkGeneration: undefined;
};

type LinkGenerationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LinkGeneration"
>;

interface LinkGenerationScreenProps {
  navigation: LinkGenerationScreenNavigationProp;
}

export default function LinkGenerationScreen({
  navigation,
}: LinkGenerationScreenProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateLink = () => {
    setIsGenerating(true);

    // Simulate API call to generate invite link
    setTimeout(() => {
      const uniqueCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      const link = `https://loveledger.app/invite/${uniqueCode}`;
      setGeneratedLink(link);
      setIsGenerating(false);
    }, 1500);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `러브레저에서 부부 연동 초대장이 도착했어요! 아래 링크를 통해 연동해주세요:\n${generatedLink}`,
      });
    } catch (error) {
      Alert.alert("Error", "공유 중 오류가 발생했습니다.");
    }
  };

  const handleCopyLink = () => {
    // In a real app, you'd use Clipboard.setString(generatedLink)
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

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
        <Text style={styles.headerTitle}>부부 연동</Text>
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

        <Text style={styles.title}>부부 연동하기</Text>
        <Text style={styles.description}>
          부부 연동을 통해 배우자와 함께 재정을 관리하고 추억을 공유하세요. 아래
          버튼을 눌러 초대 링크를 생성한 후, 배우자에게 공유해 주세요.
        </Text>

        {!generatedLink ? (
          <Pressable
            style={styles.generateButton}
            onPress={handleGenerateLink}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="link-variant"
                  size={24}
                  color={theme.colors.white}
                />
                <Text style={styles.generateButtonText}>초대 링크 생성</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.linkContainer}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>
                {generatedLink}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton} onPress={handleCopyLink}>
                <MaterialCommunityIcons
                  name={copySuccess ? "check" : "content-copy"}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.actionButtonText}>
                  {copySuccess ? "복사됨" : "복사"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShareLink}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color={theme.colors.white}
                />
                <Text style={styles.shareButtonText}>공유</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>안내사항</Text>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            생성된 링크는 24시간 동안만 유효합니다.
          </Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>한번에 하나의 연동만 가능합니다.</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            연동 후에는 상대방의 동의 없이 해제할 수 없습니다.
          </Text>
        </View>
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
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.xl,
    alignItems: "center",
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
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  generateButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 18,
    marginLeft: theme.spacing.md,
  },
  linkContainer: {
    width: "100%",
  },
  linkBox: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  linkText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  shareButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  infoSection: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    marginTop: "auto",
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});
