import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const c = await cookies();
    const token = c.get("aoc_session")?.value ?? null;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ ok: false, error: "Não logado." }, { status: 401 });

    const body = await req.json();
    const newPin = String(body.newPin ?? "").trim();

    if (newPin.length < 3) {
      return NextResponse.json({ ok: false, error: "PIN muito curto." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("club_members")
      .update({ pin_hash: newPin, must_change_pin: false })
      .eq("id", payload.memberId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro" }, { status: 500 });
  }
}