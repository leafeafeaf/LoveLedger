import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MainTabParamList } from "./navigation";
import { theme } from "../utils/theme";
import LibraryScreen from "../screens/library/LibraryScreen";
import DashboardScreen from "../screens/main/DashboardScreen";
import MainScreen from "../screens/main/MainScreen";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
});

export function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap: Record<
            keyof MainTabParamList,
            { outline: string; filled: string }
          > = {
            Dashboard: {
              outline: "view-dashboard-outline",
              filled: "view-dashboard",
            },
            Main: {
              outline: "home-outline",
              filled: "home",
            },
            Library: {
              outline: "book-open-page-variant-outline",
              filled: "book-open-page-variant",
            },
          };

          const icons = iconMap[route.name];
          const iconName = focused ? icons.filled : icons.outline;

          return (
            <MaterialCommunityIcons
              name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}
