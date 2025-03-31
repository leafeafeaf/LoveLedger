import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps, StorySettings, Story, Series } from "../../types";
import Header from "../../components/common/Header";
import { useFictionSave } from "../../hooks/useFictionSave";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  clearCoverImage,
  startStorySaving,
  storySavingSuccess,
  storySavingFailure,
  clearStorySavingState,
} from "../../store/contentSlice";

const CoverPreviewScreen: FC<StoryScreenProps<"CoverPreview">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story, coverImage, coverStyle } = route.params;
  const dispatch = useDispatch();
  const { isSaving, error } = useSelector(
    (state: RootState) => state.content.storySaving
  );
  const { mutate } = useFictionSave();

  const handleSave = () => {
    // 테마 ID 매핑
    const themeIdMap: { [key: string]: number } = {
      webtoon: 1,
      fairytale: 2,
      realistic: 3,
      watercolor: 4,
      oilpainting: 5,
      sketch: 6,
    };

    const themeId = themeIdMap[coverStyle] || 1;
    const seriesId = "id" in series ? series.id : Date.now();
    const [startDate, endDate] = (settings.period || "").split("~").map(date => date.trim());

    dispatch(startStorySaving());

    mutate(
      {
        content: story.content,
        imageurl: coverImage,
        startdate: startDate,
        enddate: endDate,
        title: story.title,
        seriesId,
        themeId,
      },
      {
        onSuccess: (response) => {
          dispatch(storySavingSuccess({
            ...story,
            id: seriesId.toString(),
            coverImage,
          }));
          dispatch(clearCoverImage());
          navigation.navigate("Publishing", {
            settings,
            series: {
              id: seriesId,
              title: "title" in series ? series.title : series.name,
              episodes: "episodes" in series ? series.episodes : 1,
              lastUpdated: "lastUpdated" in series
                ? series.lastUpdated
                : new Date().toISOString(),
            },
            story,
            coverImage,
            coverStyle,
          });
        },
        onError: (error) => {
          let errorMessage = "소설 저장 중 오류가 발생했습니다.";
          
          switch (error.message) {
            case "INVALID_DATE_RANGE":
              errorMessage = "날짜 범위가 올바르지 않습니다.";
              break;
            case "THEME_NOT_FOUND":
              errorMessage = "선택한 테마를 찾을 수 없습니다.";
              break;
            case "SERIES_NOT_FOUND":
              errorMessage = "시리즈를 찾을 수 없습니다.";
              break;
            case "TITLE_TOO_LONG":
              errorMessage = "제목이 40자를 초과할 수 없습니다.";
              break;
            default:
              errorMessage = error.message;
          }

          dispatch(storySavingFailure(errorMessage));
          Alert.alert("오류", errorMessage);
        },
      }
    );
  };

  // 컴포넌트 언마운트 시 상태 초기화
  React.useEffect(() => {
    return () => {
      dispatch(clearStorySavingState());
    };
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Header
        title="커버 미리보기"
        showBack={true}
        onBack={() => {
          dispatch(clearCoverImage());
          dispatch(clearStorySavingState());
          navigation.goBack();
        }}
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
        <Pressable 
          style={[styles.nextButton, isSaving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.nextButtonText}>
            {isSaving ? "저장 중..." : "Save"}
          </Text>
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
  disabledButton: {
    opacity: 0.7,
  },
});

export default CoverPreviewScreen;
