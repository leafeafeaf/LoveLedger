import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ViewProvider } from "./contexts/ViewContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

// 네비게이터 임포트
import { AuthNavigator } from "./navigation/AuthNavigator";
import { MainNavigator } from "./navigation/MainNavigator";
import { StoryNavigator } from "./navigation/StoryNavigator";
import { DiaryNavigator } from "./navigation/DiaryNavigator";
import { ProfileNavigator } from "./navigation/ProfileNavigator";

// 개별 화면 임포트
import TransactionEditScreen from "./screens/transaction/TransactionEditScreen";
import LinkGenerationScreen from "./screens/link/LinkGenerationScreen";
import LinkConfirmScreen from "./screens/link/LinkConfirmScreen";
import LinkSuccessScreen from "./screens/link/LinkSuccessScreen";
import LinkErrorScreen from "./screens/link/LinkErrorScreen";
import DailyDetailScreen from "./screens/diary/DailyDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppRouter = () => {
  // 나중에 상태 관리로 대체할 임시 상태, 테스트를 위해 true로 설정
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <ViewProvider>
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

              {/* 프로필 스택 */}
              <Stack.Screen name="Profile" component={ProfileNavigator} />

              {/* DailyDetail 화면 (루트 레벨에 위치) */}
              <Stack.Screen
                name="DailyDetail"
                component={DailyDetailScreen}
                options={{ presentation: "modal" }}
              />

              {/* 기타 모달 스크린들 */}
              <Stack.Group>
                <Stack.Screen
                  name="TransactionEdit"
                  component={TransactionEditScreen}
                />
                <Stack.Screen
                  name="LinkGeneration"
                  component={LinkGenerationScreen}
                />
                <Stack.Screen
                  name="LinkConfirm"
                  component={LinkConfirmScreen}
                />
                <Stack.Screen
                  name="LinkSuccess"
                  component={LinkSuccessScreen}
                />
                <Stack.Screen name="LinkError" component={LinkErrorScreen} />
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ViewProvider>
  );
};

export default AppRouter;
