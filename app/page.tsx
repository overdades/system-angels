"use client";

import { channel } from "diagnostics_channel";
import { useEffect, useMemo, useState } from "react";

type Member = { id: number; name: string; pin: string };

const CLUB_PASSWORD = "jgcalvo";
const MEMBERS: Member[] = [
  { id: 1, name: "DRK", pin: "1111" },
  { id: 2, name: "OVER", pin: "2222" },
  { id: 3, name: "SLX", pin: "3333" },
];
const ORDER_ALLOWED_IDS = new Set<number>([1, 2]); // EX: DRK e OVER


export default function Home() {
  const [clubPass, setClubPass] = useState("");
  const [memberId, setMemberId] = useState<number>(MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loggedMember, setLoggedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ======= BAÚ ========
  const [vaultWhere, setVaultWhere] = useState("");
  const [vaultObs, setVaultObs] = useState("");
  const [vaultDirection, setVaultDirection] =
    useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [vaultItem, setVaultItem] = useState("");
  const [vaultQty, setVaultQty] = useState<number>(1);
  const [vaultLogs, setVaultLogs] = useState<any[]>([]);

  // ======= PEDIDOS ========
  const [orderKind, setOrderKind] = useState<"EXTERNO" | "INTERNO">("EXTERNO");
  const [orderItem, setOrderItem] = useState("");
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderParty, setOrderParty] = useState("");
  const [orderStatus, setOrderStatus] =
    useState<"ABERTO" | "ANDAMENTO" | "FINALIZADO" | "CANCELADO">("ABERTO");
  const [orderNotes, setOrderNotes] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("loggedMember");
    if (saved) {
      setLoggedMember(JSON.parse(saved));
    }

    const savedVault = localStorage.getItem("vaultLogs");
    if (savedVault) {
      setVaultLogs(JSON.parse(savedVault));
    }

    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
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

  function addVaultLog(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    const newLog = {
      id: crypto.randomUUID(),
      when: new Date().toLocaleString(),
      direction: vaultDirection,
      item: vaultItem,
      qty: vaultQty,
      where: vaultWhere,
      obs: vaultObs,
      by: loggedMember.name,
    };

    setVaultLogs((prev) => [newLog, ...prev]);
    const tipo = vaultDirection === "ENTRADA" ? "ENTRADA" : "SAÍDA";
    const label = vaultDirection === "ENTRADA" ? "Entrada" : "Saída";

    fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "vault",
        payload: {
          embeds: [
            {
              title: `📦 BAÚ (${tipo})`,
              color: vaultDirection === "ENTRADA" ? 5763719 : 15548997,
              fields: [
                {
                  name: "⠀",
                  value: `**👤 NOME:** ${loggedMember.name}`,
                  inline: true,
                },
                {
                  name: "⠀",
                  value: `**📦 ITEM:** ${vaultItem}`,
                  inline: true,
                },
                {
                  name: "⠀",
                  value: `** 🔢 QUANTIDADE:** ${vaultQty}`,
                  inline: true,
                },
                {
                  name: "📍 ONDE:",
                  value: vaultWhere || "-",
                  inline: false,
                },
                {
                  name: "📝 OBS:",
                  value: vaultObs || "-",
                  inline: false,
                },
              ],
            },
          ],
        },
      }),
    });





    setVaultItem("");
    setVaultQty(1);
    setVaultWhere("");
    setVaultObs("");
  }

  function addOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    if (!ORDER_ALLOWED_IDS.has(loggedMember.id)) {
      alert("Você não tem permissão para registrar pedidos.");
      return;
    }

    const newOrder = {
      id: crypto.randomUUID(),
      when: new Date().toLocaleString(),
      kind: orderKind,
      item: orderItem,
      qty: orderQty,
      party: orderParty,
      status: orderStatus,
      notes: orderNotes,
      by: loggedMember.name,
    };

    setOrders((prev) => [newOrder, ...prev]);
    fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "orders",
        payload: {
          embeds: [
            {
              title: `🧾 PEDIDO (${orderKind})`,
              color: orderKind === "EXTERNO" ? 3447003 : 10181046,
              fields: [
                { name: "⠀", value: `**👤 NOME:** ${loggedMember.name}`, inline: true },
                { name: "⠀", value: `**📦 ITEM:** ${orderItem}`, inline: true },
                { name: "⠀", value: `** 🔢 QUANTIDADE:** ${orderQty}`, inline: true },

                { name: "📌 STATUS:", value: orderStatus, inline: false },
                { name: "📝 OBS:", value: orderNotes || "-", inline: false },
              ],
            },
          ],
        },
      }),
    });



    setOrderItem("");
    setOrderQty(1);
    setOrderParty("");
    setOrderStatus("ABERTO");
    setOrderNotes("");
  }

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
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {/* AUMENTEI A LARGURA MÁXIMA */}
      <div className="relative overflow-hidden w-full max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-semibold">ANGELS OF CODES</h1>
        {/* LOGO FANTASMA BACKGROUND */}
        <img
          src="/logo-angels.png"
          alt=""
          className="pointer-events-none select-none absolute right-[-120px] top-1/2 -translate-y-1/2 opacity-3 w-[520px] lg:w-[700px]"
        />
        <p className="text-sm text-white/70 mt-1">
          (MVP) Login por senha do clube + Membro + PIN
        </p>

        {!loggedMember ? (

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* FORM LOGIN */}
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
            {/* Cabeçalho logado + sair */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
              <div>
                <div className="text-sm text-white/70">Logado como</div>
                <div className="text-lg font-semibold">{loggedMember.name}</div>
                <div className="text-xs text-white/60">
                  ID: {loggedMember.id}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
              >
                Sair
              </button>
            </div>

            {/* GRID: BAÚ MAIS LARGO + PEDIDOS AO LADO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 📦 BAÚ (2/3 da largura no desktop) */}
              <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">📦 Log do Baú</h2>

                <form onSubmit={addVaultLog} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <select
                      value={vaultDirection}
                      onChange={(e) => setVaultDirection(e.target.value as any)}
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
                    <label className="block text-sm text-white/80">
                      Quantidade
                    </label>
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
                      placeholder="Ex: *Devolver pra ele*"
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    />
                  </div>

                  <button className="w-full rounded-xl bg-white text-black py-2 font-medium hover:bg-white/90">
                    Registrar no Baú
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {vaultLogs.length === 0 ? (
                    <div className="text-sm text-white/60">
                      Sem registros ainda.
                    </div>
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
                        {log.where && <div className="text-white/70 mt-1">Onde: {log.where}</div>}
                        {log.obs && <div className="text-white/70 mt-1">Obs: {log.obs}</div>}
                        <div className="text-white/60 mt-1">Por: {log.by}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* 🧾 PEDIDOS (1/3 da largura no desktop) */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">🧾 Pedidos</h2>

                <form onSubmit={addOrder} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <select
                      value={orderKind}
                      onChange={(e) => setOrderKind(e.target.value as any)}
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
                    <label className="block text-sm text-white/80">
                      Quantidade
                    </label>
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
                      onChange={(e) => setOrderStatus(e.target.value as any)}
                      className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                    >
                      <option value="ABERTO">ABERTO</option>
                      <option value="ANDAMENTO">ANDAMENTO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">
                      Observações
                    </label>
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
                    <div className="text-sm text-white/60">
                      Sem pedidos ainda.
                    </div>
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
                        <div className="text-white/70 mt-1">
                          Parte: {o.party || "-"}
                        </div>
                        <div className="text-white/70 mt-1">
                          Status: {o.status}
                        </div>
                        {o.notes && (
                          <div className="text-white/70 mt-1">{o.notes}</div>
                        )}
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
