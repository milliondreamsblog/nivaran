import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CasesProvider } from '../src/db/context';
import { LanguageProvider } from '../src/i18n';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CasesProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' }, animation: 'fade' }} />
        </CasesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
