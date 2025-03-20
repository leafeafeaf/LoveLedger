import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "../../utils/theme";

interface PartnerSwitchProps {
  activeView: string;
  onViewChange: (view: string) => void;
  partnerName?: string;
}

const PartnerSwitch: React.FC<PartnerSwitchProps> = ({
  activeView,
  onViewChange,
  partnerName = "김민수",
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tabButton, activeView === "you" && styles.activeTab]}
        onPress={() => onViewChange("you")}
      >
        <Text
          style={[styles.tabText, activeView === "you" && styles.activeTabText]}
        >
          나
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tabButton, activeView === "partner" && styles.activeTab]}
        onPress={() => onViewChange("partner")}
      >
        <Text
          style={[
            styles.tabText,
            activeView === "partner" && styles.activeTabText,
          ]}
        >
          {partnerName}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabButton,
          activeView === "combined" && styles.activeTab,
        ]}
        onPress={() => onViewChange("combined")}
      >
        <Text
          style={[
            styles.tabText,
            activeView === "combined" && styles.activeTabText,
          ]}
        >
          함께
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
});

export default PartnerSwitch;
