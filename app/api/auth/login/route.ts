import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CLUB_PASSWORD } from "@/lib/constants";
import { signSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clubPass = String(body.clubPass ?? "");
    const memberId = Number(body.memberId);
    const pin = String(body.pin ?? "");

    if (clubPass !== CLUB_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Senha do clube incorreta." }, { status: 401 });
    }
    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ ok: false, error: "MemberId inválido." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_members")
      .select("id,name,pin_hash,must_change_pin")
      .eq("id", memberId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Membro inválido." }, { status: 401 });
    }

    // ✅ valida PIN vindo do banco (por enquanto em texto)
    if (pin !== data.pin_hash) {
      return NextResponse.json({ ok: false, error: "PIN incorreto." }, { status: 401 });
    }

    const token = signSession(data.id);
    const c = await cookies();
    c.set("aoc_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      ok: true,
      member: { id: data.id, name: data.name },
      mustChangePin: !!data.must_change_pin,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro" }, { status: 500 });
  }
}