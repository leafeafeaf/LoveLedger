// src/navigation/LibraryNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LibraryStackParamList } from "../types";
import LibraryScreen from "../screens/library/LibraryScreen";
import DiaryDetailScreen from "../screens/diary/DiaryDetailScreen";
import StoryDetailScreen from "../screens/story/StoryDetailScreen";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
    </Stack.Navigator>
  );
}