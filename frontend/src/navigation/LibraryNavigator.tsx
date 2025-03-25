// src/navigation/LibraryNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryStackParamList } from "../types";
import LibraryScreen from "../screens/library/LibraryScreen";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      {/* 필요하다면 여기에 추가 스크린을 정의할 수 있습니다 */}
      {/* <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} /> */}
      {/* <Stack.Screen name="StoryDetail" component={StoryDetailScreen} /> */}
    </Stack.Navigator>
  );
}