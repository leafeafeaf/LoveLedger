import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import { StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import AppRouter from "./src/AppRouter";
import { theme } from "./src/utils/theme";
import { useFonts } from "expo-font";
import { useEffect } from "react";

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
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <AppRouter />
        </SafeAreaProvider>
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
