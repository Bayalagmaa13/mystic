import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useTopics } from '@/hooks';
import { getHoroscope, listReaders } from '@/services/api';
import { SIGNS, glyph, signById } from '@/lib/zodiac';
import { moonPhase } from '@/lib/moon';
import { colors, fonts, gradients } from '@/lib/theme';
import { greeting, shortDate } from '@/lib/format';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Badge, IconButton, ScoreBar, SectionTitle, Skeleton, Card, ErrorState } from '@/components/ui';
import { ReaderCard } from '@/components/cards';
import { DailyCard } from '@/components/DailyCard';

export default function Home() {
  const { profile, session } = useAuth();
  const topics = useTopics();
  // Зочин эсвэл орд тодорхойгүй хэрэглэгч ордоо сонгож болно
  const [pickedSign, setPickedSign] = useState<number>(1);
  const signId = profile?.zodiac_sign_id ?? pickedSign;
  const sign = signById(signId)!;
  const moon = moonPhase();

  const horo = useQuery(() => getHoroscope(signId, new Date()), [signId]);
  const readers = useQuery(() => listReaders({ page: 0, sort: 'rating' }).then((r) => r.rows.slice(0, 3)), []);

  const refreshing = horo.refreshing || readers.refreshing;
  const onRefresh = () => { horo.refresh(); readers.refresh(); };
  const firstName = profile?.full_name?.split(' ').pop() || 'Зочин';

  return (
    <Screen glow scroll refreshing={refreshing} onRefresh={onRefresh}>
      {/* Толгой */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Txt variant="muted">{greeting()}</Txt>
          <Txt variant="h2">{firstName}</Txt>
        </View>
        {session ? (
          <IconButton icon="notifications-outline" onPress={() => router.push('/orders')} />
        ) : (
          <Pressable onPress={() => router.push('/login')} style={{ paddingHorizontal: 14, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.gold, justifyContent: 'center' }}>
            <Txt variant="gold" style={{ fontSize: 13 }}>Нэвтрэх</Txt>
          </Pressable>
        )}
      </View>

      {/* Өнөөдрийн зурхай */}
      <Pressable onPress={() => router.push(`/zodiac/${sign.slug}`)}>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderHi, padding: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="overline">ӨНӨӨДРИЙН ЗУРХАЙ · {shortDate(new Date())}</Txt>
            <Badge label={`${glyph(sign)} ${sign.name}`} bg={colors.gold} fg={colors.onGold} />
          </View>
          {horo.loading ? (
            <View style={{ gap: 8 }}>
              <Skeleton width="100%" height={12} /><Skeleton width="90%" height={12} /><Skeleton width="60%" height={12} />
            </View>
          ) : horo.error ? (
            <ErrorState message={horo.error} onRetry={horo.reload} />
          ) : (
            <>
              <Txt style={{ fontSize: 15, lineHeight: 23 }} numberOfLines={3}>
                {horo.data?.content ?? 'Өнөөдрийн зурхай удахгүй нэмэгдэнэ.'}
              </Txt>
              {horo.data ? (
                <View style={{ gap: 6 }}>
                  <ScoreBar label="Хайр" value={horo.data.love_score} />
                  <ScoreBar label="Ажил" value={horo.data.career_score} />
                </View>
              ) : null}
            </>
          )}
        </LinearGradient>
      </Pressable>

      {/* Орд сонгох — нэвтрээгүй эсвэл төрсөн огноогүй үед */}
      {!profile?.zodiac_sign_id ? <Txt variant="small">Ордоо сонгоод зурхайгаа уншаарай ↓</Txt> : null}

      {/* 12 орд */}
      <SectionTitle title="12 орд" action="Бүгдийг" onAction={() => router.push('/zodiac')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }} style={{ marginRight: -20 }}>
        {SIGNS.map((s) => {
          const active = s.id === signId;
          return (
            <Pressable
              key={s.id}
              onPress={() => (profile?.zodiac_sign_id ? router.push(`/zodiac/${s.slug}`) : setPickedSign(s.id))}
              style={{ alignItems: 'center', gap: 6, width: 62 }}
            >
              <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.surfaceHi : colors.surface, borderWidth: active ? 2 : 1, borderColor: active ? colors.gold : colors.border }}>
                <Txt style={{ fontSize: 22, color: active ? colors.gold : colors.textSoft, fontFamily: fonts.regular }}>{glyph(s)}</Txt>
              </View>
              <Txt style={{ fontSize: 11, color: active ? colors.gold : colors.textSoft }}>{s.name}</Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Өдрийн хөзөр */}
      <DailyCard />

      {/* Сарны фаз + Ордын тохироо */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 6 }}>
          <Ionicons name={moon.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.gold} />
          <Txt variant="bodyStrong">{moon.name}</Txt>
          <Txt variant="small">{moon.illumination}% гэрэлтэй · {moon.age}-р өдөр</Txt>
          <Txt variant="small" style={{ color: colors.textSoft }}>{moon.tip}</Txt>
        </Card>
        <Card style={{ flex: 1, gap: 6 }} highlight onPress={() => router.push('/compatibility')}>
          <Ionicons name="heart-half-outline" size={26} color={colors.danger} />
          <Txt variant="bodyStrong">Ордын тохироо</Txt>
          <Txt variant="small">Хайртай хүнтэйгээ хэр тохирох вэ?</Txt>
          <Txt variant="gold" style={{ fontSize: 12, marginTop: 'auto' }}>Шалгах →</Txt>
        </Card>
      </View>

      {/* Онцлох таротчид */}
      <SectionTitle title="Онцлох таротчид" action="Бүгдийг" onAction={() => router.push('/readers')} />
      {readers.loading ? (
        <Skeleton width="100%" height={84} radius={16} />
      ) : readers.error ? (
        <ErrorState message={readers.error} onRetry={readers.reload} />
      ) : (
        readers.data?.map((r) => (
          <ReaderCard key={r.id} reader={r} topics={topics} compact onPress={() => router.push(`/reader/${r.id}`)} />
        ))
      )}
    </Screen>
  );
}
