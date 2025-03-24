import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerButtons}>
        {showBack && (
          <Pressable style={styles.headerButton} onPress={onBack}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={theme.colors.text}
            />
          </Pressable>
        )}
        {rightElement}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
});
