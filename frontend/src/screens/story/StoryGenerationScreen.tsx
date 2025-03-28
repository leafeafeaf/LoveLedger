import React, { useEffect, useRef, FC } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { StoryScreenProps } from "../../types";

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

  const bookAnimation = useRef(new Animated.Value(0)).current;
  const pageAnimation = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    }).start();

    // Navigate to series preview after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate("StoryPreview", {
        settings,
        series,
        story: {
          title: "용사 부부 연대기 : 마왕 토벌 전, 마지막 하루",
          content: `검은 구름이 마왕성 위를 뒤덮기 전날, 용사 A와 그의 아내, 성기사 L은 마침내 마지막 준비를 시작했다. 아침, 시흥 왕국 남쪽 마을. 두 사람은 '스타벅스 여관'에서 전설의 카페인의 묘약(12,000골드)을 나눠 마시며 긴장된 하루를 열었다. "마왕과 싸우려면, 정신이 또렷해야지." A가 웃자, L도 잔을 부딪쳤다. 전투 전 부부의 소소한 루틴이었다. 점심 무렵, Rt2 주점에 들른 두 사람. 이곳에서만 맛볼 수 있는 강철 스테이크(15,000골드)와 힘의 포션을 주문해, 내일의 결전을 위해 기운을 충전했다. 식사 도중, 동료 도적 E3에게 전투비(25,000골드)를 송금. "그 친구, 망치만 챙기고 방어구는 빌려 쓰더군요. 이것도 부부로서 챙겨야지." 오후엔 비밀스럽게 ATM 마법진을 찾아 50,000골드 현금화. 둘은 노래방 '노래의 탑'에 들러 승리를 기원하며 노래 한 곡 뽑았다. "이게 우리의 버프야!" L이 깔깔 웃었다. 해가 기울자 감자탕 성당에 들러 43,000골드로 포만감을 채우고, 근처 극장에서 문화극(22,000골드)도 관람. "내일 싸움엔 머리도 써야지." 잠시 시장 골목에 들러 간식거리(15,000골드)까지 빠짐없이 챙겼다. L이 포장한 간식을 A의 갑옷 주머니에 쏙 넣으며, "출정 전에 당 보충은 필수."`,
        },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Determine what status message to show
  const getStatusMessage = () => {
    let progressValue = 0;
    loadingProgress.addListener(({ value }) => {
      progressValue = value;
    });

    if (progressValue < 30) {
      return "당신의 소중한 추억을 하나하나 살펴보고 있어요...";
    } else if (progressValue < 60) {
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
