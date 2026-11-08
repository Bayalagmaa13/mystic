import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { friendlyError, getTopics } from '@/services/api';
import type { Order, Topic } from '@/lib/types';

/** Нэвтрээгүй бол нэвтрэх дэлгэц рүү шилжүүлнэ (хамгаалалттай дэлгэц) */
export function useRequireAuth() {
  const { session, loading } = useAuth();
  useEffect(() => {
    if (!loading && !session) router.replace('/login');
  }, [loading, session]);
  return session;
}

/** Сэдвүүдийг нэг удаа татаж, апп даяар дахин ашиглана */
let topicsCache: Topic[] | null = null;
export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>(topicsCache ?? []);
  useEffect(() => {
    if (topicsCache) return;
    getTopics().then((t) => { topicsCache = t; setTopics(t); }).catch(() => {});
  }, []);
  return topics;
}

/**
 * Өгөгдөл татах ерөнхий hook: loading, error, refresh-ийг нэг дор удирдана.
 * Дэлгэц рүү буцаж ирэх бүрд (focus) дахин татна.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[], opts: { refetchOnFocus?: boolean } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (mode: 'load' | 'refresh' | 'silent' = 'load') => {
    if (mode === 'load') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, deps);

  useEffect(() => { run('load'); }, [run]);

  useFocusEffect(
    useCallback(() => {
      if (first.current) { first.current = false; return; }
      if (opts.refetchOnFocus) run('silent');
    }, [run, opts.refetchOnFocus]),
  );

  return { data, setData, loading, refreshing, error, reload: () => run('load'), refresh: () => run('refresh'), silent: () => run('silent') };
}

/**
 * REALTIME: захиалгын төлөв өөрчлөгдөхөд (жишээ нь webhook «paid» болгоход)
 * апп дахин ачаалалгүйгээр шууд мэдэж авна.
 */
export function useOrderRealtime(filter: string | null, onChange: (row: Partial<Order>) => void) {
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    if (!filter) return;
    const channel = supabase
      .channel(`orders:${filter}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter }, (payload) =>
        cb.current(payload.new as Partial<Order>),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);
}

/** Хайлтын үгийг 350мс хүлээгээд илгээнэ (товч бүрт сервер дуудахгүй) */
export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
