// Red de seguridad: busca pedidos PAGADOS que todavía no fueron enviados al proveedor
// (por ejemplo si el servidor estuvo caído cuando llegó el webhook) y los procesa.
// Se ejecuta con POST /tasks/reconcile (cron cada 15 min) o con scripts/reconcile.mjs.
import { handleOrderPaid, TAG_SUPPLIER_NOTIFIED } from './orders.js';

const QUERY = /* GraphQL */ `
query NovaPendingSupplier($q: String!) {
  orders(first: 50, query: $q, sortKey: CREATED_AT, reverse: true) { nodes { id name } }
}`;

export async function reconcilePaidOrders(ctx, { sinceDays = 7 } = {}) {
  const since = new Date(Date.now() - sinceDays * 86400_000).toISOString().slice(0, 10);
  const q = `financial_status:paid -tag:${TAG_SUPPLIER_NOTIFIED} -status:cancelled created_at:>=${since}`;
  const data = await ctx.shopify.graphql(QUERY, { q });
  const results = [];
  for (const node of data.orders.nodes) {
    try {
      results.push(await handleOrderPaid(ctx, node.id));
    } catch (err) {
      ctx.logger.error('reconcile.error', { order: node.name, error: err });
      results.push({ order: node.name, error: err.message });
    }
  }
  return { checked: data.orders.nodes.length, results };
}
