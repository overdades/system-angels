"use client";

import { useEffect, useMemo, useState } from "react";

type Member = { id: number; name: string; pin: string };

type VaultDirection = "ENTRADA" | "SAIDA";
type VaultLog = {
  id: string;
  when: string;
  direction: VaultDirection;
  item: string;
  qty: number;
  where: string;
  obs: string;
  by: string;
};

type OrderKind = "EXTERNO" | "INTERNO";
type OrderStatus = "ABERTO" | "ANDAMENTO" | "FINALIZADO" | "CANCELADO";
type Order = {
  id: string;
  when: string;
  kind: OrderKind;
  item: string;
  qty: number;
  party: string;
  status: OrderStatus;
  notes: string;
  by: string;
};

type WebhookChannel = "vault" | "orders";

const CLUB_PASSWORD = "jgcalvo";

const MEMBERS: Member[] = [
  { id: 1, name: "DRK", pin: "1111" },
  { id: 2, name: "OVER", pin: "2222" },
  { id: 3, name: "SLX", pin: "3333" },
];

const ORDER_ALLOWED_IDS = new Set<number>([1, 2]);

function nowBR(): string {
  return new Date().toLocaleString();
}

function vaultTitle(direction: VaultDirection): string {
  return direction === "ENTRADA" ? "ENTRADA" : "SAÍDA";
}

function vaultColor(direction: VaultDirection): number {
  return direction === "ENTRADA" ? 5763719 : 15548997;
}

function orderColor(kind: OrderKind): number {
  return kind === "EXTERNO" ? 3447003 : 10181046;
}

async function postWebhook(channel: WebhookChannel, payload: unknown) {
  try {
    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, payload }),
    });
  } catch {
    // silencioso por enquanto (MVP)
  }
}

export default function Home() {
  const [clubPass, setClubPass] = useState("");
  const [memberId, setMemberId] = useState<number>(MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loggedMember, setLoggedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Baú
  const [vaultDirection, setVaultDirection] = useState<VaultDirection>("ENTRADA");
  const [vaultItem, setVaultItem] = useState("");
  const [vaultQty, setVaultQty] = useState<number>(1);
  const [vaultWhere, setVaultWhere] = useState("");
  const [vaultObs, setVaultObs] = useState("");
  const [vaultLogs, setVaultLogs] = useState<VaultLog[]>([]);

  // Pedidos
  const [orderKind, setOrderKind] = useState<OrderKind>("EXTERNO");
  const [orderItem, setOrderItem] = useState("");
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderParty, setOrderParty] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("ABERTO");
  const [orderNotes, setOrderNotes] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedMember = localStorage.getItem("loggedMember");
    if (savedMember) setLoggedMember(JSON.parse(savedMember));

    const savedVault = localStorage.getItem("vaultLogs");
    if (savedVault) setVaultLogs(JSON.parse(savedVault));

    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem("vaultLogs", JSON.stringify(vaultLogs));
  }, [vaultLogs]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const selectedMember = useMemo(
    () => MEMBERS.find((m) => m.id === memberId)!,
    [memberId]
  );

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (clubPass !== CLUB_PASSWORD) {
      setError("Senha do clube incorreta.");
      return;
    }

    if (pin !== selectedMember.pin) {
      setError("PIN incorreto para esse membro.");
      return;
    }

    setLoggedMember(selectedMember);
    localStorage.setItem("loggedMember", JSON.stringify(selectedMember));
  }

  function handleLogout() {
    localStorage.removeItem("loggedMember");
    localStorage.removeItem("vaultLogs");
    localStorage.removeItem("orders");

    setLoggedMember(null);
    setClubPass("");
    setPin("");
    setError(null);

    setVaultLogs([]);
    setOrders([]);
  }

  async function addVaultLog(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    if (!vaultItem.trim()) return;

    const log: VaultLog = {
      id: crypto.randomUUID(),
      when: nowBR(),
      direction: vaultDirection,
      item: vaultItem.trim(),
      qty: vaultQty,
      where: vaultWhere.trim(),
      obs: vaultObs.trim(),
      by: loggedMember.name,
    };

    setVaultLogs((prev) => [log, ...prev]);

    await postWebhook("vault", {
      embeds: [
        {
          title: `📦 BAÚ (${vaultTitle(vaultDirection)})`,
          color: vaultColor(vaultDirection),
          fields: [
            { name: "⠀", value: `**👤 NOME:** ${loggedMember.name}`, inline: true },
            { name: "⠀", value: `**📦 ITEM:** ${log.item}`, inline: true },
            { name: "⠀", value: `**🔢 QUANTIDADE:** ${log.qty}`, inline: true },
            { name: "📍 ONDE:", value: log.where || "-", inline: false },
            { name: "📝 OBS:", value: log.obs || "-", inline: false },
          ],
        },
      ],
    });

    setVaultItem("");
    setVaultQty(1);
    setVaultWhere("");
    setVaultObs("");
  }

  async function addOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    if (!ORDER_ALLOWED_IDS.has(loggedMember.id)) {
      alert("Você não tem permissão para registrar pedidos.");
      return;
    }

    if (!orderItem.trim()) return;

    const order: Order = {
      id: crypto.randomUUID(),
      when: nowBR(),
      kind: orderKind,
      item: orderItem.trim(),
      qty: orderQty,
      party: orderParty.trim(),
      status: orderStatus,
      notes: orderNotes.trim(),
      by: loggedMember.name,
    };

    setOrders((prev) => [order, ...prev]);

    await postWebhook("orders", {
      embeds: [
        {
          title: `🧾 PEDIDO (${order.kind})`,
          color: orderColor(order.kind),
          fields: [
            { name: "⠀", value: `**👤 NOME:** ${loggedMember.name}`, inline: true },
            { name: "⠀", value: `**📦 ITEM:** ${order.item}`, inline: true },
            { name: "⠀", value: `**🔢 QUANTIDADE:** ${order.qty}`, inline: true },
            { name: "🏷️ PARTE:", value: order.party || "-", inline: false },
            { name: "📌 STATUS:", value: order.status, inline: false },
            { name: "📝 OBS:", value: order.notes || "-", inline: false },
          ],
        },
      ],
    });

    setOrderItem("");
    setOrderQty(1);
    setOrderParty("");
    setOrderStatus("ABERTO");
    setOrderNotes("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="relative overflow-hidden w-full max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-semibold">ANGELS OF CODES</h1>

        <img
          src="/logo-angels.png"
          alt=""
          className="pointer-events-none select-none absolute right-[-120px] top-1/2 -translate-y-1/2 opacity-[0.03] w-[520px] lg:w-[700px]"
        />

        <p className="text-sm text-white/70 mt-1">
          (MVP) Login por senha do clube + Membro + PIN
        </p>

        {!loggedMember ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <form onSubmit={handleLogin} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-white/80">Senha do clube</label>
                <input
                  value={clubPass}
                  onChange={(e) => setClubPass(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                  placeholder="Digite a senha do clube"
                />
              </div>

              <div>
                <label className="block text-sm text-white/80">Membro</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                >
                  {MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/80">PIN</label>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                  placeholder="Digite o PIN"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90"
              >
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
              <div>
                <div className="text-sm text-white/70">Logado como</div>
                <div className="text-lg font-semibold">{loggedMember.name}</div>
                <div className="text-xs text-white/60">ID: {loggedMember.id}</div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
              >
                Sair
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">📦 Log do Baú</h2>

                <form onSubmit={addVaultLog} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <select
                      value={vaultDirection}
                      onChange={(e) => setVaultDirection(e.target.value as VaultDirection)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    >
                      <option value="ENTRADA">ENTRADA</option>
                      <option value="SAIDA">SAÍDA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Item</label>
                    <input
                      value={vaultItem}
                      onChange={(e) => setVaultItem(e.target.value)}
                      placeholder="Ex: Cabelo do Ticano"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={vaultQty}
                      onChange={(e) => setVaultQty(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Onde</label>
                    <input
                      value={vaultWhere}
                      onChange={(e) => setVaultWhere(e.target.value)}
                      placeholder="Ex: Porta-malas do Lucena"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Obs</label>
                    <input
                      value={vaultObs}
                      onChange={(e) => setVaultObs(e.target.value)}
                      placeholder="Ex: Devolver pra ele"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <button className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
                    Registrar no Baú
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {vaultLogs.length === 0 ? (
                    <div className="text-sm text-white/60">Sem registros ainda.</div>
                  ) : (
                    vaultLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {log.direction} — {log.item} x{log.qty}
                          </span>
                          <span className="text-white/60">{log.when}</span>
                        </div>
                        {log.where && (
                          <div className="text-white/70 mt-1">Onde: {log.where}</div>
                        )}
                        {log.obs && <div className="text-white/70 mt-1">Obs: {log.obs}</div>}
                        <div className="text-white/60 mt-1">Por: {log.by}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">🧾 Pedidos</h2>

                <form onSubmit={addOrder} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <select
                      value={orderKind}
                      onChange={(e) => setOrderKind(e.target.value as OrderKind)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    >
                      <option value="EXTERNO">EXTERNO (pra dentro)</option>
                      <option value="INTERNO">INTERNO (pra fora)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Item</label>
                    <input
                      value={orderItem}
                      onChange={(e) => setOrderItem(e.target.value)}
                      placeholder="Ex: AK"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">
                      Parte (quem pediu / pra quem)
                    </label>
                    <input
                      value={orderParty}
                      onChange={(e) => setOrderParty(e.target.value)}
                      placeholder="Ex: Cliente X"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    >
                      <option value="ABERTO">ABERTO</option>
                      <option value="ANDAMENTO">ANDAMENTO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Observações</label>
                    <input
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Ex: Pra amanhã"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <button className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
                    Registrar Pedido
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {orders.length === 0 ? (
                    <div className="text-sm text-white/60">Sem pedidos ainda.</div>
                  ) : (
                    orders.map((o) => (
                      <div
                        key={o.id}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {o.kind} — {o.item} x{o.qty}
                          </span>
                          <span className="text-white/60">{o.when}</span>
                        </div>
                        <div className="text-white/70 mt-1">Parte: {o.party || "-"}</div>
                        <div className="text-white/70 mt-1">Status: {o.status}</div>
                        {o.notes && <div className="text-white/70 mt-1">{o.notes}</div>}
                        <div className="text-white/60 mt-1">Por: {o.by}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
