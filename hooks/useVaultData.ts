"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

export type VaultDirection = "ENTRADA" | "SAIDA";

export type VaultLog = {
  id: string;
  created_when: string;
  direction: VaultDirection;
  item: string;
  qty: number;
  where_text: string;
  obs: string;
  by_text: string;
};

export function useVaultData() {
  const [vaultLogs, setVaultLogs] = useState<VaultLog[]>([]);

  const loadVaultFromDb = useCallback(async () => {
    const { data, error } = await supabase
      .from("vault_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (!error && data) {
      setVaultLogs(
        data.map((r: any) => ({
          id: r.id,
          created_when: r.created_when,
          direction: r.direction,
          item: r.item,
          qty: r.qty,
          where_text: r.where_text,
          obs: r.obs,
          by_text: r.by_text,
        }))
      );
    } else if (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel("realtime-vault-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vault_logs" },
        (payload: RealtimePostgresInsertPayload<any>) => {
          const r: any = payload.new;

          const log: VaultLog = {
            id: r.id,
            created_when: r.created_when,
            direction: r.direction,
            item: r.item,
            qty: r.qty,
            where_text: r.where_text,
            obs: r.obs,
            by_text: r.by_text,
          };

          setVaultLogs((prev) => {
            if (prev.some((p) => p.id === log.id)) return prev;
            return [log, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const deleteVaultLog = useCallback(async (id: string) => {
    const { error } = await supabase.from("vault_logs").delete().eq("id", id);
    if (error) throw error;
    setVaultLogs((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return {
    vaultLogs,
    setVaultLogs,
    loadVaultFromDb,
    deleteVaultLog,
  };
}
