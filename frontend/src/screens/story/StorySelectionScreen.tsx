import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  StorySelection: undefined;
  StorySettings: undefined;
  Diary: undefined;
};

type StorySelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StorySelection"
>;

type IconName = "arrow-left" | "book-open-page-variant" | "notebook";

interface StorySelectionScreenProps {
  navigation: StorySelectionScreenNavigationProp;
}

export default function StorySelectionScreen({
  navigation,
}: StorySelectionScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={styles.title}>Create New</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.optionsContainer}>
        <Pressable
          style={styles.optionCard}
          onPress={() => navigation.navigate("StorySettings")}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.accent },
            ]}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={32}
              color={theme.colors.white}
            />
          </View>
          <Text style={styles.optionTitle}>Create a Story</Text>
          <Text style={styles.optionDescription}>
            Generate beautiful stories based on your experiences and transaction
            history
          </Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => navigation.navigate("Diary")}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="notebook"
              size={32}
              color={theme.colors.white}
            />
          </View>
          <Text style={styles.optionTitle}>Write a Diary</Text>
          <Text style={styles.optionDescription}>
            Capture your day with emotions, expenses, and memories
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  optionsContainer: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "center",
    gap: theme.spacing.xl,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    ...theme.shadows.medium,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
});
