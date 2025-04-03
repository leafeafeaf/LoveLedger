import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";

type RootStackParamList = {
  Main: undefined;
  LinkSuccess: undefined;
};

type LinkSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LinkSuccess"
>;

interface LinkSuccessScreenProps {
  navigation: LinkSuccessScreenNavigationProp;
}

export default function LinkSuccessScreen({
  navigation,
}: LinkSuccessScreenProps) {
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={100}
            color={theme.colors.primary}
          />
          <MaterialCommunityIcons
            name="heart-multiple"
            size={40}
            color={theme.colors.white}
            style={styles.heartIcon}
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: opacityAnim,
              transform: [
                {
                  translateY: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          부부 연동 완료!
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            {
              opacity: opacityAnim,
              transform: [
                {
                  translateY: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          축하합니다! 이제 배우자와 함께 재정을 관리하고, 소중한 추억을 기록할
          수 있습니다.
        </Animated.Text>

        <Animated.View
          style={[
            styles.benefitsContainer,
            {
              opacity: opacityAnim,
              transform: [
                {
                  translateY: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.benefitsTitle}>연동 혜택</Text>

          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="chart-box"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>통합 재정 관리 및 분석</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="notebook"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>공유 일기 및 추억 기록</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="flag-checkered"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.benefitText}>함께하는 재정 목표 설정</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Main")}
        >
          <Text style={styles.buttonText}>홈으로 이동</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  iconContainer: {
    position: "relative",
    marginBottom: theme.spacing.xl,
  },
  heartIcon: {
    position: "absolute",
    top: 30,
    left: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.xl * 1.5,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.small,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  benefitText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
