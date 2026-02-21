"use client";

import { NiceSelect } from "@/components/ui/NiceSelect";
import type { DropOption } from "@/components/ui/NiceSelect";
import type { VaultLog, Order } from "@/lib/types";

type CentralTab = "TODOS" | "BAU" | "PEDIDOS";

export function CentralLogs(props: {
  centralTab: CentralTab;
  setCentralTab: (v: CentralTab) => void;

  centralSearch: string;
  setCentralSearch: (v: string) => void;

  centralBy: string;
  setCentralBy: (v: string) => void;

  centralItem: string;
  setCentralItem: (v: string) => void;

  centralParty: string;
  setCentralParty: (v: string) => void;

  memberNameOptions: DropOption<string>[];
  itemFilterOptions: DropOption<string>[];
  partyFilterOptions: DropOption<string>[];

  centralVault: VaultLog[];
  centralOrders: Order[];

  hideVaultForMe: (id: string) => void;
  hideOrderForMe: (id: string) => void;

  isAdminAuthed: boolean;
  deleteVaultLog: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}) {
  return (
    <section className="lg:col-span-4 panel p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">🔎 Central de Logs</h2>
          <div className="text-xs text-white/60">
            Busca / filtros atualizam em tempo real quando alguém registra.
          </div>
        </div>

        <div className="flex gap-2">
          {(["TODOS", "BAU", "PEDIDOS"] as CentralTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.setCentralTab(t)}
              className={[
                "rounded-xl px-3 py-2 text-sm border transition",
                props.centralTab === t ? "chip-active" : "chip",
              ].join(" ")}
            >
              {t === "TODOS" ? "Todos" : t === "BAU" ? "Baú" : "Pedidos"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-sm text-white/80">Buscar</label>
          <input
            value={props.centralSearch}
            onChange={(e) => props.setCentralSearch(e.target.value)}
            placeholder="Digite item, nome, obs, onde, organização..."
            className="input mt-1"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Autor</label>
          <NiceSelect<string>
            value={props.centralBy}
            options={props.memberNameOptions}
            onChange={props.setCentralBy}
            searchable
            searchPlaceholder="Buscar autor..."
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Item</label>
          <NiceSelect<string>
            value={props.centralItem}
            options={props.itemFilterOptions}
            onChange={props.setCentralItem}
            searchable
            searchPlaceholder="Buscar item..."
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">“Para” (Pedidos)</label>
          <NiceSelect<string>
            value={props.centralParty}
            options={props.partyFilterOptions}
            onChange={props.setCentralParty}
            searchable
            searchPlaceholder="Buscar destino..."
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(props.centralTab === "TODOS" || props.centralTab === "BAU") && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">📦 Baú</div>
              <div className="text-xs text-white/60">
                {props.centralVault.length} resultados
              </div>
            </div>

            <div className="mt-3 max-h-[380px] overflow-auto space-y-2 pr-1">
              {props.centralVault.length === 0 ? (
                <div className="text-sm text-white/60">Nada encontrado.</div>
              ) : (
                props.centralVault.map((log) => (
                  <div
                    key={log.id}
                    className="relative rounded-xl border border-white/10 bg-black/30 p-3 text-sm"
                  >
                    {/* ✅ AÇÕES (LIXEIRA + X) NO CANTO DIREITO */}
                    <div className="absolute right-2 top-2 flex gap-2">
                      {props.isAdminAuthed && (
                        <button
                          type="button"
                          title="Apagar (admin)"
                          className="h-6 px-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                          onClick={async () => {
                            const ok = confirm(
                              "Apagar esse registro do BAÚ do banco?"
                            );
                            if (!ok) return;
                            try {
                              await props.deleteVaultLog(log.id);
                            } catch (e: any) {
                              alert(e?.message ?? "Erro ao apagar.");
                            }
                          }}
                        >
                          🗑️
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => props.hideVaultForMe(log.id)}
                        title="Ocultar deste perfil"
                        className="h-6 w-6 rounded-full border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center leading-none"
                      >
                        ×
                      </button>
                    </div>

                    <div className="font-medium pr-16">
                      {log.direction} — {log.item} x{log.qty}
                    </div>

                    {log.where_text && (
                      <div className="text-white/70 mt-1">
                        Onde: {log.where_text}
                      </div>
                    )}
                    {log.obs && (
                      <div className="text-white/70 mt-1">Obs: {log.obs}</div>
                    )}

                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-white/60">Por: {log.by_text}</div>
                      <div className="text-white/50 text-xs">
                        {log.created_when}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(props.centralTab === "TODOS" || props.centralTab === "PEDIDOS") && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">🧾 Pedidos</div>
              <div className="text-xs text-white/60">
                {props.centralOrders.length} resultados
              </div>
            </div>

            <div className="mt-3 max-h-[380px] overflow-auto space-y-2 pr-1">
              {props.centralOrders.length === 0 ? (
                <div className="text-sm text-white/60">Nada encontrado.</div>
              ) : (
                props.centralOrders.map((o) => (
                  <div
                    key={o.id}
                    className="relative rounded-xl border border-white/10 bg-black/30 p-3 text-sm"
                  >
                    {/* ✅ AÇÕES (LIXEIRA + X) NO CANTO DIREITO */}
                    <div className="absolute right-2 top-2 flex gap-2">
                      {props.isAdminAuthed && (
                        <button
                          type="button"
                          title="Apagar (admin)"
                          className="h-6 px-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                          onClick={async () => {
                            const ok = confirm("Apagar esse PEDIDO do banco?");
                            if (!ok) return;
                            try {
                              await props.deleteOrder(o.id);
                            } catch (e: any) {
                              alert(e?.message ?? "Erro ao apagar.");
                            }
                          }}
                        >
                          🗑️
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => props.hideOrderForMe(o.id)}
                        title="Ocultar deste perfil"
                        className="h-6 w-6 rounded-full border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center leading-none"
                      >
                        ×
                      </button>
                    </div>

                    <div className="font-medium pr-16">
                      {o.kind} — {o.item} x{o.qty}
                    </div>

                    <div className="text-white/70 mt-1">
                      Para: {o.party || "-"}{" "}
                      <span className="text-white/40">
                        ({o.party_type === "MEMBER" ? "membro" : "org"})
                      </span>
                    </div>

                    {o.notes && (
                      <div className="text-white/70 mt-1">{o.notes}</div>
                    )}

                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-white/60">Por: {o.by_text}</div>
                      <div className="text-white/50 text-xs">
                        {o.created_when}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}