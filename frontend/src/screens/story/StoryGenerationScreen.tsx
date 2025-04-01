import React, { useEffect, useRef, FC } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { StoryScreenProps } from "../../types";
import { useFictionContent } from "../../hooks/useFictionContent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  startStoryGeneration,
  updateStoryGenerationProgress,
  storyGenerationSuccess,
  storyGenerationFailure,
} from "../../store/contentSlice";

type RootStackParamList = {
  StoryGeneration: {
    settings: {
      themeStyle: string;
      period: string;
    };
    series: {
      name: string;
    };
  };
  StoryPreview: {
    settings: {
      themeStyle: string;
      period: string;
    };
    series: {
      name: string;
    };
    story: {
      title: string;
      content: string;
    };
  };
};

type StoryGenerationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StoryGeneration"
>;
type StoryGenerationScreenRouteProp = RouteProp<
  RootStackParamList,
  "StoryGeneration"
>;

type IconName = "book-open-variant" | "book-open-page-variant";

interface StoryGenerationScreenProps {
  navigation: StoryGenerationScreenNavigationProp;
  route: StoryGenerationScreenRouteProp;
}

const StoryGenerationScreen: FC<StoryScreenProps<"StoryGeneration">> = ({
  navigation,
  route,
}) => {
  const { settings, series } = route.params;
  const dispatch = useDispatch();
  const { isGenerating, progress, error } = useSelector(
    (state: RootState) => state.content.storyGeneration
  );

  const bookAnimation = useRef(new Animated.Value(0)).current;
  const pageAnimation = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  const { mutate, isPending, error: apiError } = useFictionContent();

  useEffect(() => {
    // 애니메이션 시작
    startAnimations();

    // API 호출
    generateStory();
  }, []);

  const startAnimations = () => {
    // Book open animation
    Animated.timing(bookAnimation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();

    // Page flip animation (repeating)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pageAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(pageAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();

    // Loading text fade in/out (repeating)
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingTextOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingTextOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(loadingProgress, {
      toValue: 100,
      duration: 5000,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.quad),
    }).start(({ finished }) => {
      if (finished) {
        dispatch(updateStoryGenerationProgress(100));
      }
    });
  };

  const generateStory = () => {
    dispatch(startStoryGeneration());

    // 테마 ID 매핑
    const themeIdMap: { [key: string]: number } = {
      romantic: 1,
      fantasy: 2,
      paparazzi: 3,
      healing: 4,
      comedy: 5,
    };

    const themeId = themeIdMap[settings.themeStyle] || 1;
    const seriesId = "id" in series ? series.id : Date.now();
    const [startDate, endDate] = (settings.period || "").split("~").map(date => date.trim());

    // API 호출
    mutate(
      {
        themeId,
        seriesid: seriesId,
        startdate: startDate,
        enddate: endDate,
      },
      {
        onSuccess: (response) => {
          const story = {
            title: response.data.title,
            content: response.data.content,
          };
          dispatch(storyGenerationSuccess(story));
          
          // 5초 후에 다음 화면으로 이동
          setTimeout(() => {
            navigation.navigate("StoryPreview", {
              settings,
              series,
              story,
            });
          }, 5000);
        },
        onError: (error) => {
          console.error("스토리 생성 중 오류 발생:", error);
          dispatch(storyGenerationFailure(error.message));
        },
      }
    );
  };

  // Determine what status message to show
  const getStatusMessage = () => {
    if (progress < 30) {
      return "당신의 소중한 추억을 하나하나 살펴보고 있어요...";
    } else if (progress < 60) {
      return "추억을 아름다운 이야기로 엮어가고 있어요...";
    } else {
      return "마지막 마무리로 이야기에 영혼을 불어넣고 있어요...";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.bookContainer,
            {
              transform: [
                {
                  scale: bookAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="book-open-variant"
            size={100}
            color={theme.colors.primary}
          />

          <Animated.View
            style={[
              styles.pageOverlay,
              {
                opacity: pageAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateX: pageAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 20],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={60}
              color={theme.colors.primary}
            />
          </Animated.View>
        </Animated.View>

        <Animated.Text
          style={[styles.loadingText, { opacity: loadingTextOpacity }]}
        >
          {getStatusMessage()}
        </Animated.Text>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: loadingProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.progressHint}>
          우리의 이야기를 {settings.themeStyle} 스타일로 글을 쓰는 중입니다
        </Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  bookContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  pageOverlay: {
    position: "absolute",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  progressBarContainer: {
    width: "80%",
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  progressHint: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
});

export default StoryGenerationScreen;
