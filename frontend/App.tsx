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
    ChosunNm: require("./assets/fonts/ChosunNm.ttf"),
    HeirofLightBold: require("./assets/fonts/HeirofLightBold.ttf"),
    HeirofLightRegular: require("./assets/fonts/HeirofLightRegular.ttf"),
    OTEnjoyBold: require("./assets/fonts/OTEnjoy Bold.ttf"),
    OTEnjoyLight: require("./assets/fonts/OTEnjoy Light.ttf"),
    OTEnjoyMedium: require("./assets/fonts/OTEnjoy Medium.ttf"),
    ShillaCultureB: require("./assets/fonts/Shilla_Culture(B).ttf"),
    ShillaCultureM: require("./assets/fonts/Shilla_Culture(M).ttf"),
    Shilla_CultureB: require("./assets/fonts/Shilla_Culture(B).ttf"),
    GangwonEdu: require("./assets/fonts/강원교육새음.ttf"),
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
