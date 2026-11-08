import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useDebounced, useTopics } from '@/hooks';
import { friendlyError, getFavoriteIds, listReaders, toggleFavorite, PAGE_SIZE, type ReaderSort } from '@/services/api';
import { colors } from '@/lib/theme';
import type { TarotReader } from '@/lib/types';
import { Txt } from '@/components/Txt';
import { Input } from '@/components/Input';
import { ReaderCard } from '@/components/cards';
import { Chip, EmptyState, ErrorState, SkeletonList } from '@/components/ui';

const SORTS: { key: ReaderSort; label: string }[] = [
  { key: 'rating', label: 'Үнэлгээ ↓' },
  { key: 'price_asc', label: 'Хямд нь эхэнд' },
  { key: 'price_desc', label: 'Үнэтэй нь эхэнд' },
  { key: 'newest', label: 'Шинэ' },
];

export default function Readers() {
  const { session } = useAuth();
  const topics = useTopics();
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState<number | null>(null);
  const [sort, setSort] = useState<ReaderSort>('rating');
  const debounced = useDebounced(search);

  const [items, setItems] = useState<TarotReader[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const reqId = useRef(0); // хуучин хариу шинэ хариуг дарахаас сэргийлнэ

  const load = useCallback(async (p: number, mode: 'reset' | 'more' | 'refresh') => {
    const id = ++reqId.current;
    if (mode === 'reset') setLoading(true);
    if (mode === 'more') setLoadingMore(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    try {
      const res = await listReaders({ page: p, search: debounced, topicId, sort });
      if (id !== reqId.current) return;
      setItems((prev) => (p === 0 ? res.rows : [...prev, ...res.rows]));
      setTotal(res.total);
      setPage(p);
    } catch (e) {
      if (id === reqId.current) setError(friendlyError(e));
    } finally {
      if (id === reqId.current) { setLoading(false); setLoadingMore(false); setRefreshing(false); }
    }
  }, [debounced, topicId, sort]);

  // Хайлт, шүүлт, эрэмбэ өөрчлөгдөхөд эхний хуудаснаас дахин ачаална
  useEffect(() => { load(0, 'reset'); }, [load]);

  useEffect(() => {
    if (session) getFavoriteIds(session.user.id).then(setFavs).catch(() => {});
    else setFavs(new Set());
  }, [session]);

  const hasMore = items.length < total;
  // INFINITE SCROLL: жагсаалтын төгсгөлд ойртоход дараагийн хуудсыг татна
  const onEndReached = () => {
    if (!loading && !loadingMore && hasMore) load(page + 1, 'more');
  };

  async function onFav(id: string) {
    if (!session) return router.push('/login');
    const isFav = favs.has(id);
    // Optimistic update — сервер хариулахыг хүлээлгүй UI-г шууд шинэчилнэ
    setFavs((s) => { const n = new Set(s); isFav ? n.delete(id) : n.add(id); return n; });
    try {
      await toggleFavorite(session.user.id, id, isFav);
    } catch {
      setFavs((s) => { const n = new Set(s); isFav ? n.add(id) : n.delete(id); return n; });
    }
  }

  const header = (
    <View style={{ gap: 14, marginBottom: 14 }}>
      <Txt variant="h1">Таротчид</Txt>
      <Input value={search} onChangeText={setSearch} placeholder="Нэрээр хайх" icon="search" returnKeyType="search"
        right={search ? <Pressable hitSlop={8} onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.muted} /></Pressable> : null} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ marginRight: -20 }}>
        <Chip label="Бүгд" active={topicId === null} onPress={() => setTopicId(null)} />
        {topics.map((t) => (
          <Chip key={t.id} label={t.name} icon={t.icon as keyof typeof Ionicons.glyphMap} active={topicId === t.id} onPress={() => setTopicId(t.id)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="muted">{loading ? 'Хайж байна…' : `${total} таротчин`}</Txt>
        <Pressable hitSlop={8} onPress={() => setSort(SORTS[(SORTS.findIndex((s) => s.key === sort) + 1) % SORTS.length].key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="swap-vertical" size={14} color={colors.gold} />
          <Txt variant="gold" style={{ fontSize: 12 }}>{SORTS.find((s) => s.key === sort)?.label}</Txt>
        </Pressable>
      </View>
      {error ? <ErrorState message={error} onRetry={() => load(0, 'reset')} /> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={loading ? [] : items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ReaderCard reader={item} topics={topics} isFav={favs.has(item.id)} onFav={() => onFav(item.id)} onPress={() => router.push(`/reader/${item.id}`)} />
        )}
        ListEmptyComponent={
          loading ? <SkeletonList count={4} /> : !error ? (
            <EmptyState icon="search-outline" title="Таротчин олдсонгүй" text="Өөр нэрээр хайх эсвэл шүүлтүүрээ өөрчилнө үү" action="Шүүлтүүр арилгах" onAction={() => { setSearch(''); setTopicId(null); }} />
          ) : undefined
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.gold} style={{ marginTop: 16 }} /> : !hasMore && items.length > PAGE_SIZE ? <Txt variant="small" style={{ textAlign: 'center', marginTop: 16 }}>Бүгдийг үзлээ ✦</Txt> : undefined}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(0, 'refresh')} tintColor={colors.gold} colors={[colors.gold]} progressBackgroundColor={colors.surface} />}
      />
    </SafeAreaView>
  );
}
