import { useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Platform, Pressable, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks';
import { friendlyError, orderStats, updateProfile } from '@/services/api';
import { compressImage, pickImage, uploadAvatar, type ImageSource } from '@/lib/image';
import { disablePush, registerForPush, scheduleDailyReminder } from '@/lib/notifications';
import { glyph, signById } from '@/lib/zodiac';
import { colors, fonts } from '@/lib/theme';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { Avatar, Badge, Card, Divider, EmptyState, hashSeed } from '@/components/ui';

export default function ProfileTab() {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const stats = useQuery(() => (session ? orderStats(session.user.id) : Promise.resolve(null)), [session?.user.id], { refetchOnFocus: true });
  const [uploading, setUploading] = useState(false);
  const [pushOn, setPushOn] = useState(!!profile?.push_token);
  const [dailyOn, setDailyOn] = useState(false);

  if (!session || !profile) {
    return (
      <Screen glow>
        <Txt variant="h1">Профайл</Txt>
        <EmptyState icon="person-circle-outline" title="Та зочноор үзэж байна" text="Нэвтэрснээр ордоо хадгалж, таротчинд асуулт илгээх боломжтой." action="Нэвтрэх / Бүртгүүлэх" onAction={() => router.push('/login')} />
      </Screen>
    );
  }

  const sign = signById(profile.zodiac_sign_id);
  const uid = session.user.id;

  // КАМЕР: камер эсвэл цомгоос сонгох → шахах → Storage руу илгээх
  async function changeAvatar(source: ImageSource) {
    try {
      const uri = await pickImage(source);
      if (!uri) return;
      setUploading(true);
      const small = await compressImage(uri);
      const url = await uploadAvatar(uid, small);
      await updateProfile(uid, { avatar_url: url });
      await refreshProfile();
    } catch (e) {
      Alert.alert('Зураг солиход алдаа гарлаа', friendlyError(e));
    } finally {
      setUploading(false);
    }
  }

  function askSource() {
    const options = ['Камераар авах', 'Цомгоос сонгох', 'Болих'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: 2 }, (i) => {
        if (i === 0) changeAvatar('camera');
        if (i === 1) changeAvatar('library');
      });
    } else {
      Alert.alert('Профайл зураг', undefined, [
        { text: options[0], onPress: () => changeAvatar('camera') },
        { text: options[1], onPress: () => changeAvatar('library') },
        { text: options[2], style: 'cancel' },
      ]);
    }
  }

  async function togglePush(v: boolean) {
    setPushOn(v);
    if (v) {
      const token = await registerForPush(uid);
      if (!token) {
        setPushOn(false);
        Alert.alert('Push мэдэгдэл', 'Зөвшөөрөл өгөөгүй эсвэл энэ төхөөрөмж дэмжихгүй байна (Expo Go дээр Android push ажиллахгүй, APK дээр ажиллана).');
      }
    } else {
      await disablePush(uid);
    }
    refreshProfile();
  }

  async function toggleDaily(v: boolean) {
    setDailyOn(v);
    try { await scheduleDailyReminder(v); } catch { setDailyOn(!v); }
  }

  function confirmLogout() {
    Alert.alert('Гарах уу?', undefined, [
      { text: 'Үгүй', style: 'cancel' },
      { text: 'Гарах', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);
  }

  return (
    <Screen scroll glow refreshing={stats.refreshing} onRefresh={stats.refresh}>
      <Txt variant="h1">Профайл</Txt>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Pressable onPress={askSource} disabled={uploading}>
          <Avatar name={profile.full_name || 'М'} uri={profile.avatar_url} size={104} seed={hashSeed(profile.full_name)} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.gold, borderWidth: 3, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            {uploading ? <ActivityIndicator size="small" color={colors.onGold} /> : <Ionicons name="camera" size={16} color={colors.onGold} />}
          </View>
        </Pressable>
        <Txt variant="h2">{profile.full_name || 'Нэргүй'}</Txt>
        <Txt variant="small">{session.user.email}</Txt>
        {sign ? <Badge label={`${glyph(sign)} ${sign.name} · ${profile.birth_date?.replaceAll('-', '.')}`} fg={colors.gold} /> : (
          <Pressable onPress={() => router.push('/profile/edit')}><Txt variant="gold" style={{ fontSize: 12 }}>Төрсөн огноогоо оруулж ордоо тодорхойлох →</Txt></Pressable>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat n={stats.data?.orders} label="Захиалга" onPress={() => router.push('/orders')} />
        <Stat n={stats.data?.favorites} label="Дуртай" onPress={() => router.push('/favorites')} />
        <Stat n={stats.data?.reviews} label="Үнэлгээ" />
      </View>

      <Card style={{ paddingVertical: 4 }}>
        <MenuRow icon="person-outline" label="Хувийн мэдээлэл" onPress={() => router.push('/profile/edit')} />
        <Divider />
        <MenuRow icon="heart-outline" label="Дуртай таротчид" onPress={() => router.push('/favorites')} />
        <Divider />
        <MenuRow icon="heart-half-outline" label="Ордын тохироо" onPress={() => router.push('/compatibility')} />
        <Divider />
        <MenuRow icon="notifications-outline" label="Захиалгын мэдэгдэл (push)" right={<Switch value={pushOn} onValueChange={togglePush} trackColor={{ true: colors.lavender, false: colors.border }} thumbColor="#fff" />} />
        <Divider />
        <MenuRow icon="alarm-outline" label="Өглөө 9 цагт зурхай сануулах" right={<Switch value={dailyOn} onValueChange={toggleDaily} trackColor={{ true: colors.lavender, false: colors.border }} thumbColor="#fff" />} />
      </Card>

      <Button title="Гарах" kind="danger" icon="log-out-outline" onPress={confirmLogout} />
    </Screen>
  );
}

function Stat({ n, label, onPress }: { n?: number; label: string; onPress?: () => void }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, padding: 12 }} onPress={onPress}>
      <Txt style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.gold }}>{n ?? '–'}</Txt>
      <Txt variant="small">{label}</Txt>
    </Card>
  );
}

function MenuRow({ icon, label, onPress, right }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ height: 54, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Ionicons name={icon} size={20} color={colors.textSoft} />
      <Txt style={{ flex: 1 }}>{label}</Txt>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
    </Pressable>
  );
}
