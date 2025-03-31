import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps, StorySettings, Story, Series } from "../../types";
import Header from "../../components/common/Header";

const CoverPreviewScreen: FC<StoryScreenProps<"CoverPreview">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story, coverImage, coverStyle } = route.params;

  const handleNext = () => {
    navigation.navigate("Publishing", {
      settings,
      series: {
        id: "id" in series ? series.id : Date.now(),
        title: "title" in series ? series.title : series.name,
        episodes: "episodes" in series ? series.episodes : 1,
        lastUpdated:
          "lastUpdated" in series
            ? series.lastUpdated
            : new Date().toISOString(),
      },
      story,
      coverImage,
      coverStyle,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="커버 미리보기"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.coverOverlay}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.seriesTitle}>
                {"title" in series ? series.title : series.name}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  coverContainer: {
    aspectRatio: 0.75,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    width: "95%",
    alignSelf: "center",
    ...theme.shadows.medium,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  seriesTitle: {
    fontSize: 16,
    fontStyle: "italic",
    color: theme.colors.white,
    opacity: 0.9,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
});

export default CoverPreviewScreen;
