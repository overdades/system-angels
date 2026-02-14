"use client";

import type { VaultLog } from "@/hooks/useVaultData";

export function CentralVaultList({
  logs,
  onHide,
  isAdminAuthed,
  onDelete,
}: {
  logs: VaultLog[];
  onHide: (id: string) => void;
  isAdminAuthed: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">📦 Baú</div>
        <div className="text-xs text-white/60">{logs.length} resultados</div>
      </div>

      <div className="mt-3 max-h-[380px] overflow-auto space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="text-sm text-white/60">Nada encontrado.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="relative rounded-xl border border-white/10 bg-black/30 p-3 text-sm"
            >
              {/* ocultar por perfil */}
              <button
                type="button"
                onClick={() => onHide(log.id)}
                title="Ocultar deste perfil"
                className="absolute right-2 top-2 h-6 w-6 rounded-full border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center leading-none"
              >
                ×
              </button>

              {/* ✅ DELETE só pra admin */}
              {isAdminAuthed && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = confirm("Apagar esse registro do BAÚ do banco?");
                    if (!ok) return;
                    try {
                      await onDelete(log.id);
                    } catch (e: any) {
                      alert(e?.message ?? "Erro ao apagar.");
                    }
                  }}
                  title="Apagar (admin)"
                  className="absolute left-2 top-2 h-6 px-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                >
                  🗑️
                </button>
              )}

              <div className="font-medium pr-10">
                {log.direction} — {log.item} x{log.qty}
              </div>

              {log.where_text && (
                <div className="text-white/70 mt-1">Onde: {log.where_text}</div>
              )}

              {log.obs && <div className="text-white/70 mt-1">Obs: {log.obs}</div>}

              <div className="mt-2 flex items-end justify-between">
                <div className="text-white/60">Por: {log.by_text}</div>
                <div className="text-white/50 text-xs">{log.created_when}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
