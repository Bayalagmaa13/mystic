// POST /functions/v1/qpay-create-invoice   body: { order_id }
// Хэрэглэгчийн «pending» захиалгад QPay нэхэмжлэх үүсгэнэ (дахин дуудвал хуучныг буцаана).
import { admin, cors, HttpError, json, qpayCreateInvoice, requireUser } from '../_shared/qpay.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await requireUser(req);
    const { order_id } = await req.json();
    if (!order_id) throw new HttpError(400, 'order_id шаардлагатай');

    const db = admin();
    const { data: order } = await db.from('orders').select('*').eq('id', order_id).maybeSingle();
    if (!order || order.user_id !== user.id) throw new HttpError(404, 'Захиалга олдсонгүй');
    if (order.status !== 'pending') throw new HttpError(409, 'Энэ захиалгыг аль хэдийн төлсөн эсвэл цуцалсан байна');

    // Өмнө нь үүссэн нэхэмжлэх байвал түүнийг буцаана (давхар нэхэмжлэхээс сэргийлнэ)
    const { data: existing } = await db.from('payments').select('*').eq('order_id', order_id).maybeSingle();
    if (existing?.invoice_id && existing.amount === order.total_amount) {
      const { callback_token: _t, ...safe } = existing;
      return json(safe);
    }

    // Дүнг АПП-ААС БИШ, өгөгдлийн сангаас (trigger тооцсон) авна
    const amount = order.total_amount;
    const { data: pay, error } = await db
      .from('payments')
      .upsert({ order_id, amount, status: 'pending' }, { onConflict: 'order_id' })
      .select()
      .single();
    if (error) throw error;

    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/qpay-webhook?order_id=${order_id}&token=${pay.callback_token}`;
    const inv = await qpayCreateInvoice({
      orderNo: order.order_no,
      amount,
      description: `Mystic тарот #${order.order_no}`,
      receiver: user.id,
      callbackUrl,
    });

    const { data: saved, error: e2 } = await db
      .from('payments')
      .update({ invoice_id: inv.invoice_id, qr_text: inv.qr_text, qr_image: inv.qr_image, deeplinks: inv.urls ?? [] })
      .eq('id', pay.id)
      .select()
      .single();
    if (e2) throw e2;

    const { callback_token: _t, ...safe } = saved;
    return json(safe);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    console.error(e);
    return json({ error: (e as Error).message }, status);
  }
});
