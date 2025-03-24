import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";
import { AuthStackParamList, RootStackParamList } from "../../types";

// 네비게이션 타입 정의
type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
> &
  NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const formAnimation = new Animated.Value(0);

  const toggleMode = () => {
    Animated.spring(formAnimation, {
      toValue: isRegistering ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setIsRegistering(!isRegistering);
  };

  // 로그인/회원가입 처리
  const handleSubmit = () => {
    // TODO: 실제 인증 구현
    // 문제 해결: Auth 네비게이터에서 Main으로 직접 이동할 수 없음
    // AppRouter.tsx의 구조에 맞게 수정
    navigation.dispatch(
      CommonActions.navigate({
        name: "Main",
      })
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="heart-multiple"
          size={60}
          color={theme.colors.primary}
        />
        <Text style={styles.title}>Love Ledger</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? "Create your love story" : "Welcome back"}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.form,
          {
            transform: [
              {
                translateY: formAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={theme.colors.textLight}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={theme.colors.textLight}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={theme.colors.textLight}
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isRegistering ? "Sign Up" : "Login"}
          </Text>
        </Pressable>

        <Pressable style={styles.toggleButton} onPress={toggleMode}>
          <Text style={styles.toggleText}>
            {isRegistering
              ? "Already have an account? Login"
              : "New to Love Ledger? Sign Up"}
          </Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  form: {
    marginTop: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    ...theme.shadows.small,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: theme.spacing.xl,
    alignItems: "center",
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
