import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../utils/theme";
import { useAccountVerification } from "../../hooks/useAccountVerification";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootStackParamList } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AccountVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AccountVerification"
>;

interface AccountVerificationScreenProps {
  navigation: AccountVerificationScreenNavigationProp;
}


export default function AccountVerificationScreen({
  navigation,
}: AccountVerificationScreenProps) {
  const [accountNo, setAccountNo] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [step, setStep] = useState<"verify" | "confirm">("verify");
  const { verifyAccount, confirmAccount, isLoading, error, verifiedAccount } =
    useAccountVerification();
  

  const handleVerify = async () => {
    const token = await AsyncStorage.getItem("token")

    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      navigation.navigate("Auth", { screen: "Login" });
      return;
    }

    if (!accountNo) {
      Alert.alert("알림", "계좌번호를 입력해주세요.");
      return;
    }

    if (accountNo.length !== 16) {
      Alert.alert("알림", "계좌번호는 16자리여야 합니다.");
      return;
    }

    verifyAccount({ accountNo, token });
  };

  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem("token")
    
    if (!authCode) {
      Alert.alert("알림", "인증번호를 입력해주세요.");
      return;
    }

    if (authCode.length !== 4) {
      Alert.alert("알림", "인증번호는 4자리여야 합니다.");
      return;
    }

    if (!token) {
      Alert.alert("로그인이 필요합니다.");
      navigation.navigate("Auth", { screen: "Login" });
      return;
    }

    confirmAccount({ authCode, accountNo, token });
    
    navigation.goBack();
  };

  React.useEffect(() => {
    if (verifiedAccount) {
      setStep("confirm");
    }
  }, [verifiedAccount]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>계좌 인증</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {step === "verify" ? (
          <>
            <Text style={styles.description}>
              계좌 인증을 위해 1원이 입금될 예정입니다.
              {"\n"}입금 확인 후 계좌 인증이 완료됩니다.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>계좌번호</Text>
              <TextInput
                style={styles.input}
                value={accountNo}
                onChangeText={setAccountNo}
                placeholder="계좌번호 16자리를 입력하세요"
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[
                styles.verifyButton,
                isLoading && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.verifyButtonText}>인증하기</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              계좌로 입금된 1원에 포함된 4자리 인증번호를 입력해주세요.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>인증번호</Text>
              <TextInput
                style={styles.input}
                value={authCode}
                onChangeText={setAuthCode}
                placeholder="인증번호 4자리를 입력하세요"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[
                styles.verifyButton,
                isLoading && styles.verifyButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.verifyButtonText}>확인하기</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    ...theme.shadows.small,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
