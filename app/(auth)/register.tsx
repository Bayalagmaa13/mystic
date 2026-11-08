import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { emailOk, maskDate, parseBirthDate } from '@/lib/format';
import { formatRange, glyph, signForDate } from '@/lib/zodiac';
import { colors, fonts } from '@/lib/theme';
import { friendlyError } from '@/services/api';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card, ErrorState, Header } from '@/components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', birth: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: k === 'birth' ? maskDate(v) : v }));

  // Төрсөн огноо бичих явцад ордыг шууд харуулна
  const birthDate = parseBirthDate(form.birth);
  const sign = useMemo(() => (birthDate ? signForDate(birthDate) : null), [form.birth]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const e: typeof errors = {};
    if (form.name.trim().length < 2) e.name = 'Нэрээ оруулна уу';
    if (!emailOk(form.email)) e.email = 'Зөв имэйл хаяг оруулна уу';
    if (!birthDate) e.birth = 'Огноог ОООО-СС-ӨӨ хэлбэрээр бичнэ үү (жишээ: 2003-04-12)';
    if (form.password.length < 8) e.password = 'Нууц үг хамгийн багадаа 8 тэмдэгт';
    else if (!/\d/.test(form.password)) e.password = 'Нууц үгэнд дор хаяж 1 тоо орсон байна';
    if (form.confirm !== form.password) e.confirm = 'Нууц үг таарахгүй байна';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setServerError(null);
    // full_name, birth_date-г metadata-гаар илгээнэ → DB trigger profile үүсгэж, ордыг тооцно
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim(), birth_date: form.birth } },
    });
    setLoading(false);
    if (error) return setServerError(friendlyError(error));

    if (!data.session) {
      Alert.alert('Имэйлээ шалгана уу', 'Бүртгэл үүслээ. Имэйлд ирсэн линк дээр дарж баталгаажуулаад нэвтэрнэ үү.');
      router.replace('/login');
    } else {
      router.replace('/');
    }
  }

  return (
    <Screen scroll>
      <Header />
      <View style={{ gap: 6 }}>
        <Txt variant="h1">Бүртгүүлэх</Txt>
        <Txt variant="muted" style={{ fontSize: 14 }}>Төрсөн өдрөөр тань ордыг автоматаар тодорхойлно</Txt>
      </View>

      <Input label="Овог нэр" value={form.name} onChangeText={set('name')} placeholder="Д.Болд" autoComplete="name" error={errors.name} />
      <Input label="Имэйл" value={form.email} onChangeText={set('email')} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <Input label="Төрсөн огноо" value={form.birth} onChangeText={set('birth')} placeholder="ОООО-СС-ӨӨ" keyboardType="number-pad" icon="calendar-outline" maxLength={10} error={errors.birth} />

      {sign ? (
        <Card highlight style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderColor: colors.lavender }}>
          <Txt style={{ fontSize: 28, color: colors.gold, fontFamily: fonts.regular }}>{glyph(sign)}</Txt>
          <View>
            <Txt variant="bodyStrong">Таны орд: {sign.name}</Txt>
            <Txt variant="small">{formatRange(sign)} · {sign.element} махбод</Txt>
          </View>
        </Card>
      ) : null}

      <Input label="Нууц үг" value={form.password} onChangeText={set('password')} placeholder="Хамгийн багадаа 8 тэмдэгт, 1 тоо" password error={errors.password} />
      <Input label="Нууц үг давтах" value={form.confirm} onChangeText={set('confirm')} placeholder="••••••••" password error={errors.confirm} />
      {serverError ? <ErrorState message={serverError} /> : null}
      <Button title="Бүртгэл үүсгэх" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
}
