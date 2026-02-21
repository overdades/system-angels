// lib/webhook.ts
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

function safe(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : "-";
}

function line(label: string, value: string) {
  // label com emoji e titulo em negrito na mesma linha
  return `${label} ${value}`;
}

/**
 * PEDIDOS – padrão da imagem:
 * title: "📄 PEDIDO (EXTERNO)" ou "📄 PEDIDO (INTERNO)"
 * description com linhas "👤 NOME:" "📦 ITEM:" "🔢 QUANTIDADE:" "🏷️ PARA:" "📝 OBS:"
 * color: EXTERNO azul, INTERNO roxo
 */
export function buildOrderEmbed(order: {
  kind: "EXTERNO" | "INTERNO" | string;
  item: string;
  qty: number;
  party: string;
  notes: string;
  by_text: string;
}) {
  const kind = String(order.kind).toUpperCase();
  const isInterno = kind === "INTERNO";

  const color = isInterno ? 0x7c3aed : 0x3b82f6; // roxo / azul

  const desc =
    [
      `${line("👤 **NOME:**", `**${safe(order.by_text)}**`)}   ${line("📦 **ITEM:**", `**${safe(order.item)}**`)}   ${line("🔢 **QUANTIDADE:**", `**${safe(order.qty)}**`)}`,
      "",
      `${line("🏷️ **PARA:**", `\n${safe(order.party)}`)}`,
      "",
      `${line("📝 **OBS:**", `\n${safe(order.notes)}`)}`,
    ].join("\n");

  return {
    embeds: [
      {
        title: `📄 PEDIDO (${kind})`,
        color,
        description: desc,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * BAÚ – mesmo padrão visual do pedido:
 * title: "📦 BAÚ (ENTRADA)" ou "📦 BAÚ (SAIDA)"
 * description com linhas "👤 NOME:" "📦 ITEM:" "🔢 QUANTIDADE:" "📍 ONDE:" "📝 OBS:"
 * color: ENTRADA verde, SAIDA vermelho
 */
export function buildVaultEmbed(log: {
  direction: "ENTRADA" | "SAIDA" | string;
  item: string;
  qty: number;
  where_text: string;
  obs: string;
  by_text: string;
}) {
  const dir = String(log.direction).toUpperCase();
  const isEntrada = dir === "ENTRADA";

  const color = isEntrada ? 0x22c55e : 0xef4444; // verde / vermelho

  const desc =
    [
      `${line("👤 **NOME:**", `**${safe(log.by_text)}**`)}   ${line("📦 **ITEM:**", `**${safe(log.item)}**`)}   ${line("🔢 **QUANTIDADE:**", `**${safe(log.qty)}**`)}`,
      "",
      `${line("📍 **ONDE:**", `\n${safe(log.where_text)}`)}`,
      "",
      `${line("📝 **OBS:**", `\n${safe(log.obs)}`)}`,
    ].join("\n");

  return {
    embeds: [
      {
        title: `📦 BAÚ (${dir})`,
        color,
        description: desc,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}