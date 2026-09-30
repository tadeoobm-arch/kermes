#!/usr/bin/env node
// Procesa pedidos pagados que no fueron enviados al proveedor (red de seguridad manual).
import { createContext } from '../app/src/context.js';
import { reconcilePaidOrders } from '../app/src/services/reconcile.js';

const r = await reconcilePaidOrders(createContext());
console.log(JSON.stringify({ revisados: r.checked, resultados: r.results.map((x) => ({ pedido: x.order, estado: x.status, omitido: x.skipped, error: x.error })) }, null, 2));
