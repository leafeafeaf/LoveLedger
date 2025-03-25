import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ProfileEditScreen from "../screens/profile/ProfileEditScreen";
import GoalListScreen from "../screens/profile/GoalListScreen";
import GoalDetailScreen from "../screens/profile/GoalDetailScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="GoalList" component={GoalListScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
    </Stack.Navigator>
  );
}
