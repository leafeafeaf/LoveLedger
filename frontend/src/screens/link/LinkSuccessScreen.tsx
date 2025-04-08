import React, { FC } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";
import { ProfileStackParamList } from "../../types";

type LinkSuccessScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "LinkSuccess"
>;

const LinkSuccessScreen: FC<LinkSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { partnerName, partnerEmail } = route.params;

  const handleGoToMain = () => {
    navigation.navigate("ProfileMain");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>부부 연동 완료!</Text>
        <Text style={styles.description}>
          {partnerName}님과 부부 연동이 완료되었습니다.
        </Text>

        <View style={styles.partnerInfo}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons
              name="account"
              size={40}
              color={theme.colors.white}
            />
          </View>
          <View style={styles.partnerDetails}>
            <Text style={styles.partnerName}>{partnerName}</Text>
            <Text style={styles.partnerEmail}>{partnerEmail}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={handleGoToMain}>
          <Text style={styles.buttonText}>메인으로 돌아가기</Text>
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
  description: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: 30,
  },
  partnerInfo: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  partnerDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  partnerEmail: {
    fontSize: 14,
    color: theme.colors.textLight,
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

export default LinkSuccessScreen;
