export type WebhookChannel = "vault" | "orders";

export async function postWebhook(channel: WebhookChannel, payload: any) {
  try {
    const res = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, payload }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Webhook error:", res.status, txt);
    }
  } catch (e) {
    console.error("Webhook fetch failed:", e);
  }
}

export function buildVaultEmbed(log: {
  direction: string;
  item: string;
  qty: number;
  where_text: string;
  obs: string;
  by_text: string;
}) {
  const color = log.direction === "ENTRADA" ? 0x22c55e : 0xef4444;

  return {
    embeds: [
      {
        title: "📦 Registro de Baú",
        color,
        fields: [
          { name: "Tipo", value: log.direction, inline: true },
          { name: "Item", value: log.item, inline: true },
          { name: "Qtd", value: String(log.qty), inline: true },
          { name: "Onde", value: log.where_text || "-", inline: false },
          { name: "Obs", value: log.obs || "-", inline: false },
          { name: "Por", value: log.by_text, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "ANGELS OF CODES" },
      },
    ],
  };
}

export function buildOrderEmbed(order: {
  kind: string;
  item: string;
  qty: number;
  party: string;
  notes: string;
  by_text: string;
}) {
  const color = order.kind === "INTERNO" ? 0x3b82f6 : 0xf59e0b;

  return {
    embeds: [
      {
        title: "🧾 Novo Pedido",
        color,
        fields: [
          { name: "Tipo", value: order.kind, inline: true },
          { name: "Item", value: order.item, inline: true },
          { name: "Qtd", value: String(order.qty), inline: true },
          { name: "Para", value: order.party || "-", inline: false },
          { name: "Obs", value: order.notes || "-", inline: false },
          { name: "Por", value: order.by_text, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "ANGELS OF CODES" },
      },
    ],
  };
}