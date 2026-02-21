"use client";

import type { Member } from "@/lib/types";

export function HeaderBar(props: {
  loggedMember: Member;
  onLogout: () => void;
  isAdminAuthed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
      <div>
        <div className="text-sm text-white/70">Logado como</div>

        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">{props.loggedMember.name}</div>

          {props.isAdminAuthed && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 bg-white/10 text-white/90">
              ADMIN
            </span>
          )}
        </div>

        <div className="text-xs text-white/60">ID: {props.loggedMember.id}</div>
      </div>

      <button onClick={props.onLogout} className="btn-ghost">
        Sair
      </button>
    </div>
  );
}