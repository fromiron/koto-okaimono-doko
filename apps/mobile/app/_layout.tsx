import '@/src/global.css';
import '@/src/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '@/src/features/bootstrap/AppProviders';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F4FAFF' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="filters"
              options={{ animation: 'fade', presentation: 'transparentModal' }}
            />
            <Stack.Screen name="settings" />
            <Stack.Screen name="about" />
            <Stack.Screen name="store/[id]" />
          </Stack>
          <StatusBar style="dark" />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
