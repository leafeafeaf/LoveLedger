import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StoryStackParamList } from "../types";
import StorySelectionScreen from "../screens/story/StorySelectionScreen";
import StorySettingsScreen from "../screens/story/StorySettingsScreen";
import SeriesSelectionScreen from "../screens/story/SeriesSelectionScreen";
import StoryGenerationScreen from "../screens/story/StoryGenerationScreen";
import CoverSelectionScreen from "../screens/story/CoverSelectionScreen";
import CoverPreviewScreen from "../screens/story/CoverPreviewScreen";
import StorySaveScreen from "../screens/story/StorySaveScreen";

const Stack = createNativeStackNavigator<StoryStackParamList>();

export function StoryNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="StorySelection" component={StorySelectionScreen} />
      <Stack.Screen name="StorySettings" component={StorySettingsScreen} />
      <Stack.Screen name="SeriesSelection" component={SeriesSelectionScreen} />
      <Stack.Screen name="StoryGeneration" component={StoryGenerationScreen} />
      <Stack.Screen name="CoverSelection" component={CoverSelectionScreen} />
      <Stack.Screen name="CoverPreview" component={CoverPreviewScreen} />
      <Stack.Screen name="StorySave" component={StorySaveScreen} />
    </Stack.Navigator>
  );
}
