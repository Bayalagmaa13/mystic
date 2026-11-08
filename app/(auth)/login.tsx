import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/theme';
import { emailOk } from '@/lib/format';
import { friendlyError } from '@/services/api';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    // Формын шалгалт (validation)
    const next: typeof errors = {};
    if (!emailOk(email)) next.email = 'Зөв имэйл хаяг оруулна уу';
    if (password.length < 6) next.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return setServerError(friendlyError(error));
    router.replace('/');
  }

  return (
    <Screen glow scroll contentStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingTop: 24 }}>
      <View style={{ alignItems: 'center', gap: 12, marginTop: 24 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="moon" size={40} color={colors.gold} />
        </View>
        <Txt variant="display">Mystic</Txt>
        <Txt variant="muted" style={{ textAlign: 'center', fontSize: 14 }}>
          Зурхайгаа уншиж, таротчиндоо{'\n'}асуултаа илгээгээрэй
        </Txt>
      </View>

      <View style={{ gap: 12 }}>
        <Input label="Имэйл" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
        <Input label="Нууц үг" value={password} onChangeText={setPassword} placeholder="••••••••" password autoComplete="password" error={errors.password} onSubmitEditing={submit} />
        <Link href="/forgot" asChild>
          <Pressable hitSlop={8} style={{ alignSelf: 'flex-end' }}>
            <Txt variant="gold" style={{ fontSize: 12 }}>Нууц үгээ мартсан уу?</Txt>
          </Pressable>
        </Link>
        {serverError ? <ErrorState message={serverError} /> : null}
      </View>

      <View style={{ gap: 12 }}>
        <Button title="Нэвтрэх" onPress={submit} loading={loading} />
        <Button title="Зочноор үзэх" kind="ghost" onPress={() => router.replace('/')} />
        <Link href="/register" asChild>
          <Pressable style={{ alignSelf: 'center', padding: 6 }}>
            <Txt variant="muted">
              Бүртгэлгүй юу? <Txt variant="gold">Бүртгүүлэх</Txt>
            </Txt>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
