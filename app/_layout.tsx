import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Linking from 'expo-linking';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../FirebaseConfig';

// Manages the app's initial state and redirects users based on authentication status.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialURL, setInitialURL] = useState<string | null | undefined>(undefined);
  const hasNavigated = useRef(false);

  /**
   * Effect to handle deep links by extracting the initial URL when the app starts.
   * Ignores Expo Go dev server URLs and cleans the URL for routing.
   */
  useEffect(() => {
    Linking.getInitialURL().then(url => {
      // Ignore Expo Go dev server URLs
      if (!url || url.startsWith('exp://') || url.startsWith('http')) {
        setInitialURL(null);
        return;
      }
      const cleaned = url.replace('matchdaymemories://', '');
      setInitialURL(cleaned && cleaned.length > 0 ? cleaned : null);
    });
  }, []);

  /**
   * Effect to listen for Firebase authentication state changes.
   * Updates the user state and stops loading when authentication is determined.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Effect to handle routing logic based on authentication and deep link state.
   * Redirects to tabs if user is authenticated, or to auth screens if not.
   * Handles deep links by replacing the current route.
   */
  useEffect(() => {
    if (loading) return;
    if (initialURL === undefined) return;
    if (hasNavigated.current) return;

    hasNavigated.current = true;

    if (initialURL) {
      router.replace(`/${initialURL}` as any);
      return;
    }

    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)');
    }
  }, [loading, initialURL, user, router]);

  /**
   * Effect to listen for incoming deep links while the app is running.
   * Updates the route when a new deep link is received.
   */
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const path = url.replace('matchdaymemories://', '');
      if (path) router.replace(`/${path}` as any);
    });
    return () => subscription.remove();
  }, [router]);

  // Shows loading spinner while determining authentication state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}