import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector } from "./hooks/reduxHooks";
import { RootStackParamList } from "./types";

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

const AppRouter = () => {
  // Redux에서 인증 상태 가져오기
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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

export default AppRouter;
