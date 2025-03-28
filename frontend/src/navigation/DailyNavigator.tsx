import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DailyStackParamList } from "../types";
import DailyDetailScreen from "../screens/daily/DailyDetailScreen";

const Stack = createNativeStackNavigator<DailyStackParamList>();

export function DailyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DailyDetail" component={DailyDetailScreen} />
    </Stack.Navigator>
  );
}
