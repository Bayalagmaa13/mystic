import { useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useOrderRealtime, useQuery } from '@/hooks';
import { cancelOrder, deleteOrder, friendlyError, listMyOrders } from '@/services/api';
import { colors } from '@/lib/theme';
import type { Order } from '@/lib/types';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { OrderCard } from '@/components/cards';
import { Chip, EmptyState, ErrorState, SkeletonList } from '@/components/ui';

const FILTERS = [
  { key: null, label: 'Бүгд' },
  { key: 'pending', label: 'Хүлээгдэж буй' },
  { key: 'paid', label: 'Төлөгдсөн' },
  { key: 'answered', label: 'Хариулсан' },
  { key: 'cancelled', label: 'Цуцлагдсан' },
] as const;

export default function Orders() {
  const { session } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const uid = session?.user.id;
  const q = useQuery(() => (uid ? listMyOrders(uid, status) : Promise.resolve([] as Order[])), [uid, status], { refetchOnFocus: true });

  // Захиалгын төлөв серверт өөрчлөгдөхөд жагсаалтыг шууд шинэчилнэ
  useOrderRealtime(uid ? `user_id=eq.${uid}` : null, (row) => {
    q.setData((list) => list?.map((o) => (o.id === row.id ? { ...o, ...row } : o)) ?? list);
  });

  if (!session) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg, padding: 20, gap: 16 }}>
        <Txt variant="h1">Миний захиалгууд</Txt>
        <EmptyState icon="lock-closed-outline" title="Нэвтэрч орно уу" text="Захиалга үүсгэх, түүхээ харахын тулд нэвтэрнэ үү." action="Нэвтрэх" onAction={() => router.push('/login')} />
      </SafeAreaView>
    );
  }

  function confirmCancel(o: Order) {
    // Устгах / цуцлахаас өмнө баталгаажуулах цонх
    Alert.alert('Захиалгыг цуцлах уу?', `#${o.order_no} захиалга цуцлагдана.`, [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Цуцлах', style: 'destructive',
        onPress: async () => {
          try { await cancelOrder(o.id); q.silent(); } catch (e) { Alert.alert('Алдаа', friendlyError(e)); }
        },
      },
    ]);
  }

  function confirmDelete(o: Order) {
    Alert.alert('Захиалгыг устгах уу?', 'Энэ үйлдлийг буцаах боломжгүй.', [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Устгах', style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrder(o.id);
            q.setData((list) => list?.filter((x) => x.id !== o.id) ?? list);
          } catch (e) { Alert.alert('Алдаа', friendlyError(e)); }
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={q.loading ? [] : q.data ?? []}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 2 }}>
            <Txt variant="h1">Миний захиалгууд</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ marginRight: -20 }}>
              {FILTERS.map((f) => <Chip key={f.label} label={f.label} active={status === f.key} onPress={() => setStatus(f.key)} />)}
            </ScrollView>
            {q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : null}
          </View>
        }
        renderItem={({ item: o }) => (
          <OrderCard
            order={o}
            onPress={() => router.push(`/order/${o.id}`)}
            footer={
              o.status === 'pending' ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button title="Төлөх" size="sm" style={{ flex: 1 }} onPress={() => router.push(`/order/pay/${o.id}`)} />
                  <Button title="Цуцлах" size="sm" kind="ghost" style={{ flex: 1 }} onPress={() => confirmCancel(o)} />
                </View>
              ) : o.status === 'cancelled' ? (
                <Button title="Устгах" size="sm" kind="danger" icon="trash-outline" onPress={() => confirmDelete(o)} />
              ) : null
            }
          />
        )}
        ListEmptyComponent={
          q.loading ? <SkeletonList count={3} /> : !q.error ? (
            <EmptyState icon="receipt-outline" title="Захиалга алга байна" text="Таротчин сонгоод анхны асуултаа илгээгээрэй" action="Таротчид үзэх" onAction={() => router.push('/readers')} />
          ) : undefined
        }
        refreshControl={<RefreshControl refreshing={q.refreshing} onRefresh={q.refresh} tintColor={colors.gold} colors={[colors.gold]} progressBackgroundColor={colors.surface} />}
      />
    </SafeAreaView>
  );
}
