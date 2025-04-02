import React, { FC } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";
import { ProfileStackParamList } from "../../types";

type LinkErrorScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkError"
>;

type ErrorContent = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
};

const LinkErrorScreen: FC<LinkErrorScreenProps> = ({ navigation, route }) => {
  const { errorType } = route.params;

  const getErrorContent = (): ErrorContent => {
    switch (errorType) {
      case "expired":
        return {
          icon: "clock-alert",
          title: "만료된 초대 링크",
          message: "이 초대 링크는 만료되었습니다. 새로운 링크를 요청해주세요.",
        };
      case "invalid":
        return {
          icon: "link-variant-off",
          title: "유효하지 않은 링크",
          message: "올바르지 않은 초대 링크입니다. 다시 확인해주세요.",
        };
      case "already_linked":
        return {
          icon: "account-multiple-check",
          title: "이미 연동된 계정",
          message: "이미 다른 계정과 연동되어 있습니다.",
        };
      default:
        return {
          icon: "alert-circle",
          title: "오류가 발생했습니다",
          message: "잠시 후 다시 시도해주세요.",
        };
    }
  };

  const { icon, title, message } = getErrorContent();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon}
            size={80}
            color={theme.colors.error}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <Pressable style={styles.button} onPress={handleGoBack}>
          <Text style={styles.buttonText}>돌아가기</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LinkErrorScreen;
