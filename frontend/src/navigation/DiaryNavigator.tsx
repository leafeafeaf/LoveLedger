import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../types";
import DiaryScreen from "../screens/diary/DiaryScreen";
import DailyDetailScreen from "../screens/diary/DailyDetailScreen";
import DiaryListScreen from "../screens/diary/DiaryListScreen";
import DiaryEditScreen from "../screens/diary/DiaryEditScreen";

const Stack = createNativeStackNavigator<DiaryStackParamList>();

export function DiaryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "modal",
      }}
    >
      <Stack.Screen name="DiaryList" component={DiaryListScreen} />
      <Stack.Screen name="DiaryCreate" component={DiaryScreen} />
      <Stack.Screen name="DailyDetail" component={DailyDetailScreen} />
      <Stack.Screen name="DiaryEdit" component={DiaryEditScreen} />
    </Stack.Navigator>
  );
}
