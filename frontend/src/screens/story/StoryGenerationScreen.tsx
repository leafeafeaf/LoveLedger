import React, { useEffect, useRef, FC, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { StoryScreenProps } from "../../types";
import { useFictionContent } from "../../hooks/useFictionContent";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDatePicker } from "../../hooks/useDatePicker";
import {
  startStoryGeneration,
  updateStoryGenerationProgress,
  storyGenerationSuccess,
  storyGenerationFailure,
  clearCoverImage,
  clearCurrentStory,
  clearStorySavingState
} from "../../store/contentSlice";
import { CommonActions } from "@react-navigation/native";

type RootStackParamList = {
  StoryGeneration: {
    settings: {
      themeStyle: string;
      period: string;
    };
    series: {
      seriesid: number,
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
  const { resetAllDates } = useDatePicker();

  const bookAnimation = useRef(new Animated.Value(0)).current;
  const bookVariantOpacity = useRef(new Animated.Value(1)).current;
  const pageVariantOpacity = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  const { mutate, isPending, error: apiError } = useFictionContent();

  useEffect(() => {
    // 애니메이션 시작
    startAnimations();

    // API 호출
    generateStory();

    // 화면을 나갈 때 정리 작업
    return () => {
      resetAllDates();
    };
  }, []);

  const startAnimations = () => {
    // Book open animation
    Animated.timing(bookAnimation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start();

    // 책 아이콘 교차 애니메이션 (반복)
    Animated.loop(
      Animated.sequence([
        // 첫 번째 아이콘 페이드 아웃, 두 번째 아이콘 페이드 인
        Animated.parallel([
          Animated.timing(bookVariantOpacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pageVariantOpacity, {
            toValue: 1,
            duration: 700, 
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        // 두 번째 아이콘 페이드 아웃, 첫 번째 아이콘 페이드 인
        Animated.parallel([
          Animated.timing(bookVariantOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pageVariantOpacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
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
      일상: 1,
      판타지: 2,
      파파라치: 3,
      뉴스: 4
    };

    const themeId = themeIdMap[settings.themeStyle] || 1;
    const seriesId = "seriesid" in series ? (series as { seriesid: number }).seriesid : 0;
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
          
          console.log(response);
          dispatch(storyGenerationSuccess(story));
          
          // 5초 후에 다음 화면으로 이동
          navigation.navigate("StoryPreview", {
              settings,
              series,
              story,
            });
        },
        onError: (error) => {
          console.error("스토리 생성 중 오류 발생:", error);
          dispatch(storyGenerationFailure(error.message));
          
          // 모든 설정 초기화
          resetAllDates();
          dispatch(clearCurrentStory());
          dispatch(clearCoverImage());
          dispatch(clearStorySavingState());
          
          // 오류 메시지 표시 후 메인 화면으로 리디렉션
          Alert.alert(
            "스토리 생성 오류",
            "스토리 생성 중 오류가 발생했습니다. 메인 화면으로 돌아갑니다.",
            [
              {
                text: "확인",
                onPress: () => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Main" }],
                    })
                  );
                },
              },
            ]
          );
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
          <Animated.View style={{ 
            position: 'absolute',
            opacity: bookVariantOpacity 
          }}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={100}
              color={theme.colors.primary}
            />
          </Animated.View>

          <Animated.View style={{ 
            position: 'absolute',
            opacity: pageVariantOpacity 
          }}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={100}
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
    marginBottom: theme.spacing.md,
    height: 120,
    width: 120,
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
