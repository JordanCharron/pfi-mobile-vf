import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { initDB } from '../db/database';
import { PanierProvider } from '../composants/PanierContext';

export default function RootLayout() {
  useEffect(() => {
    initDB().catch(e => {
      console.error('initDB FAILED:', e);
      Alert.alert('DB init échouée', String(e && e.message || e));
    });
  }, []);

  return (
    <PanierProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PanierProvider>
  );
}
