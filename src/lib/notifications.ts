import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { updateProfile } from '@/services/api';

// Апп нээлттэй үед ирсэн мэдэгдлийг ч харуулна
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Push мэдэгдлийн зөвшөөрөл авч, Expo push token-ийг profiles.push_token-д хадгална.
 * Edge Function энэ token руу «Төлбөр амжилттай» зэрэг мэдэгдэл илгээнэ.
 * Анхаар: Android дээр Expo Go push дэмжихгүй — EAS Build (APK) дээр ажиллана.
 */
export async function registerForPush(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Mystic',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#E8C27A',
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('app.json → extra.eas.projectId хоосон байна. `npx eas init` ажиллуулна уу.');
    return null;
  }
  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await updateProfile(userId, { push_token: token });
    return token;
  } catch (e) {
    console.warn('Push token авч чадсангүй', e);
    return null;
  }
}

export async function disablePush(userId: string) {
  await updateProfile(userId, { push_token: null });
}

/** Өдөр бүр өглөө 9 цагт «Өнөөдрийн зурхай» сануулга (локал мэдэгдэл) */
export async function scheduleDailyReminder(enabled: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Өнөөдрийн зурхай бэлэн ✦', body: 'Ордын тань өнөөдрийн зурхай, өдрийн хөзөр хүлээж байна.', data: { url: '/' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
  });
}
