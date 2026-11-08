import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { emailOk } from '@/lib/format';
import { colors } from '@/lib/theme';
import { friendlyError } from '@/services/api';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card, ErrorState, Header } from '@/components/ui';

/** Нууц үг сэргээх — Supabase имэйлээр сэргээх линк илгээнэ */
export default function Forgot() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!emailOk(email)) return setError('Зөв имэйл хаяг оруулна уу');
    setLoading(true);
    setError(null);
    const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/login'),
    });
    setLoading(false);
    if (e) return setError(friendlyError(e));
    setSent(true);
  }

  return (
    <Screen scroll>
      <Header />
      <Txt variant="h1">Нууц үг сэргээх</Txt>
      <Txt variant="muted" style={{ fontSize: 14 }}>Бүртгэлтэй имэйлээ оруулбал нууц үг шинэчлэх линк илгээнэ.</Txt>
      {sent ? (
        <Card highlight style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
          <Ionicons name="mail-open-outline" size={40} color={colors.success} />
          <Txt variant="h3">Линк илгээлээ</Txt>
          <Txt variant="muted" style={{ textAlign: 'center' }}>{email} хаягаа шалгана уу.</Txt>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          <Input label="Имэйл" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" />
          {error ? <ErrorState message={error} /> : null}
          <Button title="Линк илгээх" onPress={submit} loading={loading} />
        </View>
      )}
    </Screen>
  );
}
