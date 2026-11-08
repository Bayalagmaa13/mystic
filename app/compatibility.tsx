import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SIGNS, compatibility, glyph, signById, type Sign } from '@/lib/zodiac';
import { colors, fonts } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { Card, Header, IconButton, ScoreBar } from '@/components/ui';

/** ШИНЭЛЭГ БОЛОМЖ: Ордын тохироо — махбод, зурхайн тойрог дээрх зайгаар тооцно */
export default function Compatibility() {
  const { profile } = useAuth();
  const [a, setA] = useState<Sign>(signById(profile?.zodiac_sign_id) ?? SIGNS[0]);
  const [b, setB] = useState<Sign>(SIGNS[4]);
  const [result, setResult] = useState<ReturnType<typeof compatibility> | null>(null);
  const count = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    return () => count.removeListener(id);
  }, [count]);

  function calc() {
    const r = compatibility(a, b);
    setResult(r);
    count.setValue(0);
    Animated.timing(count, { toValue: r.score, duration: 900, useNativeDriver: false }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen scroll glow>
      <Header
        title="Ордын тохироо"
        right={result ? <IconButton icon="share-social-outline" onPress={() => Share.share({ message: `${a.name} ${glyph(a)} + ${b.name} ${glyph(b)} = ${result.score}% тохироо ✦ Mystic` })} /> : undefined}
      />

      <SignPicker title="Таны орд" value={a} onChange={(s) => { setA(s); setResult(null); }} />
      <View style={{ alignItems: 'center' }}>
        <Ionicons name="add-circle" size={30} color={colors.gold} />
      </View>
      <SignPicker title="Түүний орд" value={b} onChange={(s) => { setB(s); setResult(null); }} />

      <Button title="Тохироог тооцох" icon="sparkles" onPress={calc} />

      {result ? (
        <Card highlight style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Txt style={{ fontSize: 36, color: colors.gold, fontFamily: fonts.regular }}>{glyph(a)}</Txt>
            <Ionicons name="heart" size={22} color={colors.danger} />
            <Txt style={{ fontSize: 36, color: colors.gold, fontFamily: fonts.regular }}>{glyph(b)}</Txt>
          </View>
          <Txt style={{ fontFamily: fonts.display, fontSize: 52, lineHeight: 60, color: colors.gold }}>{shown}%</Txt>
          <Txt style={{ textAlign: 'center', color: colors.textSoft }}>{result.verdict}</Txt>
          <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 4 }}>
            <ScoreBar label="Хайр" value={result.love} max={100} />
            <ScoreBar label="Нөхөрлөл" value={result.friendship} max={100} />
            <ScoreBar label="Хамтын ажил" value={result.work} max={100} />
          </View>
          <Txt variant="small">{a.element} + {b.element} махбод</Txt>
        </Card>
      ) : null}
    </Screen>
  );
}

function SignPicker({ title, value, onChange }: { title: string; value: Sign; onChange: (s: Sign) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Txt variant="label">{title}: <Txt variant="gold">{value.name}</Txt></Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ marginRight: -20 }}>
        {SIGNS.map((s) => {
          const on = s.id === value.id;
          return (
            <Pressable key={s.id} onPress={() => onChange(s)} style={{ alignItems: 'center', gap: 4, width: 58 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.surfaceHi : colors.surface, borderWidth: on ? 2 : 1, borderColor: on ? colors.gold : colors.border }}>
                <Txt style={{ fontSize: 20, color: on ? colors.gold : colors.textSoft, fontFamily: fonts.regular }}>{glyph(s)}</Txt>
              </View>
              <Txt style={{ fontSize: 10, color: on ? colors.gold : colors.muted }}>{s.name}</Txt>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
