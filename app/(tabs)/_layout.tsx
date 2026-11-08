import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;
const tab = (title: string, icon: IconName, iconActive: IconName) => ({
  title,
  tabBarIcon: ({ focused, color }: { focused: boolean; color: ColorValue }) => (
    <Ionicons name={focused ? iconActive : icon} size={22} color={color as string} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.dim,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border, height: 84, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={tab('Нүүр', 'home-outline', 'home')} />
      <Tabs.Screen name="zodiac" options={tab('Зурхай', 'moon-outline', 'moon')} />
      <Tabs.Screen name="readers" options={tab('Тарот', 'albums-outline', 'albums')} />
      <Tabs.Screen name="orders" options={tab('Захиалга', 'receipt-outline', 'receipt')} />
      <Tabs.Screen name="profile" options={tab('Профайл', 'person-outline', 'person')} />
    </Tabs>
  );
}
