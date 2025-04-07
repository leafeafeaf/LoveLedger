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
import { useFictionArt } from "../../hooks/useFictionArt";
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
import { useDatePicker } from "../../hooks/useDatePicker";

const CoverPreviewScreen: FC<StoryScreenProps<"CoverPreview">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story, coverStyle } = route.params;
  const dispatch = useDispatch();
  const { isSaving, error } = useSelector(
    (state: RootState) => state.content.storySaving
  );
  const { mutate, isPending: mutationLoading, error: apiError } = useFictionArt();
  const { mutate: saveFiction } = useFictionSave();
  const coverImage = useSelector(
    (state: RootState) => state.content.storySaving.lastSavedStory?.coverImage
  );
  const { resetAllDates } = useDatePicker();

  React.useEffect(() => {
    // 화면 진입 시 커버 생성
    if (story.content && coverStyle && story.title) {
      console.log("그림 생성 시작 : CoverPreviewScreen")

      mutate(
        {
          content: story.content,
          drawStyle: coverStyle,
          title: story.title,
        },
        {
          onSuccess: (response) => {
            const coverImageRes = response.data.imageUrl;
            console.log(coverImageRes);
            dispatch(
              storySavingSuccess({
                ...story,
                id: "seriesid" in series ? series.seriesid.toString() : Date.now().toString(),
                coverImage: coverImageRes,
              })
            );

            // 여기선 자동 이동은 하지 않음, 저장 버튼 눌러야 넘어감
          },
          onError: (error) => {
            console.error("커버 생성 오류:", error);
            Alert.alert("커버 생성 실패", error.message || "오류가 발생했습니다.");
          },
        }
      );
    }
  }, []);


  const handleSave = () => {
    console.log("저장해보기")
    let coverImageUrl = coverImage;
    const seriesId = "seriesid" in series ? series.seriesid : Date.now();
    const [startDate, endDate] = (settings.period || "").split("~")
      .map((date) => date.trim());

    if (!coverImageUrl) {
      coverImageUrl = "https://image.pollinations.ai/prompt/watercolor%2C%20a%20cute%20girl%20named%20Kim%20Juhyun%20with%20a%20flustered%20expression%2C%20running%20across%20a%20crosswalk%20in%20front%20of%20Seoul%20Transportation%20Corporation%2C%20a%20handsome%20man%20named%20Park%20Sunwoo%20with%20a%20bright%20smile%20is%20holding%20her%20arm%20and%20running%20with%20her%2C%20sunlight%20shining%20brightly%2C%20soft%20pastel%20colors%2C%20a%20sense%20of%20romantic%20excitement"
    }
    console.log(settings);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("seriesId:", seriesId);
    console.log("imageUrl:", coverImageUrl);



    //서버에 소설을 저장
    dispatch(startStorySaving());
    saveFiction(
      {
        content: story.content,
        imageUrl: coverImageUrl,
        startDate,
        endDate,
        title: story.title,
        seriesId,
      },
      {
        onSuccess: (response) => {
          console.log("저장 성공", response);

          dispatch(
            storySavingSuccess({
              ...story,
              id: seriesId.toString(),
              coverImage: coverImageUrl,
            })
          );
          dispatch(clearCoverImage());
          
          // 날짜 초기화
          resetAllDates();

          // ✅ 저장 성공 후 메인 화면 또는 퍼블리싱 화면으로 이동
          navigation.getParent()?.reset({
            index: 0,
            routes: [
              {
                name: "Main", // 또는 "Home"
              },
            ],
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
          }

          console.error("저장 오류", error);
          dispatch(storySavingFailure(errorMessage));
          Alert.alert("저장 실패", errorMessage);
        },
      }
    );
    //main으로 라우팅
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
            {coverImage ? (
              <Image
                source={{ uri: encodeURI(coverImage) }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imageLoadingContainer}>
    <Text style={styles.imageLoadingText}>이미지를 불러오는 중입니다...</Text>
  </View>
            )}
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
          <Text style={styles.saveButtonText}>
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
  imageLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  imageLoadingText: {
    fontSize: 18,
    color: theme.colors.textLight, // 또는 원하는 색상
    textAlign: "center",
    fontWeight: "600",
  },
});

export default CoverPreviewScreen;
