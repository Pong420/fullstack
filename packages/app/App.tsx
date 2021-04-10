import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DialogContainer } from './components/Dialog';
import { AuthProvider } from './hooks/useAuth';
import { useCachedResources } from './hooks/useCachedResources';
import { useColorScheme } from './hooks/useColorScheme';
import { Navigation } from './navigation';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
          <DialogContainer />
        </AuthProvider>
      </SafeAreaProvider>
    );
  }
}