import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useOrderRealtime, useQuery, useRequireAuth } from '@/hooks';
import { cancelOrder, deleteOrder, friendlyError, getOrder, updateQuestion, upsertReview } from '@/services/api';
import { dateTime, money } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Review } from '@/lib/types';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar, Card, ErrorState, Header, Skeleton, StatusBadge, hashSeed } from '@/components/ui';

/** READ + UPDATE + DELETE: захиалгын дэлгэрэнгүй */
export default function OrderDetail() {
  const session = useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery(() => getOrder(id), [id]);
  const o = q.data;

  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Таротчин хариулахад (status → answered) дэлгэц шууд шинэчлэгдэнэ
  useOrderRealtime(session ? `id=eq.${id}` : null, () => q.silent());

  const review: Review | null = Array.isArray(o?.reviews) ? o?.reviews[0] ?? null : (o?.reviews as Review | null) ?? null;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  useEffect(() => { if (review) { setRating(review.rating); setComment(review.comment ?? ''); } }, [review?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  function startEdit() {
    setDrafts(Object.fromEntries((o?.order_questions ?? []).map((x) => [x.id, x.question])));
    setEditing(true);
  }

  async function saveEdit() {
    const bad = Object.values(drafts).some((v) => v.trim().length < 5);
    if (bad) return Alert.alert('Анхаар', 'Асуулт бүр хамгийн багадаа 5 тэмдэгт байна');
    setSaving(true);
    try {
      const changed = (o?.order_questions ?? []).filter((x) => drafts[x.id] !== x.question);
      await Promise.all(changed.map((x) => updateQuestion(x.id, drafts[x.id])));
      setEditing(false);
      q.silent();
    } catch (e) {
      Alert.alert('Алдаа', friendlyError(e));
    } finally { setSaving(false); }
  }

  function onCancel() {
    Alert.alert('Захиалгыг цуцлах уу?', 'Цуцалсан захиалгыг дахин сэргээх боломжгүй.', [
      { text: 'Үгүй', style: 'cancel' },
      { text: 'Цуцлах', style: 'destructive', onPress: async () => { try { await cancelOrder(id); q.silent(); } catch (e) { Alert.alert('Алдаа', friendlyError(e)); } } },
    ]);
  }

  function onDelete() {
    Alert.alert('Захиалгыг устгах уу?', 'Энэ үйлдлийг буцаах боломжгүй.', [
      { text: 'Үгүй', style: 'cancel' },
      { text: 'Устгах', style: 'destructive', onPress: async () => { try { await deleteOrder(id); router.back(); } catch (e) { Alert.alert('Алдаа', friendlyError(e)); } } },
    ]);
  }

  async function sendReview() {
    if (!rating) return Alert.alert('Анхаар', 'Од дээр дарж үнэлгээ өгнө үү');
    setSaving(true);
    try {
      await upsertReview(id, rating, comment.trim(), review?.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Баярлалаа!', 'Таны үнэлгээ хадгалагдлаа.');
      q.silent();
    } catch (e) {
      Alert.alert('Алдаа', friendlyError(e));
    } finally { setSaving(false); }
  }

  return (
    <Screen scroll refreshing={q.refreshing} onRefresh={q.refresh}>
      <Header title={o ? `#${o.order_no}` : 'Захиалга'} right={o ? <StatusBadge status={o.status} /> : undefined} />

      {q.loading ? (
        <View style={{ gap: 12 }}><Skeleton width="100%" height={64} radius={16} /><Skeleton width="100%" height={120} radius={16} /></View>
      ) : q.error || !o ? (
        <ErrorState message={q.error ?? 'Захиалга олдсонгүй'} onRetry={q.reload} />
      ) : (
        <>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }} onPress={() => router.push(`/reader/${o.reader_id}`)}>
            <Avatar name={o.tarot_readers?.name ?? '?'} size={44} seed={hashSeed(o.tarot_readers?.name ?? '')} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="bodyStrong">{o.tarot_readers?.name}</Txt>
              <Txt variant="small">{o.topics?.name} · {o.question_count} асуулт · {money(o.total_amount)}</Txt>
              <Txt variant="small" style={{ fontSize: 11 }}>{dateTime(o.created_at)}</Txt>
            </View>
          </Card>

          {/* Төлөвийн явц */}
          <Timeline status={o.status} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="h3">Асуултууд</Txt>
            {o.status === 'pending' && !editing ? (
              <Pressable hitSlop={8} onPress={startEdit} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <Ionicons name="create-outline" size={16} color={colors.gold} />
                <Txt variant="gold" style={{ fontSize: 13 }}>Засах</Txt>
              </Pressable>
            ) : null}
          </View>

          {(o.order_questions ?? []).map((x) => (
            <View key={x.id} style={{ gap: 8 }}>
              {editing ? (
                <Input label={`${x.position}-р асуулт`} value={drafts[x.id]} onChangeText={(v) => setDrafts((d) => ({ ...d, [x.id]: v }))} multiline maxLength={500} />
              ) : (
                <Card highlight style={{ gap: 4 }}>
                  <Txt variant="small">{x.position}-р асуулт</Txt>
                  <Txt style={{ lineHeight: 21 }}>{x.question}</Txt>
                </Card>
              )}
              {x.answer ? (
                <Card style={{ gap: 8, borderColor: colors.gold }}>
                  {x.card_name ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="albums" size={16} color={colors.gold} />
                      <Txt variant="gold" style={{ fontSize: 13 }}>Буусан хөзөр: {x.card_name}</Txt>
                    </View>
                  ) : null}
                  <Txt style={{ lineHeight: 22 }}>{x.answer}</Txt>
                </Card>
              ) : null}
            </View>
          ))}

          {editing ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Болих" kind="ghost" style={{ flex: 1 }} onPress={() => setEditing(false)} />
              <Button title="Хадгалах" style={{ flex: 1 }} loading={saving} onPress={saveEdit} />
            </View>
          ) : null}

          {o.status === 'paid' ? (
            <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Ionicons name="hourglass-outline" size={20} color={colors.info} />
              <Txt variant="muted" style={{ flex: 1 }}>Таротчин таны асуултыг уншиж байна. Хариулт ирэхэд мэдэгдэл очно.</Txt>
            </Card>
          ) : null}

          {/* Үнэлгээ — зөвхөн хариулт авсан үед */}
          {o.status === 'answered' ? (
            <Card style={{ gap: 12, alignItems: 'center' }}>
              <Txt variant="h3">{review ? 'Таны үнэлгээ' : 'Үйлчилгээг үнэлнэ үү'}</Txt>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} hitSlop={4} onPress={() => { setRating(n); Haptics.selectionAsync(); }}>
                    <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color={n <= rating ? colors.gold : colors.dim} />
                  </Pressable>
                ))}
              </View>
              <Input value={comment} onChangeText={setComment} placeholder="Сэтгэгдэл (заавал биш)" multiline maxLength={300} />
              <Button title={review ? 'Үнэлгээ шинэчлэх' : 'Үнэлгээ илгээх'} loading={saving} onPress={sendReview} />
            </Card>
          ) : null}

          {o.status === 'pending' && !editing ? (
            <View style={{ gap: 10 }}>
              <Button title="Төлбөр төлөх" icon="card-outline" onPress={() => router.push(`/order/pay/${o.id}`)} />
              <Button title="Захиалга цуцлах" kind="ghost" onPress={onCancel} />
              <Button title="Устгах" kind="danger" icon="trash-outline" onPress={onDelete} />
            </View>
          ) : o.status === 'cancelled' ? (
            <Button title="Устгах" kind="danger" icon="trash-outline" onPress={onDelete} />
          ) : null}
        </>
      )}
    </Screen>
  );
}

const STEPS = [
  { key: 'pending', label: 'Үүссэн', icon: 'document-text-outline' },
  { key: 'paid', label: 'Төлөгдсөн', icon: 'card-outline' },
  { key: 'answered', label: 'Хариулсан', icon: 'sparkles-outline' },
] as const;

function Timeline({ status }: { status: string }) {
  if (status === 'cancelled') return null;
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <Card style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 }}>
      {STEPS.map((s, i) => {
        const on = i <= idx;
        return (
          <View key={s.key} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.gold : colors.surfaceHi }}>
              <Ionicons name={s.icon} size={18} color={on ? colors.onGold : colors.dim} />
            </View>
            <Txt style={{ fontSize: 11, color: on ? colors.text : colors.dim }}>{s.label}</Txt>
          </View>
        );
      })}
    </Card>
  );
}
