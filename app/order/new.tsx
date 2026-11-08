import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useRequireAuth } from '@/hooks';
import { createOrder, friendlyError, getReader } from '@/services/api';
import { calcTotal, DISCOUNTS, money } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Avatar, Card, ErrorState, Header, Skeleton, hashSeed } from '@/components/ui';

const COUNTS = [1, 3, 5] as const;
const MIN_LEN = 5;

/** CREATE: шинэ захиалга — сэдэв, асуултын тоо, асуултууд */
export default function NewOrder() {
  const session = useRequireAuth();
  const { readerId } = useLocalSearchParams<{ readerId: string }>();
  const reader = useQuery(() => getReader(readerId), [readerId]);

  const [topicId, setTopicId] = useState<number | null>(null);
  const [count, setCount] = useState<(typeof COUNTS)[number]>(1);
  const [questions, setQuestions] = useState<string[]>(['']);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const topics = useMemo(() => reader.data?.reader_topics?.map((rt) => rt.topics).filter(Boolean) ?? [], [reader.data]);
  useEffect(() => { if (!topicId && topics[0]) setTopicId(topics[0]!.id); }, [topics, topicId]);

  // Асуултын тоо өөрчлөгдөхөд талбаруудын тоог тааруулна (бичсэнийг хадгална)
  useEffect(() => {
    setQuestions((q) => Array.from({ length: count }, (_, i) => q[i] ?? ''));
  }, [count]);

  const unit = reader.data?.price_per_question ?? 0;
  const full = unit * count;
  const total = calcTotal(unit, count);
  const invalid = questions.map((q) => q.trim().length < MIN_LEN);
  const step = !topicId ? 1 : invalid.some(Boolean) ? 2 : 3;

  async function submit() {
    setTouched(true);
    if (!topicId) return setError('Сэдвээ сонгоно уу');
    if (invalid.some(Boolean)) return setError(`Асуулт бүр хамгийн багадаа ${MIN_LEN} тэмдэгт байна`);
    setSaving(true);
    setError(null);
    try {
      const order = await createOrder({ readerId, topicId, questions });
      router.replace(`/order/pay/${order.id}`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  return (
    <Screen
      scroll
      footer={
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="muted" style={{ fontSize: 14 }}>Нийт дүн</Txt>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              {DISCOUNTS[count] ? <Txt variant="small" style={{ textDecorationLine: 'line-through' }}>{money(full)}</Txt> : null}
              <Txt style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.gold }}>{money(total)}</Txt>
            </View>
          </View>
          <Button title="Төлбөр төлөх" icon="card-outline" onPress={submit} loading={saving} disabled={!reader.data} />
        </>
      }
    >
      <Header title="Шинэ захиалга" />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.gold : colors.border }} />
        ))}
      </View>

      {reader.loading ? (
        <Skeleton width="100%" height={64} radius={16} />
      ) : reader.error || !reader.data ? (
        <ErrorState message={reader.error ?? 'Таротчин олдсонгүй'} onRetry={reader.reload} />
      ) : (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
          <Avatar name={reader.data.name} size={40} seed={hashSeed(reader.data.name)} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong">{reader.data.name}</Txt>
            <Txt variant="small">{money(unit)} / асуулт</Txt>
          </View>
          <Pressable hitSlop={8} onPress={() => router.back()}><Txt variant="gold" style={{ fontSize: 12 }}>Солих</Txt></Pressable>
        </Card>
      )}

      <Txt variant="label">1. Сэдвээ сонгоно уу</Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {topics.map((t) => {
          const on = t!.id === topicId;
          return (
            <Pressable key={t!.id} onPress={() => setTopicId(t!.id)} style={{ flex: 1, height: 76, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: on ? colors.surfaceHi : colors.surface, borderWidth: on ? 2 : 1, borderColor: on ? colors.gold : colors.border }}>
              <Ionicons name={t!.icon as keyof typeof Ionicons.glyphMap} size={22} color={on ? colors.gold : colors.muted} />
              <Txt style={{ fontSize: 12, color: on ? colors.text : colors.textSoft, fontFamily: on ? fonts.semibold : fonts.regular }}>{t!.name}</Txt>
            </Pressable>
          );
        })}
      </View>

      <Txt variant="label">2. Асуултын тоо</Txt>
      <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        {COUNTS.map((n) => {
          const on = n === count;
          return (
            <Pressable key={n} onPress={() => setCount(n)} style={{ flex: 1, height: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.surfaceHi : 'transparent', borderWidth: on ? 1 : 0, borderColor: colors.lavender }}>
              <Txt variant="bodyStrong" style={{ fontSize: 15 }}>{n}</Txt>
              <Txt style={{ fontSize: 11, color: on ? colors.gold : colors.muted }}>{DISCOUNTS[n] ? `-${DISCOUNTS[n]}%` : money(unit)}</Txt>
            </Pressable>
          );
        })}
      </View>

      <Txt variant="label">3. Асуултаа бичнэ үү</Txt>
      {questions.map((q, i) => (
        <Input
          key={i}
          value={q}
          onChangeText={(v) => setQuestions((arr) => arr.map((x, j) => (j === i ? v : x)))}
          placeholder={i === 0 ? 'Жишээ: Тэр надад ямар бодолтой байгаа вэ?' : `${i + 1}-р асуулт`}
          multiline
          maxLength={500}
          error={touched && invalid[i] ? `Хамгийн багадаа ${MIN_LEN} тэмдэгт` : null}
        />
      ))}
      {error ? <ErrorState message={error} /> : null}
    </Screen>
  );
}
