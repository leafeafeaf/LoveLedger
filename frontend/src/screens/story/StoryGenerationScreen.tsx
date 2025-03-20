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
  CoverSelection: {
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

    // Navigate to cover selection after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate("CoverSelection", {
        settings,
        series,
        // Mock generated story content
        story: {
          title: "A Golden Weekend",
          content:
            "Once upon a time in a quaint little cafe, two souls met under the warm glow of autumn light. The first cup of coffee cost $4.50 — a small price for what would become the beginning of their greatest adventure together.\n\nTheir weekend was filled with laughter and new discoveries. They explored the local art exhibition ($15 for two tickets), shared a delicious lunch at the riverside restaurant ($45), and walked through the park as golden leaves crunched beneath their feet.\n\nIn the evening, they found themselves at a cozy bookstore, each picking a novel that reminded them of the other. The books ($28 total) would later become treasured mementos of this perfect day.\n\nAs night fell, they stood beneath the stars, making promises that would bloom into beautiful memories in the days to come.",
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
      return "Analyzing your memories...";
    } else if (progressValue < 60) {
      return "Crafting your story...";
    } else {
      return "Adding final touches...";
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
          Creating a {settings.themeStyle} story based on your {settings.period}{" "}
          history
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
