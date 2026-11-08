// Жагсаалтад давтагддаг карт компонентууд
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/lib/theme';
import { money, shortDate } from '@/lib/format';
import type { Order, TarotReader, Topic } from '@/lib/types';
import { Txt } from './Txt';
import { Avatar, Badge, Card, StatusBadge, hashSeed } from './ui';

export function ReaderCard({
  reader, topics, isFav, onFav, onPress, compact,
}: { reader: TarotReader; topics?: Topic[]; isFav?: boolean; onFav?: () => void; onPress?: () => void; compact?: boolean }) {
  const tags = (reader.reader_topics ?? [])
    .map((rt) => topics?.find((t) => t.id === rt.topic_id)?.name)
    .filter(Boolean) as string[];

  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={reader.name} uri={reader.photo_url} size={compact ? 48 : 56} seed={hashSeed(reader.name)} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="bodyStrong" style={{ fontSize: 15 }}>{reader.name}</Txt>
            {onFav ? (
              <Pressable hitSlop={10} onPress={onFav} accessibilityLabel="Дуртай">
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={21} color={isFav ? colors.gold : colors.muted} />
              </Pressable>
            ) : null}
          </View>
          <Txt variant="small">{reader.experience_years} жилийн туршлага</Txt>
          <Txt style={{ fontSize: 12, color: colors.gold }}>
            ★ {Number(reader.rating).toFixed(1)} <Txt variant="small">· {reader.review_count} үнэлгээ</Txt>
          </Txt>
        </View>
        {compact ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Txt variant="gold" style={{ fontFamily: fonts.bold }}>{money(reader.price_per_question)}</Txt>
            <Txt variant="small">/ асуулт</Txt>
          </View>
        ) : null}
      </View>
      {!compact ? (
        <>
          {tags.length ? (
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {tags.map((t) => <Badge key={t} label={t} />)}
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt>
              <Txt variant="gold" style={{ fontFamily: fonts.bold, fontSize: 16 }}>{money(reader.price_per_question)}</Txt>
              <Txt variant="small"> / асуулт</Txt>
            </Txt>
            <Txt style={{ fontSize: 12, color: colors.success }}>● Идэвхтэй</Txt>
          </View>
        </>
      ) : null}
    </Card>
  );
}

export function OrderCard({ order, onPress, footer }: { order: Order; onPress?: () => void; footer?: React.ReactNode }) {
  const name = order.tarot_readers?.name ?? 'Таротчин';
  return (
    <Card onPress={onPress} style={{ gap: 10, opacity: order.status === 'cancelled' ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge status={order.status} />
        <Txt variant="small">#{order.order_no} · {shortDate(order.created_at)}</Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={40} seed={hashSeed(name)} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong">{name}</Txt>
          <Txt variant="small">{order.topics?.name ?? ''} · {order.question_count} асуулт</Txt>
        </View>
        <Txt variant="bodyStrong">{money(order.total_amount)}</Txt>
      </View>
      {footer}
    </Card>
  );
}
