// QPay v2 API + төлбөр баталгаажуулах нийтлэг логик (Deno / Supabase Edge Functions)
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const env = (k: string, fallback?: string) => {
  const v = Deno.env.get(k) ?? fallback;
  if (v === undefined) throw new Error(`${k} secret тохируулаагүй байна`);
  return v;
};

// QPAY_MODE=mock бол QPay руу хандахгүй, туршилтын нэхэмжлэх үүсгэнэ (интернэт/данс байхгүй үед demo хийхэд)
const MODE = () => Deno.env.get('QPAY_MODE') ?? 'sandbox';
const BASE = () => env('QPAY_BASE_URL', 'https://merchant-sandbox.qpay.mn');

/** service_role түлхүүртэй клиент — RLS-ийг тойрно. ЗӨВХӨН сервер талд! */
const serviceKey = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? env('SUPABASE_SECRET_KEY');
export const admin = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), serviceKey(), { auth: { persistSession: false } });

/** Хүсэлт илгээсэн хэрэглэгчийг JWT-ээс тодорхойлно */
export async function requireUser(req: Request) {
  const auth = req.headers.get('Authorization');
  if (!auth) throw new HttpError(401, 'Нэвтрээгүй байна');
  const jwt = auth.replace(/^Bearer\s+/i, '');
  const { data, error } = await admin().auth.getUser(jwt);
  if (error || !data.user) throw new HttpError(401, 'Нэвтрэлт хүчингүй байна');
  return data.user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// ------------------------------------------------------------------ QPay API
let cachedToken: { token: string; exp: number } | null = null;

async function qpayToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token;
  const basic = btoa(`${env('QPAY_CLIENT_ID', 'TEST_MERCHANT')}:${env('QPAY_CLIENT_SECRET', '123456')}`);
  const res = await fetch(`${BASE()}/v2/auth/token`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  if (!res.ok) throw new HttpError(502, `QPay нэвтрэлт амжилтгүй (${res.status})`);
  const data = await res.json();
  cachedToken = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

export interface QPayInvoice {
  invoice_id: string;
  qr_text: string;
  qr_image: string; // base64 PNG
  urls: { name: string; description: string; logo: string; link: string }[];
}

export async function qpayCreateInvoice(p: { orderNo: string; amount: number; description: string; receiver: string; callbackUrl: string }): Promise<QPayInvoice> {
  if (MODE() === 'mock') {
    return { invoice_id: `MOCK-${p.orderNo}`, qr_text: `MOCK:${p.orderNo}:${p.amount}`, qr_image: MOCK_QR, urls: [] };
  }
  const res = await fetch(`${BASE()}/v2/invoice`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await qpayToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoice_code: env('QPAY_INVOICE_CODE', 'TEST_INVOICE'),
      sender_invoice_no: p.orderNo,
      invoice_receiver_code: p.receiver,
      invoice_description: p.description,
      amount: p.amount,
      callback_url: p.callbackUrl,
    }),
  });
  if (!res.ok) throw new HttpError(502, `QPay нэхэмжлэх үүсгэж чадсангүй (${res.status}): ${await res.text()}`);
  return await res.json();
}

/** QPay-ээс нэхэмжлэхийн төлбөр орсон эсэхийг ШУУД асууна (webhook-ийн мэдээлэлд дангаар итгэхгүй) */
async function qpayIsPaid(invoiceId: string, amount: number): Promise<boolean> {
  if (MODE() === 'mock') return true; // mock горимд «Төлбөр шалгах» дарахад төлөгдсөнд тооцно
  const res = await fetch(`${BASE()}/v2/payment/check`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await qpayToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_type: 'INVOICE', object_id: invoiceId, offset: { page_number: 1, page_limit: 100 } }),
  });
  if (!res.ok) throw new HttpError(502, `QPay төлбөр шалгаж чадсангүй (${res.status})`);
  const data = await res.json();
  const paid = Number(data.paid_amount ?? 0);
  const anyPaid = (data.rows ?? []).some((r: { payment_status?: string }) => r.payment_status === 'PAID');
  return paid >= amount || anyPaid;
}

/**
 * Төлбөрийг шалгаж, орсон бол:
 *   payments.status = 'paid', orders.status = 'paid' (service_role → trigger зөвшөөрнө)
 *   хэрэглэгч рүү push мэдэгдэл илгээнэ
 */
export async function verifyAndMarkPaid(db: SupabaseClient, orderId: string) {
  const { data: pay, error } = await db.from('payments').select('*').eq('order_id', orderId).maybeSingle();
  if (error) throw error;
  if (!pay?.invoice_id) return { status: 'pending' as const };
  if (pay.status === 'paid') return { status: 'paid' as const };

  if (!(await qpayIsPaid(pay.invoice_id, pay.amount))) return { status: 'pending' as const };

  await db.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', pay.id);
  const { data: order } = await db
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id, order_no, user_id, total_amount, tarot_readers(name)')
    .maybeSingle();

  if (order) {
    const reader = (order as unknown as { tarot_readers?: { name?: string } }).tarot_readers?.name ?? 'таротчин';
    await sendPush(db, order.user_id, 'Төлбөр амжилттай ✦', `#${order.order_no} захиалгын асуулт ${reader}д илгээгдлээ.`, { orderId });
  }
  return { status: 'paid' as const };
}

/** Expo Push API-аар мэдэгдэл илгээнэ */
export async function sendPush(db: SupabaseClient, userId: string, title: string, body: string, data: Record<string, unknown>) {
  const { data: profile } = await db.from('profiles').select('push_token').eq('id', userId).maybeSingle();
  if (!profile?.push_token) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: profile.push_token, title, body, data, sound: 'default', channelId: 'default' }),
    });
  } catch (e) {
    console.error('push failed', e);
  }
}

// 1x1 цагаан PNG — mock горимд QR-ийн оронд
const MOCK_QR = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
