import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@/hooks';
import { getFavoriteIds, getReader, getReaderReviews, toggleFavorite } from '@/services/api';
import { calcTotal, DISCOUNTS, money, shortDate } from '@/lib/format';
import { colors, gradients } from '@/lib/theme';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { Avatar, Badge, Card, Divider, ErrorState, IconButton, SectionTitle, Skeleton, hashSeed } from '@/components/ui';

export default function ReaderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const reader = useQuery(() => getReader(id), [id]);
  const reviews = useQuery(() => getReaderReviews(id), [id]);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (session) getFavoriteIds(session.user.id).then((s) => setFav(s.has(id))).catch(() => {});
  }, [session, id]);

  async function onFav() {
    if (!session) return router.push('/login');
    setFav((f) => !f);
    try { await toggleFavorite(session.user.id, id, fav); } catch { setFav(fav); }
  }

  const r = reader.data;
  const seed = r ? hashSeed(r.name) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[gradients.avatars[seed % 4][0], '#3A2A6E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 170 }}>
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <IconButton icon="chevron-back" translucent onPress={() => router.back()} />
            <IconButton icon={fav ? 'heart' : 'heart-outline'} color={colors.gold} translucent onPress={onFav} />
          </SafeAreaView>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -48, gap: 14 }}>
          {reader.loading ? (
            <View style={{ gap: 12 }}>
              <Skeleton width={96} height={96} radius={48} />
              <Skeleton width="60%" height={18} />
              <Skeleton width="100%" height={60} />
            </View>
          ) : reader.error || !r ? (
            <ErrorState message={reader.error ?? 'Олдсонгүй'} onRetry={reader.reload} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
                <Avatar name={r.name} uri={r.photo_url} size={96} seed={seed} ring />
                <View style={{ paddingBottom: 6, gap: 2 }}>
                  <Txt variant="h2">{r.name}</Txt>
                  <Txt style={{ fontSize: 12, color: colors.gold }}>
                    ★ {Number(r.rating).toFixed(1)} <Txt variant="small">· {r.review_count} үнэлгээ · {r.experience_years} жил</Txt>
                  </Txt>
                </View>
              </View>
              <Txt variant="muted" style={{ fontSize: 14, lineHeight: 21 }}>{r.bio}</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {r.reader_topics?.map((rt) => rt.topics && <Badge key={rt.topic_id} label={rt.topics.name} />)}
              </View>

              <SectionTitle title="Үнийн багц" />
              <Card style={{ paddingVertical: 4 }}>
                {[1, 3, 5].map((n, i) => (
                  <View key={n}>
                    {i > 0 ? <Divider /> : null}
                    <View style={{ height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Txt>{n} асуулт</Txt>
                        {DISCOUNTS[n] ? <Badge label={`-${DISCOUNTS[n]}%`} bg="#143A2E" fg={colors.success} /> : null}
                      </View>
                      <Txt variant="bodyStrong">{money(calcTotal(r.price_per_question, n))}</Txt>
                    </View>
                  </View>
                ))}
              </Card>

              <SectionTitle title="Сэтгэгдэл" />
              {reviews.data?.length ? (
                reviews.data.map((rv) => (
                  <Card key={rv.id} style={{ gap: 6, paddingVertical: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Txt variant="bodyStrong" style={{ fontSize: 13 }}>{rv.reviewer_name}</Txt>
                      <Txt style={{ color: colors.gold, fontSize: 12 }}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</Txt>
                    </View>
                    {rv.comment ? <Txt variant="muted" style={{ fontSize: 12 }}>{rv.comment}</Txt> : null}
                    <Txt variant="small" style={{ fontSize: 10 }}>{shortDate(rv.created_at)}</Txt>
                  </Card>
                ))
              ) : (
                <Txt variant="muted">Одоогоор апп дээр сэтгэгдэл бичигдээгүй байна.</Txt>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {r ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button title="Асуулт илгээх" icon="sparkles" onPress={() => router.push({ pathname: '/order/new', params: { readerId: r.id } })} />
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
});
