import { useState } from 'react';
import { Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@/hooks';
import { getHoroscope } from '@/services/api';
import { SIGNS, formatRange, glyph, signBySlug } from '@/lib/zodiac';
import { colors, fonts, gradients } from '@/lib/theme';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card, Chip, Divider, EmptyState, ErrorState, Header, IconButton, ScoreBar, Skeleton } from '@/components/ui';

const DAYS = [
  { key: -1, label: 'Өчигдөр' },
  { key: 0, label: 'Өнөөдөр' },
  { key: 1, label: 'Маргааш' },
];

export default function SignDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const sign = signBySlug(slug) ?? SIGNS[0];
  const [offset, setOffset] = useState(0);

  const date = new Date();
  date.setDate(date.getDate() + offset);
  const horo = useQuery(() => getHoroscope(sign.id, date), [sign.id, offset]);

  const share = () =>
    horo.data &&
    Share.share({ message: `${sign.name} ${glyph(sign)} — ${DAYS.find((d) => d.key === offset)?.label}\n\n${horo.data.content}\n\n— Mystic апп` });

  return (
    <Screen scroll glow refreshing={horo.refreshing} onRefresh={horo.refresh}>
      <Header title="Ордын зурхай" right={<IconButton icon="share-social-outline" onPress={share} />} />

      <View style={{ alignItems: 'center', gap: 6 }}>
        <LinearGradient colors={gradients.avatars[1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontSize: 50, lineHeight: 62, color: colors.onGold, fontFamily: fonts.regular }}>{glyph(sign)}</Txt>
        </LinearGradient>
        <Txt variant="h1">{sign.name}</Txt>
        <Txt variant="muted">{formatRange(sign)} · {sign.element} махбод · {sign.planet}</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        {DAYS.map((d) => (
          <Chip key={d.key} label={d.label} active={offset === d.key} onPress={() => setOffset(d.key)} />
        ))}
      </View>

      {horo.loading ? (
        <Card style={{ gap: 10 }}>
          <Skeleton width="100%" height={12} /><Skeleton width="95%" height={12} /><Skeleton width="70%" height={12} />
        </Card>
      ) : horo.error ? (
        <ErrorState message={horo.error} onRetry={horo.reload} />
      ) : !horo.data ? (
        <EmptyState icon="moon-outline" title="Зурхай нэмэгдээгүй байна" text="Энэ өдрийн зурхайг удахгүй нэмнэ." />
      ) : (
        <>
          <Card style={{ gap: 12 }}>
            <Txt style={{ fontSize: 15, lineHeight: 24 }}>{horo.data.content}</Txt>
            <Divider />
            <ScoreBar label="Хайр" value={horo.data.love_score} />
            <ScoreBar label="Ажил" value={horo.data.career_score} />
            <ScoreBar label="Санхүү" value={horo.data.money_score} />
            <ScoreBar label="Эрүүл мэнд" value={horo.data.health_score} />
          </Card>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Mini label="Азын өнгө" value={horo.data.lucky_color} />
            <Mini label="Азын тоо" value={String(horo.data.lucky_number)} />
            <Mini label="Махбод" value={sign.element} />
          </View>
        </>
      )}

      <Card style={{ gap: 6 }}>
        <Txt variant="overline">ОРДЫН ОНЦЛОГ</Txt>
        <Txt variant="muted" style={{ fontSize: 14, color: colors.textSoft }}>{sign.traits}</Txt>
      </Card>

      <Card highlight onPress={() => router.push('/readers')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong">Илүү тодорхой хариулт хэрэгтэй юу?</Txt>
          <Txt variant="small">Таротчинд асуултаа илгээгээрэй</Txt>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gold} />
      </Card>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, padding: 12, gap: 4 }}>
      <Txt variant="small" style={{ fontSize: 11 }}>{label}</Txt>
      <Txt variant="bodyStrong">{value}</Txt>
    </Card>
  );
}
