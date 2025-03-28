import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "../../utils/theme";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { changeActiveView } from "../../store/partnerSlice";

const PartnerSwitch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeView } = useAppSelector((state) => state.partner);
  const { partnerInfo } = useAppSelector((state) => state.partner);

  const partnerName = partnerInfo?.name || "파트너";

  const handleViewChange = (view: "you" | "partner" | "combined") => {
    dispatch(changeActiveView(view));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tabButton, activeView === "you" && styles.activeTab]}
        onPress={() => handleViewChange("you")}
      >
        <Text
          style={[styles.tabText, activeView === "you" && styles.activeTabText]}
        >
          나
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tabButton, activeView === "partner" && styles.activeTab]}
        onPress={() => handleViewChange("partner")}
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
        onPress={() => handleViewChange("combined")}
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
