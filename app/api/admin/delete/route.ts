import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_IDS, BASE_MEMBERS } from "@/lib/constants";
import { verifySession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Table = "vault_logs" | "orders";

export async function POST(req: Request) {
  try {
    const c = await cookies();
    const token = c.get("aoc_session")?.value ?? null;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ ok: false, error: "Não logado." }, { status: 401 });

    const member = BASE_MEMBERS.find((m) => m.id === payload.memberId);
    if (!member) return NextResponse.json({ ok: false, error: "Sessão inválida." }, { status: 401 });

    if (!ADMIN_IDS.has(member.id)) {
      return NextResponse.json({ ok: false, error: "Sem permissão." }, { status: 403 });
    }

    const body = await req.json();
    const table = String(body.table) as Table;
    const id = String(body.id ?? "");

    if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
    if (table !== "vault_logs" && table !== "orders") {
      return NextResponse.json({ ok: false, error: "Tabela inválida." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from(table).delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro" }, { status: 500 });
  }
}