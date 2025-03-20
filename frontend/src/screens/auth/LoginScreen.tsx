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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
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

  const handleSubmit = () => {
    // TODO: Implement actual auth
    navigation.replace("Main");
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
