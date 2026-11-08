import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SIGNS, formatRange, glyph } from '@/lib/zodiac';
import { colors, fonts } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/ui';

const ELEMENT_COLOR: Record<string, string> = { Гал: '#F08A6C', Шороо: '#C9A46B', Хий: '#8EE3D0', Ус: '#7FB2FF' };

export default function ZodiacTab() {
  const { profile } = useAuth();
  return (
    <Screen scroll glow>
      <Txt variant="h1">Зурхай</Txt>
      <Txt variant="muted">Ордоо сонгож, өчигдөр, өнөөдөр, маргаашийн зурхайгаа уншаарай.</Txt>

      <Card highlight onPress={() => router.push('/compatibility')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name="heart-half-outline" size={26} color={colors.danger} />
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong">Ордын тохироо</Txt>
          <Txt variant="small">Хоёр ордын хайр, нөхөрлөл, ажлын тохироог тооцоол</Txt>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gold} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
        {SIGNS.map((s) => {
          const mine = s.id === profile?.zodiac_sign_id;
          return (
            <Pressable key={s.id} onPress={() => router.push(`/zodiac/${s.slug}`)} style={{ width: '31.5%' }}>
              <View style={{ alignItems: 'center', gap: 4, paddingVertical: 16, borderRadius: 16, backgroundColor: mine ? colors.surfaceHi : colors.surface, borderWidth: mine ? 2 : 1, borderColor: mine ? colors.gold : colors.border }}>
                <Txt style={{ fontSize: 30, lineHeight: 38, color: mine ? colors.gold : colors.text, fontFamily: fonts.regular }}>{glyph(s)}</Txt>
                <Txt variant="bodyStrong">{s.name}</Txt>
                <Txt variant="small" style={{ fontSize: 10 }}>{formatRange(s)}</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ELEMENT_COLOR[s.element] }} />
                  <Txt style={{ fontSize: 10, color: colors.textSoft }}>{s.element}</Txt>
                </View>
                {mine ? <Txt variant="gold" style={{ fontSize: 10 }}>Таны орд</Txt> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
