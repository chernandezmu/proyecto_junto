import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotConfigured } from '@/components/NotConfigured';
import { OfflineBanner } from '@/components/OfflineBanner';
import { AuthProvider, useAuth } from '@/lib/auth';
import { isConfigured } from '@/lib/supabase';
import { ThemeProvider, useTheme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();

// Al volver a la app se refrescan los datos (p. ej. el carné recién aprobado en el panel).
focusManager.setEventListener((setFocused) => {
  if (Platform.OS === 'web') return;
  const sub = AppState.addEventListener('change', (s) => setFocused(s === 'active'));
  return () => sub.remove();
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 20_000, retry: 1 } },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            {!isConfigured ? (
              fontsLoaded ? <NotConfigured /> : null
            ) : (
              <AuthProvider>
                <Navigation fontsLoaded={fontsLoaded} />
              </AuthProvider>
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Navigation({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { colors, scheme } = useTheme();
  const { session, loading, me, meLoading } = useAuth();

  const signedIn = !!session;
  const ready = fontsLoaded && !loading && (!signedIn || !meLoading);
  // Falta completar el registro: subir el carné (o volver a subirlo) o el perfil.
  const needsVerification = !!me && (me.verification === 'pending_upload' || me.verification === 'rejected');
  const needsProfile = !!me && !needsVerification && (me.fullName.trim() === '' || me.interests.length < 3);
  const onboarding = signedIn && (needsVerification || needsProfile);
  const inside = signedIn && !!me && !onboarding;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={onboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={inside}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="events" />
          <Stack.Screen name="plan" />
          <Stack.Screen name="me" />
          <Stack.Screen name="report" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Screen name="legal/[doc]" />
      </Stack>
    </>
  );
}
