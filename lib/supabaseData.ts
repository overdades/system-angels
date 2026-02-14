import type { SupabaseClient, RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { Order, VaultLog } from "./types";

async function selectLatest<T>(
  supabase: SupabaseClient,
  table: string,
  limit = 200
) {
  const first = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!first.error) return first as { data: T[] | null; error: null };

  const fallback = await supabase
    .from(table)
    .select("*")
    .order("created_when", { ascending: false })
    .limit(limit);

  return fallback as any;
}

export async function loadFromDb(supabase: SupabaseClient) {
  const [vaultRes, ordersRes] = await Promise.all([
    selectLatest<VaultLog>(supabase, "vault_logs", 200),
    selectLatest<Order>(supabase, "orders", 200),
  ]);

  return {
    vault: Array.isArray(vaultRes.data) ? (vaultRes.data as VaultLog[]) : [],
    orders: Array.isArray(ordersRes.data) ? (ordersRes.data as Order[]) : [],
    vaultError: (vaultRes as any).error ?? null,
    ordersError: (ordersRes as any).error ?? null,
  };
}

export function subscribeRealtime(
  supabase: SupabaseClient,
  onVaultInsert: (row: VaultLog) => void,
  onOrderInsert: (row: Order) => void
) {
  const ch = supabase
    .channel("aoc-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "vault_logs" },
      (payload: RealtimePostgresInsertPayload<VaultLog>) => {
        onVaultInsert(payload.new);
      }
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload: RealtimePostgresInsertPayload<Order>) => {
        onOrderInsert(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(ch);
  };
}

export async function insertVaultLog(supabase: SupabaseClient, log: VaultLog) {
  return supabase.from("vault_logs").insert(log);
}

export async function insertOrder(supabase: SupabaseClient, order: Order) {
  return supabase.from("orders").insert(order);
}
