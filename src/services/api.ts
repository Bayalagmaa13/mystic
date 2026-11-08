// Supabase-тэй харилцах бүх функц нэг дор — дэлгэцүүд эндээс дуудна.
import { supabase } from '@/lib/supabase';
import { isoDate } from '@/lib/format';
import type {
  DailyHoroscope, Order, OrderQuestion, Payment, Profile, Review, TarotReader, Topic,
} from '@/lib/types';

/** Supabase-ийн алдааг ойлгомжтой монгол мессеж болгоно */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (/Invalid login credentials/i.test(msg)) return 'Имэйл эсвэл нууц үг буруу байна';
  if (/User already registered/i.test(msg)) return 'Энэ имэйлээр бүртгэл үүссэн байна';
  if (/Email not confirmed/i.test(msg)) return 'Имэйлээ баталгаажуулна уу (ирсэн линк дээр дарна)';
  if (/Password should be/i.test(msg)) return 'Нууц үг хамгийн багадаа 6 тэмдэгт байна';
  if (/Network request failed|Failed to fetch/i.test(msg)) return 'Интернэт холболтоо шалгана уу';
  if (/rate limit/i.test(msg)) return 'Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу';
  return msg;
}

const throwIf = <T>(res: { data: T; error: unknown }) => {
  if (res.error) throw res.error;
  return res.data;
};

// ---------------------------------------------------------------- Profile
export async function getProfile(id: string) {
  return throwIf(await supabase.from('profiles').select('*').eq('id', id).single()) as Profile;
}

export async function updateProfile(id: string, patch: Partial<Pick<Profile, 'full_name' | 'birth_date' | 'avatar_url' | 'push_token'>>) {
  return throwIf(await supabase.from('profiles').update(patch).eq('id', id).select().single()) as Profile;
}

// ---------------------------------------------------------------- Horoscope
export async function getHoroscope(signId: number, date: Date) {
  const res = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('sign_id', signId)
    .eq('horoscope_date', isoDate(date))
    .maybeSingle();
  return throwIf(res) as DailyHoroscope | null;
}

// ---------------------------------------------------------------- Readers
export const PAGE_SIZE = 8;
export type ReaderSort = 'rating' | 'price_asc' | 'price_desc' | 'newest';

export async function listReaders(opts: { page: number; search?: string; topicId?: number | null; sort?: ReaderSort }) {
  const from = opts.page * PAGE_SIZE;
  // Сэдвээр шүүх үед «!inner» join ашиглан тухайн сэдэвтэй таротчдыг л авна
  let q = supabase
    .from('tarot_readers')
    .select(opts.topicId ? '*, reader_topics!inner(topic_id)' : '*, reader_topics(topic_id)', { count: 'exact' })
    .eq('is_active', true);

  if (opts.search?.trim()) q = q.ilike('name', `%${opts.search.trim()}%`);
  if (opts.topicId) q = q.eq('reader_topics.topic_id', opts.topicId);

  switch (opts.sort ?? 'rating') {
    case 'price_asc': q = q.order('price_per_question', { ascending: true }); break;
    case 'price_desc': q = q.order('price_per_question', { ascending: false }); break;
    case 'newest': q = q.order('created_at', { ascending: false }); break;
    default: q = q.order('rating', { ascending: false }).order('review_count', { ascending: false });
  }

  const res = await q.range(from, from + PAGE_SIZE - 1);
  if (res.error) throw res.error;
  return { rows: (res.data ?? []) as unknown as TarotReader[], total: res.count ?? 0 };
}

export async function getReader(id: string) {
  return throwIf(
    await supabase.from('tarot_readers').select('*, reader_topics(topic_id, topics(*))').eq('id', id).single(),
  ) as unknown as TarotReader;
}

export async function getTopics() {
  return throwIf(await supabase.from('topics').select('*').order('id')) as Topic[];
}

export async function getReaderReviews(readerId: string, limit = 5) {
  return throwIf(
    await supabase.from('reviews').select('*').eq('reader_id', readerId).order('created_at', { ascending: false }).limit(limit),
  ) as Review[];
}

// ---------------------------------------------------------------- Favorites
export async function getFavoriteIds(userId: string) {
  const rows = throwIf(await supabase.from('favorites').select('reader_id').eq('user_id', userId)) as { reader_id: string }[];
  return new Set(rows.map((r) => r.reader_id));
}

export async function listFavorites(userId: string) {
  const rows = throwIf(
    await supabase.from('favorites').select('tarot_readers(*, reader_topics(topic_id))').eq('user_id', userId).order('created_at', { ascending: false }),
  ) as unknown as { tarot_readers: TarotReader | null }[];
  return rows.map((r) => r.tarot_readers).filter(Boolean) as TarotReader[];
}

export async function toggleFavorite(userId: string, readerId: string, isFav: boolean) {
  if (isFav) {
    throwIf(await supabase.from('favorites').delete().eq('user_id', userId).eq('reader_id', readerId));
  } else {
    throwIf(await supabase.from('favorites').insert({ user_id: userId, reader_id: readerId }));
  }
  return !isFav;
}

// ---------------------------------------------------------------- Orders (CRUD)
/** CREATE: захиалга + асуултууд. Үнийг өгөгдлийн сангийн trigger тооцно. */
export async function createOrder(input: { readerId: string; topicId: number; questions: string[] }) {
  const count = input.questions.length as 1 | 3 | 5;
  const order = throwIf(
    await supabase
      .from('orders')
      .insert({ reader_id: input.readerId, topic_id: input.topicId, question_count: count })
      .select()
      .single(),
  ) as Order;

  const qRes = await supabase.from('order_questions').insert(
    input.questions.map((q, i) => ({ order_id: order.id, position: i + 1, question: q.trim() })),
  );
  if (qRes.error) {
    // Асуулт хадгалагдаагүй бол хагас захиалга үлдээхгүй
    await supabase.from('orders').delete().eq('id', order.id);
    throw qRes.error;
  }
  return order;
}

const ORDER_SELECT = '*, tarot_readers(id, name, price_per_question), topics(id, name, icon)';

/** READ: миний захиалгууд (төлвөөр шүүнэ) */
export async function listMyOrders(userId: string, status?: string | null) {
  let q = supabase.from('orders').select(ORDER_SELECT).eq('user_id', userId).order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  return throwIf(await q) as unknown as Order[];
}

export async function getOrder(id: string) {
  return throwIf(
    await supabase
      .from('orders')
      .select(`${ORDER_SELECT}, order_questions(*), reviews(*)`)
      .eq('id', id)
      .order('position', { referencedTable: 'order_questions' })
      .single(),
  ) as unknown as Order;
}

/** UPDATE: хүлээгдэж буй захиалгын асуултыг засна */
export async function updateQuestion(id: string, question: string) {
  return throwIf(await supabase.from('order_questions').update({ question: question.trim() }).eq('id', id).select().single()) as OrderQuestion;
}

/** UPDATE: захиалга цуцлах (pending → cancelled) */
export async function cancelOrder(id: string) {
  throwIf(await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id));
}

/** DELETE: хүлээгдэж буй эсвэл цуцлагдсан захиалгыг устгана */
export async function deleteOrder(id: string) {
  throwIf(await supabase.from('orders').delete().eq('id', id));
}

export async function orderStats(userId: string) {
  const [o, f, r] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('favorites').select('reader_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  return { orders: o.count ?? 0, favorites: f.count ?? 0, reviews: r.count ?? 0 };
}

// ---------------------------------------------------------------- Reviews
export async function upsertReview(orderId: string, rating: number, comment: string, existingId?: string) {
  if (existingId) {
    return throwIf(await supabase.from('reviews').update({ rating, comment }).eq('id', existingId).select().single()) as Review;
  }
  // user_id, reader_id-г trigger бөглөнө
  return throwIf(
    await supabase.from('reviews').insert({ order_id: orderId, rating, comment } as never).select().single(),
  ) as Review;
}

// ---------------------------------------------------------------- Payment (Edge Functions)
async function invoke<T>(name: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Edge Function-ий буцаасан алдааны мессежийг гаргаж авна
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) message = (await ctx.json()).error ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return data as T;
}

export const createInvoice = (orderId: string) => invoke<Payment>('qpay-create-invoice', { order_id: orderId });
export const checkPayment = (orderId: string) =>
  invoke<{ status: 'pending' | 'paid'; order_status: string }>('qpay-check', { order_id: orderId });

// ---------------------------------------------------------------- Daily tarot card
export async function getTodayDraw(userId: string) {
  return throwIf(
    await supabase.from('daily_draws').select('*').eq('user_id', userId).eq('draw_date', isoDate(new Date())).maybeSingle(),
  ) as { card_id: number; reversed: boolean } | null;
}

export async function saveTodayDraw(userId: string, cardId: number, reversed: boolean) {
  throwIf(
    await supabase.from('daily_draws').insert({ user_id: userId, draw_date: isoDate(new Date()), card_id: cardId, reversed }),
  );
}
