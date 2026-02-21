"use client";

import type { DropOption } from "@/components/ui/NiceSelect";
import { NiceSelect } from "@/components/ui/NiceSelect";

export function LoginCard(props: {
  clubPass: string;
  setClubPass: (v: string) => void;

  memberId: number;
  setMemberId: (v: number) => void;
  memberOptions: DropOption<number>[];

  pin: string;
  setPin: (v: string) => void;

  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <form onSubmit={props.onSubmit} className="space-y-4 max-w-md panel p-5">
        <div className="text-lg font-semibold">Login</div>

        <div>
          <label className="block text-sm italic text-white/80">Senha do clube</label>
          <input
            value={props.clubPass}
            onChange={(e) => props.setClubPass(e.target.value)}
            className="input mt-1"
            placeholder="Digite a senha do clube"
          />
        </div>

        <div>
          <label className="block text-sm italic text-white/80">Membro</label>
          <NiceSelect<number>
            value={props.memberId}
            options={props.memberOptions}
            onChange={props.setMemberId}
            searchable
            searchPlaceholder="Buscar membro..."
          />
        </div>

        <div>
          <label className="block text-sm italic text-white/80">PIN</label>
          <input
            value={props.pin}
            onChange={(e) => props.setPin(e.target.value)}
            className="input mt-1"
            placeholder="Digite o PIN"
          />
        </div>

        {props.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
            {props.error}
          </div>
        )}

        <button type="submit" className="btn-primary">
          Entrar
        </button>
      </form>

      <div className="hidden lg:block">
        <div className="panel p-6">
          <div className="text-xl font-semibold">ANGELS OF CODES</div>
          <div className="text-white/70 mt-2">
            Central de logs + registros sincronizados com Supabase e Discord.
          </div>
        </div>
      </div>
    </div>
  );
}