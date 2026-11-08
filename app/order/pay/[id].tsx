import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Image, Linking, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrderRealtime, useRequireAuth } from '@/hooks';
import { checkPayment, createInvoice, friendlyError, getOrder } from '@/services/api';
import { money } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import type { Order, Payment } from '@/lib/types';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { Badge, Card, ErrorState, Header, Skeleton } from '@/components/ui';

/**
 * ТӨЛБӨРИЙН УРСГАЛ
 * 1. Edge Function «qpay-create-invoice» → QPay нэхэмжлэх (QR + банкны линк)
 * 2. Хэрэглэгч банкны апп руу шилжиж (deep link) төлнө
 * 3. QPay → «qpay-webhook» → orders.status = 'paid'
 * 4. Realtime-аар энэ дэлгэц шууд мэдэж, амжилттай дэлгэц рүү шилжинэ
 */
export default function Pay() {
  const session = useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const done = useRef(false);

  const goSuccess = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.replace(`/order/success/${id}`);
  }, [id]);

  const init = useCallback(async () => {
    setError(null);
    try {
      const o = await getOrder(id);
      setOrder(o);
      if (o.status === 'paid' || o.status === 'answered') return goSuccess();
      if (o.status === 'cancelled') return setError('Энэ захиалга цуцлагдсан байна');
      setPayment(await createInvoice(id));
    } catch (e) {
      setError(friendlyError(e));
    }
  }, [id, goSuccess]);

  useEffect(() => { if (session) init(); }, [session, init]);

  // REALTIME: webhook төлөвийг «paid» болгомогц энд мэдэгдэл ирнэ
  useOrderRealtime(session ? `id=eq.${id}` : null, (row) => {
    if (row.status === 'paid') goSuccess();
  });

  const check = useCallback(async (silent = false) => {
    if (!silent) setChecking(true);
    setNote(null);
    try {
      const r = await checkPayment(id);
      if (r.status === 'paid') goSuccess();
      else if (!silent) setNote('Төлбөр хараахан орж ирээгүй байна. Төлсөн бол хэдэн секунд хүлээгээд дахин шалгана уу.');
    } catch (e) {
      if (!silent) setNote(friendlyError(e));
    } finally {
      setChecking(false);
    }
  }, [id, goSuccess]);

  // Банкны аппаас буцаж ирэхэд автоматаар шалгана
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active' && payment) check(true); });
    return () => sub.remove();
  }, [payment, check]);

  async function openBank(link: string) {
    try {
      await Linking.openURL(link);
    } catch {
      setNote('Энэ банкны апп таны утсанд суугаагүй байна. QR кодыг уншуулна уу.');
    }
  }

  if (!session) return null;

  return (
    <Screen scroll footer={payment ? <Button title="Төлбөр шалгах" kind="ghost" icon="refresh" loading={checking} onPress={() => check(false)} /> : undefined}>
      <Header title="Төлбөр төлөх" />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gold }} />)}
      </View>

      <View style={{ alignItems: 'center', gap: 6 }}>
        <Txt variant="muted" style={{ fontSize: 14 }}>Төлөх дүн</Txt>
        <Txt style={{ fontFamily: fonts.display, fontSize: 36, lineHeight: 44, color: colors.gold }}>{order ? money(order.total_amount) : '—'}</Txt>
        {order ? <Txt variant="small">#{order.order_no} · {order.tarot_readers?.name} · {order.question_count} асуулт</Txt> : null}
        <Badge label="● Хүлээгдэж буй" bg="#3B2F14" fg={colors.warning} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={init} />
      ) : !payment ? (
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Skeleton width={220} height={220} radius={16} />
          <Txt variant="small">QPay нэхэмжлэх үүсгэж байна…</Txt>
        </View>
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ width: 220, height: 220, borderRadius: 16, backgroundColor: '#fff', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
              {payment.qr_image ? (
                <Image source={{ uri: `data:image/png;base64,${payment.qr_image}` }} style={{ width: 200, height: 200 }} />
              ) : (
                <ActivityIndicator color={colors.onGold} />
              )}
            </View>
            <Txt variant="small" style={{ textAlign: 'center' }}>QPay QR кодыг өөр утсаар уншуулах эсвэл доорх банкаа сонгоно уу</Txt>
          </View>

          {payment.deeplinks?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }} style={{ marginRight: -20 }}>
              {payment.deeplinks.map((b) => (
                <Pressable key={b.name} onPress={() => openBank(b.link)} style={{ width: 72, alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {b.logo ? <Image source={{ uri: b.logo }} style={{ width: 56, height: 56 }} /> : <Ionicons name="business-outline" size={24} color={colors.gold} />}
                  </View>
                  <Txt numberOfLines={2} style={{ fontSize: 10, textAlign: 'center', color: colors.textSoft }}>{b.description ?? b.name}</Txt>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <Card highlight style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderColor: colors.lavender }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.lavender} />
            <Txt variant="small" style={{ flex: 1, color: colors.textSoft }}>Төлбөр орсны дараа захиалгын төлөв автоматаар «Төлөгдсөн» болно.</Txt>
          </Card>
          {note ? <ErrorState message={note} /> : null}
        </>
      )}
    </Screen>
  );
}
