// QPay төлбөр орсны дараа энэ URL-ийг дуудна (callback_url):
//   /functions/v1/qpay-webhook?order_id=...&token=...
// JWT шалгахгүй (QPay-д Supabase token байхгүй) → config.toml-д verify_jwt = false.
// Аюулгүй байдал: (1) нууц token тааруулна, (2) QPay-ээс төлбөрийг ДАХИН шалгана.
import { admin, json, verifyAndMarkPaid } from '../_shared/qpay.ts';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const token = url.searchParams.get('token');
  if (!orderId || !token) return json({ error: 'bad request' }, 400);

  try {
    const db = admin();
    const { data: pay } = await db.from('payments').select('callback_token').eq('order_id', orderId).maybeSingle();
    if (!pay || pay.callback_token !== token) return json({ error: 'forbidden' }, 403);

    const r = await verifyAndMarkPaid(db, orderId);
    console.log(`webhook order=${orderId} status=${r.status}`);
    // QPay 200 хариу хүлээж авбал дахин дуудахгүй
    return new Response('SUCCESS', { status: 200 });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
