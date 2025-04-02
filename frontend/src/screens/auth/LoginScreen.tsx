import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "../../store/authSlice";
import { theme } from "../../utils/theme";
import { useGoogleAuthApi } from "../../hooks/useGoogleAuthApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignUpRequest } from "../../types";
import { useUpdateUserInfo } from "../../hooks/useUserApi";
import { useTokenIntegration } from "../../hooks/useTokenIntegration";
import { axiosInstance } from "../../api/axios";
import { WebView } from "react-native-webview";

// TestQueryButton 컴포넌트 (내부에 정의)
const TestQueryButton = () => {
  const { fetchTokenWithQuery, fetchTokenWithRedux, token, isLoading, error } =
    useTokenIntegration();
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const handleQueryTest = async () => {
    try {
      // 테스트 사용자 ID
      const userId = 1;
      console.log(`[React Query 테스트] GET /test/token/${userId}`);

      // React Query를 사용하여 토큰 요청
      const result = await fetchTokenWithQuery(userId);

      // 결과 로깅
      console.log("[React Query 응답]", JSON.stringify(result.data, null, 2));

      // 상태 업데이트
      setQueryResult(JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      console.error("[React Query 오류]", err);
      setQueryResult(`오류: ${err.message}`);
    }
  };

  const handleReduxTest = async () => {
    try {
      // 테스트 사용자 ID
      const userId = 1;
      console.log(`[Redux 테스트] GET /test/token/${userId}`);

      // Redux를 사용하여 토큰 요청
      await fetchTokenWithRedux(userId);

      // 결과 로깅 (Redux 스토어 상태는 컴포넌트에 자동으로 반영됨)
      console.log("[Redux 토큰 상태]", token);

      // 상태 업데이트
      setQueryResult(`Redux 토큰: ${token}`);
    } catch (err: any) {
      console.error("[Redux 테스트 오류]", err);
      setQueryResult(`오류: ${err.message}`);
    }
  };

  return (
    <View style={tokenTestStyles.container}>
      <Pressable
        style={tokenTestStyles.button}
        onPress={handleQueryTest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={tokenTestStyles.buttonText}>React Query 테스트</Text>
        )}
      </Pressable>

      <Pressable
        style={tokenTestStyles.button}
        onPress={handleReduxTest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={tokenTestStyles.buttonText}>Redux 테스트</Text>
        )}
      </Pressable>

      {queryResult && (
        <View style={tokenTestStyles.resultContainer}>
          <Text style={tokenTestStyles.resultText} numberOfLines={4}>
            {queryResult}
          </Text>
        </View>
      )}

      {error && <Text style={tokenTestStyles.errorText}>{error}</Text>}
    </View>
  );
};

// 테스트 버튼 스타일
const tokenTestStyles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: "100%",
  },
  resultText: {
    fontSize: 12,
    color: "#333",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

// 소셜 로그인 이미지 임포트
const GOOGLE_ICON = require("../../../assets/images/login/google.png");
const NAVER_ICON = require("../../../assets/images/login/naver.png");
const KAKAO_ICON = require("../../../assets/images/login/kakao-talk.png");

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading: authLoading, error } = useAppSelector(
    (state) => state.auth
  );
  const {
    handleGoogleLogin,
    isLoading: googleLoading,
    error: googleError,
    isRegistered,
  } = useGoogleAuthApi();
  const updateUserInfoMutation = useUpdateUserInfo();

  const isLoading = authLoading || googleLoading;

  // 회원가입 추가 정보 상태
  const [signUpData, setSignUpData] = useState<SignUpRequest>({
    name: "",
    gender: true,
    birthDay: "",
    isMarried: false,
  });

  // 회원가입 모달 표시 상태
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // 컴포넌트 마운트 시 에러 초기화
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 신규 사용자 여부에 따라 회원가입 모달 표시
  useEffect(() => {
    if (isRegistered) {
      setShowSignUpModal(true);
    }
  }, [isRegistered]);

  // 구글 로그인 타임아웃 표시
  const [showingTimeout, setShowingTimeout] = useState(false);

  useEffect(() => {
    // 구글 에러가 발생하면 메인 에러 상태로 설정
    if (googleError && !error) {
      dispatch(loginFailure(googleError));
    }

    // 타임아웃 관련 UI 처리
    if (googleError && googleError.includes("시간이 초과") && !showingTimeout) {
      setShowingTimeout(true);
      // 잠시 후 타임아웃 메시지 숨기기
      const timeoutId = setTimeout(() => {
        setShowingTimeout(false);
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [googleError, dispatch, error, showingTimeout]);

  // 소셜 로그인 처리 함수
  const handleSocialLogin = (provider: "google" | "naver" | "kakao") => {
    if (provider === "google") {
      handleGoogleLogin();
    } else {
      dispatch(loginStart());
      console.log(`${provider} 로그인 시도`);

      // 임의로 네이버 로그인은 신규 사용자로 처리 (테스트용)
      const isFirstTime = provider === "naver";

      // 실제 소셜 로그인 구현 대신 성공 시뮬레이션
      setTimeout(async () => {
        // 토큰 생성 (first-time을 포함해 신규 사용자 표시)
        const token = isFirstTime
          ? `dummy-token-${provider}-first-time-123`
          : `dummy-token-${provider}-123`;

        // 로컬 스토리지에 토큰 저장
        await AsyncStorage.setItem("token", token);

        // 상태 업데이트
        dispatch(
          loginSuccess({
            token,
            userInfo: {
              id: "1",
              name: `${provider} 사용자`,
              email: `user@${provider}.com`,
            },
          })
        );

        // 신규 사용자인 경우 모달 표시
        if (isFirstTime) {
          setShowSignUpModal(true);
        }
      }, 1000);
    }
  };

  // 생일 입력 포맷팅 함수
  const formatBirthDay = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/\D/g, "");

    // 8자리 이상이면 8자리만 사용
    if (numbers.length > 8) {
      const formatted = numbers.slice(0, 8);
      return `${formatted.slice(0, 4)}-${formatted.slice(
        4,
        6
      )}-${formatted.slice(6, 8)}`;
    }

    // 8자리 미만이면 원본 반환
    if (numbers.length < 8) {
      return numbers;
    }

    // 8자리인 경우 포맷팅
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(
      6,
      8
    )}`;
  };

  // 생일 입력 검증 함수
  const validateBirthDay = (text: string) => {
    if (text.length !== 10) return false; // YYYY-MM-DD 형식이어야 함

    const [year, month, day] = text.split("-").map(Number);

    // 유효한 날짜인지 검증
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // 회원가입 추가 정보 제출
  const handleSignUpSubmit = () => {
    if (!signUpData.name || !signUpData.birthDay) {
      dispatch(loginFailure("모든 필수 항목을 입력해주세요."));
      return;
    }

    if (!validateBirthDay(signUpData.birthDay)) {
      dispatch(loginFailure("올바른 생일 형식을 입력해주세요."));
      return;
    }

    // 회원가입 추가 정보 업데이트
    updateUserInfoMutation.mutate(signUpData);
    setShowSignUpModal(false);
  };

  // 구글 로그인 버튼 렌더링 함수
  const renderGoogleButton = () => {
    return (
      <Pressable
        style={styles.socialButton}
        onPress={handleGoogleLogin}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Image
            source={GOOGLE_ICON}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        )}
      </Pressable>
    );
  };

  // 회원가입 모달 렌더링
  const renderSignUpModal = () => {
    return (
      <Modal
        visible={showSignUpModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSignUpModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>추가 정보 입력</Text>
                  <Text style={styles.modalSubtitle}>
                    소셜 로그인 첫 사용자를 위한 추가 정보를 입력해주세요.
                  </Text>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled">
                  <TextInput
                    style={styles.input}
                    placeholder="이름 (4자 이내로 작성해주세요)"
                    value={signUpData.name}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, name: text })
                    }
                    placeholderTextColor={theme.colors.textLight}
                  />

                  <View style={styles.switchContainer}>
                    <View style={styles.switchLabelContainer}>
                      <Text
                        style={[
                          styles.switchLabel,
                          signUpData.gender && styles.switchLabelActive,
                        ]}
                      >
                        {signUpData.gender ? "남성" : "여성"}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.toggleButton,
                        signUpData.gender && styles.toggleButtonActive,
                      ]}
                      onPress={() =>
                        setSignUpData({
                          ...signUpData,
                          gender: !signUpData.gender,
                        })
                      }
                    >
                      <View
                        style={[
                          styles.toggleCircle,
                          signUpData.gender && styles.toggleCircleActive,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            signUpData.gender ? "gender-male" : "gender-female"
                          }
                          size={16}
                          color={
                            signUpData.gender
                              ? theme.colors.primary
                              : theme.colors.textLight
                          }
                        />
                      </View>
                    </Pressable>
                  </View>

                  <TextInput
                    style={[
                      styles.input,
                      signUpData.birthDay &&
                        !validateBirthDay(signUpData.birthDay) &&
                        styles.inputError,
                    ]}
                    placeholder="생일 (YYYYMMDD 형식으로 입력해주세요)"
                    value={signUpData.birthDay}
                    onChangeText={(text) => {
                      const formatted = formatBirthDay(text);
                      setSignUpData({ ...signUpData, birthDay: formatted });
                    }}
                    placeholderTextColor={theme.colors.textLight}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {signUpData.birthDay &&
                    !validateBirthDay(signUpData.birthDay) && (
                      <Text style={styles.errorText}>
                        올바른 생일을 입력해주세요 (YYYYMMDD 형식으로
                        입력해주세요)
                      </Text>
                    )}

                  <View style={styles.switchContainer}>
                    <View style={styles.switchLabelContainer}>
                      <Text
                        style={[
                          styles.switchLabel,
                          signUpData.isMarried && styles.switchLabelActive,
                        ]}
                      >
                        {signUpData.isMarried ? "기혼" : "미혼"}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.toggleButton,
                        signUpData.isMarried && styles.toggleButtonActive,
                      ]}
                      onPress={() =>
                        setSignUpData({
                          ...signUpData,
                          isMarried: !signUpData.isMarried,
                        })
                      }
                    >
                      <View
                        style={[
                          styles.toggleCircle,
                          signUpData.isMarried && styles.toggleCircleActive,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={signUpData.isMarried ? "ring" : "account-heart"}
                          size={16}
                          color={
                            signUpData.isMarried
                              ? theme.colors.primary
                              : theme.colors.textLight
                          }
                        />
                      </View>
                    </Pressable>
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <Pressable
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSignUpSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.buttonText}>처리 중...</Text>
                    ) : (
                      <Text style={styles.buttonText}>완료</Text>
                    )}
                  </Pressable>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        {/* 회원가입 추가 정보 모달 */}
        {renderSignUpModal()}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="never"
          bounces={true}
        >
          {/* 헤더 부분 */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="heart-multiple"
              size={60}
              color={theme.colors.primary}
            />
            <Text style={styles.title}>Love Ledger</Text>
            <Text style={styles.subtitle}>
              간편하게 로그인하고 이야기를 시작하세요
            </Text>
          </View>

          {/* 소셜 로그인 섹션 */}
          <View style={styles.socialLoginContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.socialLoginText}>소셜 계정으로 로그인</Text>

            <View style={styles.socialButtonsContainer}>
              {/* 구글 로그인 버튼 */}
              {renderGoogleButton()}

              <Pressable
                style={styles.socialButton}
                onPress={() => handleSocialLogin("naver")}
                disabled={isLoading}
              >
                <Image
                  source={NAVER_ICON}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </Pressable>

              <Pressable
                style={styles.socialButton}
                onPress={() => handleSocialLogin("kakao")}
                disabled={isLoading}
              >
                <Image
                  source={KAKAO_ICON}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            <Text style={styles.helpText}>
              로그인하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </Text>

            {/* 테스트용! */}
            <View style={styles.testButtonsContainer}>
              <Pressable
                style={styles.testButton}
                onPress={async () => {
                  console.log("테스트 로그인 버튼 클릭");
                  try {
                    // 테스트 사용자 ID
                    const userId = 1;

                    console.log(`API 요청 준비: GET /test/token/${userId}`);
                    console.log(
                      "baseURL 확인:",
                      axiosInstance.defaults.baseURL
                    );

                    // 직접 axios로 요청 보내기
                    console.log("axios 요청 보내기 시작...");
                    const response = await axiosInstance.get(
                      `/test/token/${userId}`
                    );

                    console.log(
                      "[API 응답]",
                      JSON.stringify(response.data, null, 2)
                    );

                    if (response.data && response.data.success) {
                      // 토큰 저장 및 로그인 처리
                      const token = response.data.data.accessToken;
                      await AsyncStorage.setItem("token", token);

                      // 만료 시간 저장
                      const expiresAt =
                        Date.now() + response.data.data.expiresIn;
                      await AsyncStorage.setItem(
                        "tokenExpiresAt",
                        expiresAt.toString()
                      );

                      // Redux 상태 업데이트
                      dispatch(
                        loginSuccess({
                          token,
                          userInfo: {
                            id: userId.toString(),
                            name: "테스트 사용자",
                            email: "test@example.com",
                          },
                        })
                      );
                    }
                  } catch (err: any) {
                    console.error("API 오류 상세 정보:", err);
                    if (err.message) console.log("오류 메시지:", err.message);
                    if (err.code) console.log("오류 코드:", err.code);
                    if (err.config) console.log("요청 설정:", err.config);

                    // 오류 시 기존 테스트 로그인으로 대체
                    const token = "test-token-123";
                    await AsyncStorage.setItem("token", token);
                    dispatch(
                      loginSuccess({
                        token,
                        userInfo: {
                          id: "1",
                          name: "테스트 사용자",
                          email: "test@example.com",
                        },
                      })
                    );
                  }
                }}
              >
                <Text style={styles.testButtonText}>테스트 로그인</Text>
              </Pressable>

              <Pressable
                style={styles.testButton}
                onPress={() => {
                  // 회원가입 모달 바로 열기
                  setShowSignUpModal(true);
                }}
              >
                <Text style={styles.testButtonText}>테스트 회원가입</Text>
              </Pressable>
            </View>

            {/* React Query 통합 테스트 */}
            <TestQueryButton />
            {/* 테스트용! */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl * 2,
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
    textAlign: "center",
  },
  socialLoginContainer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  socialLoginText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.small,
    overflow: "hidden", // 로딩 애니메이션을 버튼 안에 가두기 위함
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xl,
    textAlign: "center",
  },

  // 테스트 버튼 스타일
  testButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  testButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  testButtonText: {
    color: "black",
    fontWeight: "500",
    fontSize: 14,
  },

  // 모달 스타일
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },

  // 입력 폼 스타일
  input: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    height: 50,
    ...theme.shadows.small,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
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
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },

  // 스위치 스타일
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    height: 50,
    ...theme.shadows.small,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.textLight,
    fontWeight: "500",
  },
  switchLabelActive: {
    color: theme.colors.primary,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.textLight,
    padding: 2,
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    transform: [{ translateX: 0 }],
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
});
