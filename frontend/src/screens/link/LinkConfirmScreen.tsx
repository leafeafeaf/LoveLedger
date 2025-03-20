import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { theme } from "../../utils/theme";
import { RootStackScreenProps, PartnerInfo } from "../../types";

type RootStackParamList = {
  Main: undefined;
  LinkConfirm: {
    linkCode: string;
  };
  LinkSuccess: undefined;
  LinkError: {
    errorType: "expired" | "invalid" | "already_linked" | "generic";
  };
};

type LinkConfirmScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LinkConfirm"
>;

type LinkConfirmScreenRouteProp = RouteProp<RootStackParamList, "LinkConfirm">;

const LinkConfirmScreen: FC<RootStackScreenProps<"LinkConfirm">> = ({
  navigation,
  route,
}) => {
  const { linkCode } = route.params || { linkCode: "DEMO123" };
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [errorType, setErrorType] = useState<
    "expired" | "invalid" | "already_linked" | "generic" | null
  >(null);

  useEffect(() => {
    // Simulate API call to validate the invite link
    setTimeout(() => {
      // For demo purposes, we'll simulate different scenarios
      const scenarios = ["valid", "expired", "error"];
      const scenario = scenarios[0]; // Change index to test different scenarios

      if (scenario === "valid") {
        setIsValid(true);
        setPartnerInfo({
          name: "김철수",
          avatar: null,
          joinDate: "2025-01-15",
          message: "함께 우리의 여정을 시작해요!",
        });
      } else if (scenario === "expired") {
        setIsValid(false);
        setErrorType("expired");
      } else {
        setIsValid(false);
        setErrorType("generic");
      }

      setIsLoading(false);
    }, 2000);
  }, [linkCode]);

  const handleConfirm = () => {
    setIsLoading(true);

    // Simulate API call to confirm the link
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("LinkSuccess");
    }, 1500);
  };

  const handleReject = () => {
    Alert.alert("연동 거부", "정말로 이 연동 요청을 거부하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "거부",
        onPress: () => navigation.navigate("Main", { screen: "Library" }),
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>연동 정보를 확인 중입니다...</Text>
      </View>
    );
  }

  if (!isValid && errorType) {
    navigation.replace("LinkError", { errorType });
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>연동 확인</Text>
        <Pressable
          style={styles.closeButton}
          onPress={() => navigation.navigate("Main", { screen: "Library" })}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <MaterialCommunityIcons
          name="heart-multiple"
          size={60}
          color={theme.colors.primary}
          style={styles.icon}
        />

        <Text style={styles.title}>부부 연동 요청</Text>
        <Text style={styles.description}>
          아래 사용자가 귀하와 부부 연동을 요청했습니다. 연동을 수락하시면
          서로의 재정 정보와 기록을 공유하게 됩니다.
        </Text>

        {partnerInfo && (
          <View style={styles.partnerCard}>
            {partnerInfo.avatar ? (
              <Image
                source={{ uri: partnerInfo.avatar }}
                style={styles.partnerAvatar}
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
            <Text style={styles.partnerDate}>
              가입일: {partnerInfo.joinDate}
            </Text>
            {partnerInfo.message && (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>"{partnerInfo.message}"</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.warningText}>
            연동은 양측의 동의가 있어야만 가능하며, 한 번 연동하면 관리자에게
            문의하지 않는 한 해제할 수 없습니다.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.rejectButton} onPress={handleReject}>
          <Text style={styles.rejectButtonText}>거부</Text>
        </Pressable>

        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>수락</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing.md,
    top: theme.spacing.xl * 1.5,
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  icon: {
    marginBottom: theme.spacing.md,
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
  partnerCard: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  partnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  partnerDate: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  messageBox: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: "100%",
  },
  messageText: {
    fontSize: 16,
    fontStyle: "italic",
    color: theme.colors.text,
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: `${theme.colors.primary}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  rejectButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginRight: theme.spacing.md,
  },
  rejectButtonText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LinkConfirmScreen;
