"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

export type OrderKind = "EXTERNO" | "INTERNO";
export type OrderPartyType = "ORG" | "MEMBER";

export type Order = {
  id: string;
  created_when: string;
  kind: OrderKind;
  item: string;
  qty: number;
  party_type: OrderPartyType;
  party: string;
  notes: string;
  by_text: string;
};

export function useOrdersData() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrdersFromDb = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (!error && data) {
      setOrders(
        data.map((r: any) => ({
          id: r.id,
          created_when: r.created_when,
          kind: r.kind,
          item: r.item,
          qty: r.qty,
          party_type: r.party_type,
          party: r.party,
          notes: r.notes,
          by_text: r.by_text,
        }))
      );
    } else if (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          const r: any = payload.new;

          const order: Order = {
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

          setOrders((prev) => {
            if (prev.some((p) => p.id === order.id)) return prev;
            return [order, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    setOrders((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return {
    orders,
    setOrders,
    loadOrdersFromDb,
    deleteOrder,
  };
}
