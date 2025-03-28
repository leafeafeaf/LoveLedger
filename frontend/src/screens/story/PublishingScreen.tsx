import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { StoryScreenProps } from "../../types";
import { CommonActions, useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const useOverlayClose = () => {
  const [isVisible, setIsVisible] = useState(true);

  const closeOverlay = () => {
    setIsVisible(false);
  };

  return { isVisible, closeOverlay };
};

interface PublishingScreenProps extends StoryScreenProps<"Publishing"> {
  onClose?: () => void;
}

const PublishingScreen: React.FC<PublishingScreenProps> = ({
  route,
  onClose = () => {},
}) => {
  const navigation = useNavigation();
  const { isVisible, closeOverlay } = useOverlayClose();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bookAnimation = useRef(new Animated.Value(0)).current;
  const pageAnimation = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  const steps = [
    "소설 제본뜨는 중...",
    "책장 정리하는 중...",
    "새로운 책을 책장에 넣고 있습니다...",
  ];

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

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        setTimeout(() => {
          Alert.alert(
            "소설 생성 완료",
            "새로운 소설이 성공적으로 생성되었습니다.",
            [
              {
                text: "확인",
                onPress: () => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Main", params: {} }],
                    })
                  );
                },
              },
            ],
            { cancelable: false }
          );
        }, 2000);
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [navigation, closeOverlay]);

  if (!isVisible) {
    return null;
  }

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
          {steps[currentStep]}
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
          우리의 이야기를 책으로 만드는 중입니다
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

export default PublishingScreen;
