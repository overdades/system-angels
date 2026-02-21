import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const c = await cookies();
    const token = c.get("aoc_session")?.value ?? null;
    const payload = verifySession(token);
    if (!payload) return NextResponse.json({ ok: false }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("club_members")
      .select("id,name,must_change_pin")
      .eq("id", payload.memberId)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({
      ok: true,
      member: { id: data.id, name: data.name },
      mustChangePin: !!data.must_change_pin,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro" }, { status: 500 });
  }
}