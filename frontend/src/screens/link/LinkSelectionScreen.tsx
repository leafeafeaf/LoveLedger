import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types";
import { useUnlinkCouple } from "../../hooks/couple/useUnlinkCouple";
import { useQueryClient } from "@tanstack/react-query";
import { useUserDetail } from "../../hooks/useUserApi";

type LinkSelectionScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkSelection"
>;

const LinkSelectionScreen: React.FC<LinkSelectionScreenProps> = ({
  navigation,
}) => {
  const { mutate: unlinkCouple, isPending: isUnlinking } = useUnlinkCouple();
  const queryClient = useQueryClient();
  const { data: userDetail } = useUserDetail();

  const handleGenerateLink = useCallback(() => {
    navigation.navigate("LinkGeneration", undefined);
  }, [navigation]);

  const handleRegisterLink = useCallback(() => {
    navigation.navigate("LinkConfirm", { linkCode: "" });
  }, [navigation]);

  const handleUnlinkCouple = () => {
    if (!userDetail?.coupleInfo?.coupleId) {
      Alert.alert("알림", "부부 연동된 상태가 아닙니다.", [{ text: "확인" }]);
      return;
    }

    Alert.alert(
      "부부 연동 해제",
      "정말로 부부 연동을 해제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "해제",
          style: "destructive",
          onPress: () => {
            if (!userDetail?.coupleInfo?.coupleId) {
              Alert.alert("오류", "커플 ID를 찾을 수 없습니다.", [
                { text: "확인" },
              ]);
              return;
            }

            unlinkCouple(userDetail.coupleInfo.coupleId, {
              onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ["userDetail"] });

                Alert.alert("연동 해제 완료", "부부 연동이 해제되었습니다.", [
                  {
                    text: "확인",
                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ]);
              },
              onError: (error) => {
                let errorMessage = "부부 연동 해제에 실패했습니다.";

                if (error.message.includes("coupleId")) {
                  errorMessage =
                    "커플 ID를 찾을 수 없습니다. 이미 연동이 해제되었을 수 있습니다.";
                } else if (error.message.includes("unauthorized")) {
                  errorMessage = "접근 권한이 없습니다. 다시 로그인해주세요.";
                } else if (error.message.includes("404")) {
                  errorMessage = "해당 커플 정보를 찾을 수 없습니다.";
                }

                Alert.alert("오류", errorMessage, [
                  {
                    text: "확인",
                    onPress: () => {
                      queryClient.invalidateQueries({
                        queryKey: ["userDetail"],
                      });
                    },
                  },
                ]);
              },
            });
          },
        },
      ]
    );
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

        <Text style={styles.title}>부부 연동 방법을 선택하세요</Text>
        <Text style={styles.description}>
          배우자와 함께 재정을 관리하고 추억을 공유하세요.
        </Text>

        <View style={styles.optionsContainer}>
          <Pressable
            style={[styles.optionCard, styles.generateCard]}
            onPress={handleGenerateLink}
          >
            <Text style={styles.optionTitle}>초대 링크 생성</Text>
            <Text style={styles.optionDescription}>
              배우자에게 초대 링크를 보내세요.
            </Text>
          </Pressable>

          <Pressable
            style={[styles.optionCard, styles.registerCard]}
            onPress={handleRegisterLink}
          >
            <Text style={styles.optionTitle}>초대 링크 등록</Text>
            <Text style={styles.optionDescription}>
              배우자로부터 받은 링크를 입력하세요.
            </Text>
          </Pressable>

          <Pressable
            style={[styles.optionCard, styles.unlinkCard]}
            onPress={handleUnlinkCouple}
            disabled={isUnlinking}
          >
            <Text style={styles.optionTitle}>부부 연동 해제</Text>
            <Text style={styles.optionDescription}>
              현재 연동된 부부 관계를 해제합니다.
            </Text>
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
  optionsContainer: {
    width: "100%",
    gap: theme.spacing.lg,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  generateCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  registerCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  unlinkCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  optionIconContainer: {
    width: 80,
    height: 30,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
});

export default LinkSelectionScreen;
