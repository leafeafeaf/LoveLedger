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
    { id: "webtoon", label: "웹툰", icon: "book-open-page-variant" },
    { id: "fairytale", label: "그래픽", icon: "desktop-classic" },
    { id: "realistic", label: "실사", icon: "camera" },
    { id: "watercolor", label: "수채화", icon: "palette" },
    { id: "oilpainting", label: "유화", icon: "brush" },
    { id: "sketch", label: "스케치", icon: "pencil" },
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
        id: "title" in series ? series.id : Date.now(),
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>커버 그림체를 선택해주세요</Text>

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
                <View style={styles.styleContent}>
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
                      styles.centeredText,
                    ]}
                  >
                    {style.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>그림체 미리보기</Text>
          <Text style={styles.previewNotice}>
            아래 그림은 예시 이미지로서 실제 생성된 그림과 다를 수 있습니다.
          </Text>

          <View style={styles.coverPreviewContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  그림체를 불러오고 있어요...
                </Text>
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
        </View>
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
  section: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  previewNotice: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.7)",

    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: "space-between",
  },
  styleCard: {
    width: "31%",
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  selectedStyleCard: {
    backgroundColor: theme.colors.primary,
  },
  styleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
  selectedStyleLabel: {
    color: theme.colors.white,
  },
  centeredText: {
    textAlign: "center",
  },
  coverPreviewContainer: {
    aspectRatio: 0.75,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    width: "90%",
    alignSelf: "center",
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
    marginHorizontal: theme.spacing.md,
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
