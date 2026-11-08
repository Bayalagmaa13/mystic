import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks';
import { friendlyError, updateProfile } from '@/services/api';
import { maskDate, parseBirthDate } from '@/lib/format';
import { formatRange, glyph, signForDate } from '@/lib/zodiac';
import { colors, fonts } from '@/lib/theme';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card, Header } from '@/components/ui';

/** UPDATE: нэр, төрсөн огноо засах. Огноо өөрчлөгдөхөд DB trigger ордыг дахин тооцно. */
export default function EditProfile() {
  const session = useRequireAuth();
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [birth, setBirth] = useState(profile?.birth_date ?? '');
  const [errors, setErrors] = useState<{ name?: string; birth?: string }>({});
  const [saving, setSaving] = useState(false);

  const date = parseBirthDate(birth);
  const sign = date ? signForDate(date) : null;

  async function save() {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = 'Нэрээ оруулна уу';
    if (birth && !date) e.birth = 'ОООО-СС-ӨӨ хэлбэрээр бичнэ үү';
    setErrors(e);
    if (Object.keys(e).length || !session) return;
    setSaving(true);
    try {
      await updateProfile(session.user.id, { full_name: name.trim(), birth_date: birth || null });
      await refreshProfile();
      router.back();
    } catch (err) {
      Alert.alert('Алдаа', friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  return (
    <Screen scroll footer={<Button title="Хадгалах" onPress={save} loading={saving} />}>
      <Header title="Хувийн мэдээлэл" />
      <Input label="Овог нэр" value={name} onChangeText={setName} error={errors.name} />
      <Input label="Имэйл" value={session.user.email ?? ''} editable={false} style={{ color: colors.muted }} />
      <Input label="Төрсөн огноо" value={birth} onChangeText={(v) => setBirth(maskDate(v))} placeholder="ОООО-СС-ӨӨ" keyboardType="number-pad" icon="calendar-outline" maxLength={10} error={errors.birth} />
      {sign ? (
        <Card highlight style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: colors.lavender }}>
          <Txt style={{ fontSize: 28, color: colors.gold, fontFamily: fonts.regular }}>{glyph(sign)}</Txt>
          <View>
            <Txt variant="bodyStrong">{sign.name}</Txt>
            <Txt variant="small">{formatRange(sign)} · {sign.element} махбод</Txt>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
