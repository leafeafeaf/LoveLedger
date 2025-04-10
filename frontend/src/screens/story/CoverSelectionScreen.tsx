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
import { useFictionArt } from "../../hooks/useFictionArt";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  startCoverGeneration,
  coverGenerationSuccess,
  coverGenerationFailure,
  setCoverStyle,
  clearCoverImage,
} from "../../store/contentSlice";

const CoverSelectionScreen: FC<StoryScreenProps<"CoverSelection">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story } = route.params;
  const dispatch = useDispatch();
  const { isGenerating, selectedStyle, coverImage, error } = useSelector(
    (state: RootState) => state.content.coverGeneration
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [useLocalImage, setUseLocalImage] = useState<boolean>(false);

  const coverStyles: CoverStyle[] = [
    { id: "webtoon", label: "웹툰", icon: "book-open-page-variant" },
    { id: "ghibli", label: "지브리", icon: "desktop-classic" },
    { id: "realistic", label: "실사", icon: "camera" },
    { id: "watercolor", label: "수채화", icon: "palette" },
    { id: "oilpainting", label: "유화", icon: "brush" },
    { id: "sketch", label: "스케치", icon: "pencil" },
  ];

  // 그림체별 미리보기 이미지 URL 매핑
  const stylePreviewImages: Record<string, string> = {
    webtoon: "https://image.pollinations.ai/prompt/A_webtoon-style_scene_of_a_person_gazing_up_at_the_moon_in_the_top_left_corner_of_the_frame",
    ghibli: "",
    realistic: "https://image.pollinations.ai/prompt/A_photorealistic_image_of_a_bustling_city_street_at_night,_with_neon_signs_reflecting_on_the_wet_pavement.jpg",
    watercolor: "https://image.pollinations.ai/prompt/A_vibrant_oil_painting_depicting_a_serene_sunset_over_a_tranquil_lake,_with_soft_light_reflecting_on_the_water's_surface.jpg",
    oilpainting: "https://image.pollinations.ai/prompt/A_single_scene_in_the_style_of_an_oil_painting,_depicting",
    sketch: "https://image.pollinations.ai/prompt/A_sketch_of_a_person_sitting_at_a_table_in_a_cafe,_with_their_face_visible",
  };

  // 컴포넌트 마운트 시 기본 선택 스타일 설정
  useEffect(() => {
    if (selectedStyle && selectedStyle === "ghibli") {
      setUseLocalImage(true);
      setPreviewImage(null);
    } else if (selectedStyle && stylePreviewImages[selectedStyle]) {
      setUseLocalImage(false);
      setPreviewImage(stylePreviewImages[selectedStyle]);
    } else if (coverStyles.length > 0) {
      const defaultStyle = coverStyles[0].id;
      dispatch(setCoverStyle(defaultStyle));
      setUseLocalImage(false);
      setPreviewImage(stylePreviewImages[defaultStyle]);
    }
  }, []);

  const handleStyleSelect = (styleId: string) => {
    console.log("선택된 커버 스타일:", styleId);
    console.log("이 스타일 ID는 CoverPreviewScreen에서 drawStyle로 사용됩니다.");
    dispatch(setCoverStyle(styleId));
    
    // 지브리 스타일은 로컬 이미지 사용
    if (styleId === "ghibli") {
      setUseLocalImage(true);
      setPreviewImage(null);
    } else {
      setUseLocalImage(false);
      // 선택한 스타일에 맞는 미리보기 이미지 설정
      if (stylePreviewImages[styleId]) {
        setPreviewImage(stylePreviewImages[styleId]);
      } else {
        setPreviewImage(null);
      }
    }
  };

  const handleNext = () => {
    console.log("coverPreview로 이동")

    const storySettings: StorySettings = {
      themeStyle: settings.themeStyle,
      toneStyle: "default",
      lengthStyle: "default",
      period: settings.period
    };

    navigation.navigate("CoverPreview", {
      settings: storySettings,
      series: {
        seriesid: series.seriesid,
        title: "title" in series ? series.title : series.name,
        episodes: 1,
        lastUpdated: new Date().toISOString(),
      },
      story,
      coverStyle: selectedStyle,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="커버 선택"
        showBack={true}
        onBack={() => {
          dispatch(clearCoverImage());
          navigation.goBack();
        }}
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
                onPress={() => handleStyleSelect(style.id)}
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
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  그림체를 불러오고 있어요...
                </Text>
              </View>
            ) : useLocalImage && selectedStyle === "ghibli" ? (
              <View style={styles.coverContainer}>
                <Image
                  source={require("../../../assets/images/cover/ghibli.jpg")}
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
            ) : previewImage ? (
              <View style={styles.coverContainer}>
                <Image
                  source={{ uri: previewImage }}
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
            ) : (
              <View style={styles.emptyPreviewContainer}>
                <MaterialCommunityIcons
                  name="image-outline"
                  size={60}
                  color={theme.colors.textLight}
                />
                <Text style={styles.emptyPreviewText}>
                  그림체를 선택하면 예시 이미지가 표시됩니다
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.nextButton}
          onPress={handleNext}
          disabled={!settings.themeStyle}
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
  emptyPreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  emptyPreviewText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: theme.spacing.md,
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
