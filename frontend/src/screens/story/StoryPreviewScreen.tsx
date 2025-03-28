import React, { FC } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps, StorySettings, Story, Series } from "../../types";
import Header from "../../components/common/Header";

const StoryPreviewScreen: FC<StoryScreenProps<"StoryPreview">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story } = route.params;

  const handleNext = () => {
    navigation.navigate("CoverSelection", {
      settings,
      series,
      story,
    });
  };

  const handleRegenerate = () => {
    navigation.navigate("StoryGeneration", {
      settings,
      series,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="스토리 미리보기"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.paperContainer}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyContent}>{story.content}</Text>
          </View>
          <Pressable style={styles.regenerateButton} onPress={handleRegenerate}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.regenerateButtonText}>스토리 재생성</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={theme.colors.white}
          />
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
    padding: theme.spacing.md,
  },
  section: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  paperContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    width: "95%",
    alignSelf: "center",
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  storyContent: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 28,
    textAlign: "justify",
  },
  regenerateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    width: "95%",
    alignSelf: "center",
    ...theme.shadows.medium,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
});

export default StoryPreviewScreen;
