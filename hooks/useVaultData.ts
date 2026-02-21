"use client";

import type { VaultLog } from "@/lib/types";

export function nowBR() {
  return new Date().toLocaleString();
}

export function mapVaultRow(r: any): VaultLog {
  return {
    id: r.id,
    created_when: r.created_when,
    direction: r.direction,
    item: r.item,
    qty: r.qty,
    where_text: r.where_text,
    obs: r.obs,
    by_text: r.by_text,
  };
}