import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { StyleSheet } from "react-native";
import { RootStackParamList } from "./src/types/index";
import { MainNavigator } from "./src/navigation/MainNavigator";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import { StoryNavigator } from "./src/navigation/StoryNavigator";
import { DiaryNavigator } from "./src/navigation/DiaryNavigator";
import { theme } from "./src/utils/theme";

// Screens
import TransactionEditScreen from "./src/screens/transaction/TransactionEditScreen";
import LinkGenerationScreen from "./src/screens/link/LinkGenerationScreen";
import LinkConfirmScreen from "./src/screens/link/LinkConfirmScreen";
import LinkSuccessScreen from "./src/screens/link/LinkSuccessScreen";
import LinkErrorScreen from "./src/screens/link/LinkErrorScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false }}
        >
          {/* 인증 스택 */}
          <Stack.Screen name="Auth" component={AuthNavigator} />

          {/* 메인 탭 */}
          <Stack.Screen name="Main" component={MainNavigator} />

          {/* 스토리 스택 */}
          <Stack.Screen
            name="Story"
            component={StoryNavigator}
            options={{ presentation: "modal" }}
          />

          {/* 다이어리 스택 */}
          <Stack.Screen
            name="Diary"
            component={DiaryNavigator}
            options={{ presentation: "modal" }}
          />

          {/* 기타 모달 스크린들 */}
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen
              name="TransactionEdit"
              component={TransactionEditScreen}
            />
            <Stack.Screen
              name="LinkGeneration"
              component={LinkGenerationScreen}
            />
            <Stack.Screen name="LinkConfirm" component={LinkConfirmScreen} />
            <Stack.Screen name="LinkSuccess" component={LinkSuccessScreen} />
            <Stack.Screen name="LinkError" component={LinkErrorScreen} />
          </Stack.Group>
        </Stack.Navigator>
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

export default App;
