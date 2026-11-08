// POST /functions/v1/qpay-check   body: { order_id }
// Апп дээрх «Төлбөр шалгах» товч. QPay-ээс шууд асууж, төлөгдсөн бол захиалгыг «paid» болгоно.
import { admin, cors, HttpError, json, requireUser, verifyAndMarkPaid } from '../_shared/qpay.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await requireUser(req);
    const { order_id } = await req.json();
    const db = admin();
    const { data: order } = await db.from('orders').select('id, user_id, status').eq('id', order_id).maybeSingle();
    if (!order || order.user_id !== user.id) throw new HttpError(404, 'Захиалга олдсонгүй');
    if (order.status !== 'pending') return json({ status: 'paid', order_status: order.status });

    const r = await verifyAndMarkPaid(db, order_id);
    return json({ status: r.status, order_status: r.status === 'paid' ? 'paid' : 'pending' });
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    console.error(e);
    return json({ error: (e as Error).message }, status);
  }
});
