// Resolución de proveedor por línea de pedido y división del pedido por proveedor.
//
// Prioridad (de más específica a más general):
//  1. Metafield de variante  proveedor.proveedor  (metaobjeto "proveedor")
//  2. Metafield de producto  proveedor.proveedor
//  3. data/suppliers.json -> sku_prefixes
//  4. data/suppliers.json -> vendors (marca)
//  5. data/suppliers.json -> default
// Si nada coincide la línea queda en el grupo SIN_PROVEEDOR y se alerta al administrador.

export const UNASSIGNED = 'SIN_PROVEEDOR';

function fromMetaobject(ref) {
  return {
    handle: ref.handle,
    nombre: ref.nombre || ref.handle,
    email: ref.email || '',
    whatsapp: ref.whatsapp || '',
    metodo_envio: ref.metodo_envio || '',
    tiempo_preparacion_dias: ref.tiempo_preparacion_dias ? Number(ref.tiempo_preparacion_dias) : null,
    activo: ref.activo === undefined ? true : ref.activo !== 'false',
    source: 'metaobject',
  };
}

export function resolveSupplier(line, suppliersConfig) {
  if (line.supplierRef) return fromMetaobject(line.supplierRef);
  const list = suppliersConfig?.suppliers ?? [];
  const sku = String(line.sku || '').toUpperCase();
  const byPrefix = list.find((s) => (s.sku_prefixes ?? []).some((p) => sku.startsWith(String(p).toUpperCase())));
  if (byPrefix) return { ...byPrefix, source: 'sku_prefix' };
  const brand = String(line.brand || '').toLowerCase();
  const byVendor = list.find((s) => (s.vendors ?? []).some((v) => String(v).toLowerCase() === brand));
  if (byVendor) return { ...byVendor, source: 'vendor' };
  const def = list.find((s) => s.handle === suppliersConfig?.default);
  if (def) return { ...def, source: 'default' };
  return { handle: UNASSIGNED, nombre: 'Sin proveedor asignado', email: '', source: 'none' };
}

// Devuelve [{ supplier, lines: [...] }] — cada proveedor recibe SOLO sus productos.
export function splitBySupplier(order, suppliersConfig) {
  const groups = new Map();
  for (const line of order.lineItems) {
    if ((line.currentQuantity ?? line.quantity) <= 0) continue; // líneas eliminadas por edición de pedido
    const supplier = resolveSupplier(line, suppliersConfig);
    if (!groups.has(supplier.handle)) groups.set(supplier.handle, { supplier, lines: [] });
    groups.get(supplier.handle).lines.push(line);
  }
  return [...groups.values()];
}
