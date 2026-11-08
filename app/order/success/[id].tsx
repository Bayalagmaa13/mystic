import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@/hooks';
import { getOrder } from '@/services/api';
import { money } from '@/lib/format';
import { colors } from '@/lib/theme';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { Card, StatusBadge } from '@/components/ui';

export default function Success() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useQuery(() => getOrder(id), [id]);
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [scale]);

  const o = order.data;
  return (
    <Screen
      glow
      edges={['top', 'bottom']}
      contentStyle={{ justifyContent: 'center', alignItems: 'center', gap: 18 }}
      footer={
        <>
          <Button title="Захиалгаа харах" onPress={() => router.replace(`/order/${id}`)} />
          <Button title="Нүүр хуудас" kind="ghost" onPress={() => router.replace('/')} />
        </>
      }
    >
      <Animated.View style={{ transform: [{ scale }], width: 120, height: 120, borderRadius: 60, backgroundColor: '#143A2E', borderWidth: 2, borderColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="checkmark" size={60} color={colors.success} />
      </Animated.View>
      <Txt variant="h1" style={{ textAlign: 'center' }}>Төлбөр амжилттай</Txt>
      <Txt variant="muted" style={{ textAlign: 'center', fontSize: 14 }}>
        Таны асуулт {o?.tarot_readers?.name ?? 'таротчин'}д илгээгдлээ.{'\n'}Хариулт ирэхэд танд мэдэгдэл очно.
      </Txt>
      {o ? (
        <Card style={{ alignSelf: 'stretch', gap: 12 }}>
          <Row k="Захиалга" v={<Txt variant="bodyStrong">#{o.order_no}</Txt>} />
          <Row k="Сэдэв" v={<Txt>{o.topics?.name} · {o.question_count} асуулт</Txt>} />
          <Row k="Дүн" v={<Txt variant="gold">{money(o.total_amount)}</Txt>} />
          <Row k="Төлөв" v={<StatusBadge status={o.status} />} />
        </Card>
      ) : null}
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Txt variant="muted" style={{ fontSize: 14 }}>{k}</Txt>
      {v}
    </View>
  );
}
