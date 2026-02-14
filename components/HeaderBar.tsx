"use client";

import { Member } from "@/lib/types";

export function HeaderBar({
  loggedMember,
  onLogout,
}: {
  loggedMember: Member;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
      <div>
        <div className="text-sm text-white/70">Logado como</div>
        <div className="text-lg font-semibold">{loggedMember.name}</div>
        <div className="text-xs text-white/60">ID: {loggedMember.id}</div>
      </div>

      <button
        onClick={onLogout}
        className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
      >
        Sair
      </button>
    </div>
  );
}
