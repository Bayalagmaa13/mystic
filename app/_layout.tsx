import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { colors } from '@/lib/theme';
import '@/lib/notifications'; // мэдэгдлийн handler-ийг бүртгэнэ

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loading } = useAuth();

  // Push мэдэгдэл дээр дарахад тухайн захиалга руу шилжинэ
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res.notification.request.content.data as { orderId?: string; url?: string };
      if (data?.orderId) router.push(`/order/${data.orderId}`);
      else if (data?.url) router.push(data.url as never);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="order/success/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      <OfflineBanner />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
