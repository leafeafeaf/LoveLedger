import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { HeaderProps } from "../../types";

export default function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
  leftElement,
  centerElement,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.leftContent}>
          {showBack && (
            <Pressable style={styles.headerButton} onPress={onBack}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={theme.colors.text}
              />
            </Pressable>
          )}
          {leftElement}
        </View>
        <View style={styles.centerContent}>
          {centerElement || <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.rightContent}>{rightElement}</View>
      </View>
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  centerContent: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  rightContent: {
    zIndex: 2,
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
