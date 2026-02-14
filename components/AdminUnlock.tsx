"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminUnlock({ enabled }: { enabled: boolean }) {
  const { isAdminAuthed, adminEmail, adminLogin, adminLogout } = useAdminAuth();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("president@aoc.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* “Botão invisível”: double click no cantinho */}
      <div
        onDoubleClick={() => setOpen(true)}
        title=""
        className="absolute left-0 top-0 h-10 w-48 opacity-0"
      />

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Admin Unlock</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/5"
              >
                Fechar
              </button>
            </div>

            <div className="mt-2 text-sm text-white/60">
              Isso loga no Supabase (backend). Só admin/owner consegue apagar.
            </div>

            {isAdminAuthed ? (
              <div className="mt-4 space-y-3">
                <div className="text-sm">
                  Logado no Supabase como: <span className="font-medium">{adminEmail}</span>
                </div>
                <button
                  onClick={adminLogout}
                  className="w-full rounded-xl border border-white/15 px-3 py-2 hover:bg-white/5"
                >
                  Sair do modo admin
                </button>
              </div>
            ) : (
              <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setErr(null);
                  try {
                    await adminLogin(email.trim(), password);
                    setPassword("");
                    setOpen(false);
                  } catch (e: any) {
                    setErr(e?.message ?? "Erro ao logar.");
                  }
                }}
              >
                <div>
                  <label className="block text-sm text-white/80">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
                    placeholder="president@aoc.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80">Senha</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
                    placeholder="••••••••"
                  />
                </div>

                {err && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
                    {err}
                  </div>
                )}

                <button className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
                  Entrar como admin
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
