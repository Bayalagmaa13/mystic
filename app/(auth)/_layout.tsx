import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/lib/theme';

export default function AuthLayout() {
  const { session } = useAuth();
  // Нэвтэрсэн хэрэглэгч нэвтрэх дэлгэц рүү орох шаардлагагүй
  if (session) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
