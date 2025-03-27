import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector, useAppDispatch } from "./hooks/reduxHooks";
import { RootStackParamList } from "./types";
import { AuthEvents } from "./api/axios";
import { logout, checkAuthStatus } from "./store/authSlice";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "./utils/theme";

// 네비게이터 임포트
import { AuthNavigator } from "./navigation/AuthNavigator";
import { MainNavigator } from "./navigation/MainNavigator";
import { StoryNavigator } from "./navigation/StoryNavigator";
import { DiaryNavigator } from "./navigation/DiaryNavigator";
import { ProfileNavigator } from "./navigation/ProfileNavigator";
import { DailyNavigator } from "./navigation/DailyNavigator";

// 개별 화면 임포트
import TransactionEditScreen from "./screens/daily/DailyEditScreen";
import LinkGenerationScreen from "./screens/link/LinkGenerationScreen";
import LinkConfirmScreen from "./screens/link/LinkConfirmScreen";
import LinkSuccessScreen from "./screens/link/LinkSuccessScreen";
import LinkErrorScreen from "./screens/link/LinkErrorScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

// 로딩 화면 컴포넌트
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

const AppRouter = () => {
  // Redux에서 인증 상태 가져오기
  const { isAuthenticated, autoLoginChecked } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  // 앱 시작 시 자동 로그인 체크
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // 토큰 만료시 자동 로그아웃 처리 설정
  useEffect(() => {
    AuthEvents.onTokenExpired = () => {
      dispatch(logout());
    };

    return () => {
      AuthEvents.onTokenExpired = null;
    };
  }, [dispatch]);

  // 자동 로그인 체크가 완료되지 않았다면 로딩 화면 표시
  if (!autoLoginChecked) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // 인증되지 않은 상태
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // 인증된 상태
          <>
            <Stack.Screen name="Main" component={MainNavigator} />

            {/* 스토리 스택 */}
            <Stack.Screen
              name="Story"
              component={StoryNavigator}
              options={{ presentation: "modal" }}
            />

            {/* 다이어리 스택 */}
            <Stack.Screen
              name="Diary"
              component={DiaryNavigator}
              options={{ presentation: "modal" }}
            />

            {/* Daily 스택 */}
            <Stack.Screen
              name="Daily"
              component={DailyNavigator}
              options={{ presentation: "modal" }}
            />

            {/* 프로필 스택 */}
            <Stack.Screen
              name="Profile"
              component={ProfileNavigator}
              options={{ presentation: "modal" }}
            />

            {/* 기타 모달 스크린들 */}
            <Stack.Group screenOptions={{ presentation: "modal" }}>
              <Stack.Screen
                name="TransactionEdit"
                component={TransactionEditScreen}
              />
              <Stack.Screen
                name="LinkGeneration"
                component={LinkGenerationScreen}
              />
              <Stack.Screen name="LinkConfirm" component={LinkConfirmScreen} />
              <Stack.Screen name="LinkSuccess" component={LinkSuccessScreen} />
              <Stack.Screen name="LinkError" component={LinkErrorScreen} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});

export default AppRouter;
