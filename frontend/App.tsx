import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from './utils/theme';

// Import screens
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import LibraryScreen from "./screens/LibraryScreen";
import MainScreen from "./screens/MainScreen";
import DashboardScreen from "./screens/DashboardScreen";
import DiaryScreen from "./screens/DiaryScreen";
import DailyDetailScreen from "./screens/DailyDetailScreen";
import StorySelectionScreen from "./screens/StorySelectionScreen";
import StorySettingsScreen from "./screens/StorySettingsScreen";
import SeriesSelectionScreen from "./screens/SeriesSelectionScreen";
import StoryGenerationScreen from "./screens/StoryGenerationScreen";
import CoverSelectionScreen from "./screens/CoverSelectionScreen";
import CoverPreviewScreen from "./screens/CoverPreviewScreen";
import StorySaveScreen from "./screens/StorySaveScreen";
import TransactionEditScreen from "./screens/TransactionEditScreen";
import ProfileMainScreen from "./screens/ProfileMainScreen";
import ProfileEditScreen from "./screens/ProfileEditScreen";
import GoalListScreen from "./screens/GoalListScreen";
import GoalDetailScreen from "./screens/GoalDetailScreen";
import LinkGenerationScreen from "./screens/LinkGenerationScreen";
import LinkConfirmScreen from "./screens/LinkConfirmScreen";
import LinkSuccessScreen from "./screens/LinkSuccessScreen";
import LinkErrorScreen from "./screens/LinkErrorScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopWidth: 0,
          elevation: 8,
          height: 90,
          paddingBottom: 20,
          paddingTop: 12,
          ...theme.shadows.medium,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'MainTab') {
            iconName = 'calendar-heart';
          } else if (route.name === 'Dashboard') {
            iconName = 'chart-box';
          } else if (route.name === 'Library') {
            iconName = 'bookshelf';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    ><Tab.Screen name="MainTab" component={MainScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Analysis' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} /></Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    ><Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Diary" component={DiaryScreen} />
      <Stack.Screen name="StorySelection" component={StorySelectionScreen} />
      <Stack.Screen name="StorySettings" component={StorySettingsScreen} />
      <Stack.Screen name="SeriesSelection" component={SeriesSelectionScreen} />
      <Stack.Screen name="StoryGeneration" component={StoryGenerationScreen} />
      <Stack.Screen name="CoverSelection" component={CoverSelectionScreen} />
      <Stack.Screen name="CoverPreview" component={CoverPreviewScreen} />
      <Stack.Screen name="StorySave" component={StorySaveScreen} />
      <Stack.Screen name="DailyDetail" component={DailyDetailScreen} />
      <Stack.Screen name="TransactionEdit" component={TransactionEditScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="GoalList" component={GoalListScreen} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <Stack.Screen name="LinkGeneration" component={LinkGenerationScreen} />
      <Stack.Screen name="LinkConfirm" component={LinkConfirmScreen} />
      <Stack.Screen name="LinkSuccess" component={LinkSuccessScreen} />
      <Stack.Screen name="LinkError" component={LinkErrorScreen} /></Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});