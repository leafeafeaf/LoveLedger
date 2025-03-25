import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StoryStackParamList } from "../types";
import StorySettingsScreen from "../screens/story/StorySettingsScreen";
import SeriesSelectionScreen from "../screens/story/SeriesSelectionScreen";
import StoryGenerationScreen from "../screens/story/StoryGenerationScreen";
import CoverSelectionScreen from "../screens/story/CoverSelectionScreen";
import StorySaveScreen from "../screens/story/StorySaveScreen";

const Stack = createNativeStackNavigator<StoryStackParamList>();

export function StoryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StorySettings" component={StorySettingsScreen} />
      <Stack.Screen name="SeriesSelection" component={SeriesSelectionScreen} />
      <Stack.Screen name="StoryGeneration" component={StoryGenerationScreen} />
      <Stack.Screen name="CoverSelection" component={CoverSelectionScreen} />
      <Stack.Screen name="StorySave" component={StorySaveScreen} />
    </Stack.Navigator>
  );
}
