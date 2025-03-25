import React, { FC } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { theme } from "../../utils/theme";
import { RootStackScreenProps } from "../../types";

type ErrorType = "expired" | "invalid" | "already_linked" | "generic";

type RootStackParamList = {
  Main: undefined;
  LinkError: {
    errorType?: ErrorType;
  };
};

type LinkErrorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LinkError"
>;

type LinkErrorScreenRouteProp = RouteProp<RootStackParamList, "LinkError">;

interface LinkErrorScreenProps {
  navigation: LinkErrorScreenNavigationProp;
  route: LinkErrorScreenRouteProp;
}

type ErrorDetails = {
  title: string;
  message: string;
  icon:
    | "clock-alert"
    | "link-variant-off"
    | "account-multiple"
    | "alert-circle";
};

const LinkErrorScreen: FC<RootStackScreenProps<"LinkError">> = ({
  navigation,
  route,
}) => {
  const { errorType = "generic" } = route.params || {};

  const getErrorDetails = (): ErrorDetails => {
    switch (errorType) {
      case "expired":
        return {
          title: "만료된 링크",
          message:
            "이 초대 링크는 만료되었습니다. 배우자에게 새로운 링크를 요청해 주세요.",
          icon: "clock-alert",
        };
      case "invalid":
        return {
          title: "유효하지 않은 링크",
          message:
            "이 초대 링크는 유효하지 않습니다. 올바른 링크인지 확인해 주세요.",
          icon: "link-variant-off",
        };
      case "already_linked":
        return {
          title: "이미 연동됨",
          message:
            "귀하는 이미 다른 사용자와 연동되어 있습니다. 관리자에게 문의하여 기존 연동을 해제한 후 다시 시도해 주세요.",
          icon: "account-multiple",
        };
      default:
        return {
          title: "오류 발생",
          message:
            "연동 과정에서 오류가 발생했습니다. 다시 시도하거나 관리자에게 문의해 주세요.",
          icon: "alert-circle",
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>연동 오류</Text>
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.errorIconContainer}>
          <MaterialCommunityIcons
            name={errorDetails.icon}
            size={80}
            color={theme.colors.error}
          />
        </View>

        <Text style={styles.errorTitle}>{errorDetails.title}</Text>
        <Text style={styles.errorMessage}>{errorDetails.message}</Text>

        <View style={styles.troubleshootContainer}>
          <Text style={styles.troubleshootTitle}>해결 방법</Text>

          <View style={styles.troubleshootItem}>
            <MaterialCommunityIcons
              name="numeric-1-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.troubleshootText}>
              배우자에게 새로운 초대 링크를 요청해 보세요.
            </Text>
          </View>

          <View style={styles.troubleshootItem}>
            <MaterialCommunityIcons
              name="numeric-2-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.troubleshootText}>
              앱을 최신 버전으로 업데이트했는지 확인해 주세요.
            </Text>
          </View>

          <View style={styles.troubleshootItem}>
            <MaterialCommunityIcons
              name="numeric-3-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.troubleshootText}>
              문제가 지속되면 고객센터로 문의해 주세요.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.supportButton}
          onPress={() => {
            // In a real app, navigate to support screen or open email/chat
            alert("고객센터로 연결합니다...");
          }}
        >
          <MaterialCommunityIcons
            name="headset"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.supportButtonText}>고객센터 문의</Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => navigation.navigate("Main", { screen: "Library" })}
        >
          <Text style={styles.homeButtonText}>홈으로 이동</Text>
        </Pressable>
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
  },
  contentContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${theme.colors.error}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  troubleshootContainer: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  troubleshootTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  troubleshootItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  troubleshootText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  supportButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  homeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  homeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LinkErrorScreen;
