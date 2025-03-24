import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { StyleSheet } from 'react-native';
import AppRouter from './src/AppRouter';
import { theme } from './src/utils/theme';

function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <AppRouter />
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