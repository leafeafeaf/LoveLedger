import React, { useState, useEffect, FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import {
  StoryScreenProps,
  CoverStyle,
  Story,
  Series,
  NewSeries,
  StorySettings,
} from "../../types";
import Header from "../../components/common/Header";

const CoverSelectionScreen: FC<StoryScreenProps<"CoverSelection">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story } = route.params;
  const [selectedStyle, setSelectedStyle] = useState<string>("fantasy");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<string>("");

  const coverStyles: CoverStyle[] = [
    { id: "fantasy", label: "Fantasy", icon: "castle" },
    { id: "webtoon", label: "Webtoon", icon: "draw" },
    { id: "watercolor", label: "Watercolor", icon: "palette" },
    { id: "minimalist", label: "Minimalist", icon: "minus-circle-outline" },
    { id: "vintage", label: "Vintage", icon: "camera" },
    { id: "abstract", label: "Abstract", icon: "shape" },
  ];

  useEffect(() => {
    generateCover();
  }, [selectedStyle]);

  const generateCover = () => {
    setIsLoading(true);

    // Generate a unique seed for each style to ensure different images
    const seed =
      coverStyles.findIndex((style) => style.id === selectedStyle) + 100;

    // Create a prompt based on the story theme and the selected cover style
    const promptBase = `A beautiful ${selectedStyle} style book cover about love`;
    let promptAddition = "";

    switch (settings.themeStyle) {
      case "romantic":
        promptAddition = "with a romantic couple";
        break;
      case "fantasy":
        promptAddition = "with magical elements and fantasy creatures";
        break;
      case "paparazzi":
        promptAddition = "with camera flashes and celebrities";
        break;
      case "healing":
        promptAddition = "with nature, calm waters, and peaceful elements";
        break;
      case "comedy":
        promptAddition = "with humorous elements and bright colors";
        break;
      default:
        promptAddition = "with warm, freesia-inspired colors";
    }

    const prompt = `${promptBase} ${promptAddition}`;

    // Create the image URL with the prompt and seed
    const imageUrl = `https://api.a0.dev/assets/image?text=${encodeURIComponent(
      prompt
    )}&aspect=3:4&seed=${seed}`;

    // Simulate a loading delay to make the user feel the process is happening
    setTimeout(() => {
      setCoverImage(imageUrl);
      setIsLoading(false);
    }, 1500);
  };

  const handleNext = () => {
    if (!coverImage) return;

    const storySettings: StorySettings = {
      themeStyle: settings.themeStyle,
      toneStyle: "default", // 기본값 설정
      lengthStyle: "default", // 기본값 설정
    };

    navigation.navigate("CoverPreview", {
      settings: storySettings,
      series: {
        title: "title" in series ? series.title : series.name,
        episodes: 1,
        lastUpdated: new Date().toISOString(),
      },
      story,
      coverImage,
      coverStyle: selectedStyle,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="커버 선택"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Cover Style</Text>

        <View style={styles.styleGrid}>
          {coverStyles.map((style) => (
            <Pressable
              key={style.id}
              style={[
                styles.styleCard,
                selectedStyle === style.id && styles.selectedStyleCard,
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <MaterialCommunityIcons
                name={style.icon}
                size={28}
                color={
                  selectedStyle === style.id
                    ? theme.colors.white
                    : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.styleLabel,
                  selectedStyle === style.id && styles.selectedStyleLabel,
                ]}
              >
                {style.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preview</Text>

        <View style={styles.coverPreviewContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Generating cover...</Text>
            </View>
          ) : (
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
          )}
        </View>

        <Pressable style={styles.regenerateButton} onPress={generateCover}>
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.regenerateText}>Regenerate Cover</Text>
        </Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isLoading || !coverImage}
        >
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  styleCard: {
    width: "30%",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  selectedStyleCard: {
    backgroundColor: theme.colors.primary,
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  selectedStyleLabel: {
    color: theme.colors.white,
  },
  coverPreviewContainer: {
    aspectRatio: 0.75, // 3:4 ratio
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginVertical: theme.spacing.md,
    ...theme.shadows.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
  coverContainer: {
    flex: 1,
    position: "relative",
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
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  regenerateText: {
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

export default CoverSelectionScreen;
