// Operaciones GraphQL validadas contra el esquema de la Admin API (2026-07).

const METAOBJECT_REF = `reference { ... on Metaobject { handle fields { key value } } }`;

export const ORDER_QUERY = /* GraphQL */ `
query NovaOrder($id: ID!) {
  order(id: $id) {
    id
    legacyResourceId
    name
    createdAt
    processedAt
    cancelledAt
    cancelReason
    email
    phone
    note
    tags
    displayFinancialStatus
    displayFulfillmentStatus
    paymentGatewayNames
    customAttributes { key value }
    totalPriceSet { shopMoney { amount currencyCode } }
    subtotalPriceSet { shopMoney { amount } }
    totalShippingPriceSet { shopMoney { amount } }
    totalDiscountsSet { shopMoney { amount } }
    customer { firstName lastName defaultEmailAddress { emailAddress } defaultPhoneNumber { phoneNumber } }
    shippingAddress { firstName lastName phone address1 address2 city province provinceCode zip country countryCodeV2 company }
    shippingLine { title }
    estado: metafield(namespace: "novaparfum", key: "estado") { value }
    pedidosProveedor: metafield(namespace: "novaparfum", key: "pedidos_proveedor") { value }
    lineItems(first: 100) {
      nodes {
        id
        name
        title
        variantTitle
        sku
        vendor
        quantity
        currentQuantity
        originalUnitPriceSet { shopMoney { amount } }
        discountedUnitPriceAfterAllDiscountsSet { shopMoney { amount } }
        variant {
          id
          sku
          inventoryItem { unitCost { amount } }
          skuProveedor: metafield(namespace: "proveedor", key: "sku_proveedor") { value }
          proveedorVariante: metafield(namespace: "proveedor", key: "proveedor") { ${METAOBJECT_REF} }
        }
        product {
          id
          handle
          proveedor: metafield(namespace: "proveedor", key: "proveedor") { ${METAOBJECT_REF} }
          codigoInterno: metafield(namespace: "perfume", key: "codigo_interno") { value }
        }
      }
    }
    fulfillments(first: 20) {
      id
      status
      displayStatus
      createdAt
      deliveredAt
      estimatedDeliveryAt
      inTransitAt
      trackingInfo { company number url }
      fulfillmentLineItems(first: 50) { nodes { lineItem { id } quantity } }
    }
  }
}`;

export const ORDER_LOOKUP_QUERY = /* GraphQL */ `
query NovaOrderLookup($q: String!) {
  orders(first: 1, query: $q) {
    nodes { id name email phone shippingAddress { phone } customer { defaultEmailAddress { emailAddress } defaultPhoneNumber { phoneNumber } } }
  }
}`;

export const FULFILLMENT_ORDERS_QUERY = /* GraphQL */ `
query NovaFulfillmentOrders($id: ID!) {
  order(id: $id) {
    fulfillmentOrders(first: 20) {
      nodes {
        id
        status
        lineItems(first: 100) { nodes { id remainingQuantity lineItem { id } } }
      }
    }
  }
}`;

export const FULFILLMENT_CREATE = /* GraphQL */ `
mutation NovaFulfillmentCreate($fulfillment: FulfillmentInput!, $message: String) {
  fulfillmentCreate(fulfillment: $fulfillment, message: $message) {
    fulfillment { id status trackingInfo { company number url } }
    userErrors { field message }
  }
}`;

export const FULFILLMENT_EVENT_CREATE = /* GraphQL */ `
mutation NovaFulfillmentEvent($fulfillmentEvent: FulfillmentEventInput!) {
  fulfillmentEventCreate(fulfillmentEvent: $fulfillmentEvent) {
    fulfillmentEvent { id status }
    userErrors { field message }
  }
}`;

export const TAGS_ADD = /* GraphQL */ `
mutation NovaTagsAdd($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node { id }
    userErrors { field message }
  }
}`;

export const METAFIELDS_SET = /* GraphQL */ `
mutation NovaMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { key namespace value }
    userErrors { field message code }
  }
}`;

export const METAFIELD_DEFINITION_CREATE = /* GraphQL */ `
mutation NovaMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id namespace key }
    userErrors { field message code }
  }
}`;

export const METAOBJECT_DEFINITION_CREATE = /* GraphQL */ `
mutation NovaMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id type }
    userErrors { field message code }
  }
}`;

export const METAOBJECT_DEFINITION_BY_TYPE = /* GraphQL */ `
query NovaMetaobjectDef($type: String!) {
  metaobjectDefinitionByType(type: $type) { id type }
}`;

export const AUTOMATIC_BASIC_DISCOUNT_CREATE = /* GraphQL */ `
mutation NovaVolumeDiscount($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode { id }
    userErrors { field message code }
  }
}`;
