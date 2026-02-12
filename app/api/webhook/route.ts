import { NextResponse } from "next/server";

type Channel = "vault" | "orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const channel = body.channel as Channel;
    const payload = body.payload;

    const url =
      channel === "orders"
        ? process.env.DISCORD_WEBHOOK_ORDERS
        : process.env.DISCORD_WEBHOOK_VAULT;

    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Webhook URL não configurada no .env.local" },
        { status: 500 }
      );
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Discord respondeu ${res.status}`, details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
