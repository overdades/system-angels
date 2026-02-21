"use client";

import type { Order } from "@/lib/types";

export function mapOrderRow(r: any): Order {
  return {
    id: r.id,
    created_when: r.created_when,
    kind: r.kind,
    item: r.item,
    qty: r.qty,
    party_type: r.party_type,
    party: r.party,
    notes: r.notes,
    by_text: r.by_text,
  };
}