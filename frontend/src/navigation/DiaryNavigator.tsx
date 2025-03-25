import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../types";
import DiaryScreen from "../screens/diary/DiaryScreen";
import DiaryEditScreen from "../screens/diary/DiaryEditScreen";

const Stack = createNativeStackNavigator<DiaryStackParamList>();

export function DiaryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DiaryCreate" component={DiaryScreen} />
      <Stack.Screen name="DiaryEdit" component={DiaryEditScreen} />
    </Stack.Navigator>
  );
}
