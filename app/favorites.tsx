import { router } from 'expo-router';
import { useRequireAuth, useQuery, useTopics } from '@/hooks';
import { listFavorites, toggleFavorite } from '@/services/api';
import type { TarotReader } from '@/lib/types';
import { Screen } from '@/components/Screen';
import { ReaderCard } from '@/components/cards';
import { EmptyState, ErrorState, Header, SkeletonList } from '@/components/ui';

export default function Favorites() {
  const session = useRequireAuth();
  const topics = useTopics();
  const uid = session?.user.id;
  const q = useQuery(() => (uid ? listFavorites(uid) : Promise.resolve([] as TarotReader[])), [uid], { refetchOnFocus: true });

  async function remove(id: string) {
    if (!uid) return;
    q.setData((l) => l?.filter((r) => r.id !== id) ?? l);
    try { await toggleFavorite(uid, id, true); } catch { q.silent(); }
  }

  return (
    <Screen scroll refreshing={q.refreshing} onRefresh={q.refresh}>
      <Header title="Дуртай таротчид" />
      {q.loading ? <SkeletonList /> : q.error ? <ErrorState message={q.error} onRetry={q.reload} /> : !q.data?.length ? (
        <EmptyState icon="heart-outline" title="Дуртай таротчин алга" text="Таротчны карт дээрх ♡ дээр дарж хадгалаарай" action="Таротчид үзэх" onAction={() => router.push('/readers')} />
      ) : (
        q.data.map((r) => (
          <ReaderCard key={r.id} reader={r} topics={topics} isFav onFav={() => remove(r.id)} onPress={() => router.push(`/reader/${r.id}`)} />
        ))
      )}
    </Screen>
  );
}
