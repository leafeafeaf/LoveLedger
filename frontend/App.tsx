import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import AppRouter from "./src/AppRouter";
import { theme } from "./src/utils/theme";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/api/queryClient";

export default function App() {
  const [fontsLoaded] = useFonts({
    OTEnjoystoriesBA: require("./assets/fonts/OTEnjoy Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider style={styles.container}>
            <Toaster />
            <AppRouter />
          </SafeAreaProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
