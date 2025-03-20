import React from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../src/utils/theme";
import { PartnerSwitchProps } from "../src/types";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function PartnerSwitch({
  activeView,
  onViewChange,
}: PartnerSwitchProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeView === "you" && styles.activeTab]}
        onPress={() => onViewChange("you")}
      >
        <MaterialCommunityIcons
          name="account-heart"
          size={16}
          color={
            activeView === "you" ? theme.colors.white : theme.colors.primary
          }
        />
        <Text
          style={[styles.tabText, activeView === "you" && styles.activeTabText]}
        >
          You
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeView === "partner" && styles.activeTab]}
        onPress={() => onViewChange("partner")}
      >
        <MaterialCommunityIcons
          name="account-heart-outline"
          size={16}
          color={
            activeView === "partner" ? theme.colors.white : theme.colors.primary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeView === "partner" && styles.activeTabText,
          ]}
        >
          Partner
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeView === "combined" && styles.activeTab]}
        onPress={() => onViewChange("combined")}
      >
        <MaterialCommunityIcons
          name="account-multiple"
          size={16}
          color={
            activeView === "combined"
              ? theme.colors.white
              : theme.colors.primary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeView === "combined" && styles.activeTabText,
          ]}
        >
          Combined
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    ...theme.shadows.small,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  activeTabText: {
    color: theme.colors.white,
  },
});
