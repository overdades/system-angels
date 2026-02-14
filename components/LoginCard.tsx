"use client";

import { NiceSelect } from "@/components/ui/NiceSelect";

export function LoginCard({
  clubPass,
  setClubPass,
  memberId,
  setMemberId,
  memberOptions,
  pin,
  setPin,
  error,
  onSubmit,
}: {
  clubPass: string;
  setClubPass: (v: string) => void;
  memberId: number;
  setMemberId: (v: number) => void;
  memberOptions: { value: number; label: string }[];
  pin: string;
  setPin: (v: string) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm italic text-white/80">
            Senha do clube
          </label>
          <input
            value={clubPass}
            onChange={(e) => setClubPass(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            placeholder="Digite a senha do clube"
          />
        </div>

        <div>
          <label className="block text-sm italic text-white/80">
            Membro
          </label>
          <NiceSelect<number>
            value={memberId}
            options={memberOptions}
            onChange={(v) => setMemberId(v)}
            searchable
            searchPlaceholder="Buscar membro..."
          />
        </div>

        <div>
          <label className="block text-sm italic text-white/80">PIN</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            placeholder="Digite o PIN"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
