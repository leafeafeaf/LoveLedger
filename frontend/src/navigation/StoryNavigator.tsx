import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StoryStackParamList } from "../types";
import StorySettingsScreen from "../screens/story/StorySettingsScreen";
import SeriesSelectionScreen from "../screens/story/SeriesSelectionScreen";
import StoryGenerationScreen from "../screens/story/StoryGenerationScreen";
import StoryPreviewScreen from "../screens/story/StoryPreviewScreen";
import CoverSelectionScreen from "../screens/story/CoverSelectionScreen";
import CoverPreviewScreen from "../screens/story/CoverPreviewScreen";
import PublishingScreen from "../screens/story/PublishingScreen";

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
      <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
      <Stack.Screen name="CoverSelection" component={CoverSelectionScreen} />
      <Stack.Screen name="CoverPreview" component={CoverPreviewScreen} />
      <Stack.Screen name="Publishing" component={PublishingScreen} />
    </Stack.Navigator>
  );
}
