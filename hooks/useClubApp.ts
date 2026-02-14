"use client";

import { useEffect, useMemo, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

import { BASE_MEMBERS, CLUB_PASSWORD, ORDER_ALLOWED_IDS, ORGS, OrgOption, ItemOption, ITEMS } from "@/lib/constants";
import { Member, VaultLog, Order, VaultDirection, OrderKind, OrderPartyType, WebhookChannel, CentralTab } from "@/lib/types";
import { nowBR, orderColor, resolveItem, resolveOrg, vaultColor, vaultTitle } from "@/lib/helpers";
import { hiddenOrdersKey, hiddenVaultKey, loadHiddenSet, saveHiddenSet, loadMemberPin, saveMemberPin } from "@/lib/storage";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { insertOrder, insertVaultLog, loadFromDb, subscribeRealtime } from "@/lib/supabaseData";

async function postWebhook(channel: WebhookChannel, payload: unknown) {
  try {
    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, payload }),
    });
  } catch {
    // MVP: sem erro na tela
  }
}

export function useClubApp() {
  const supabase = useMemo(() => getSupabaseClient(), []);

  // membros
  const [members, setMembers] = useState<Member[]>(BASE_MEMBERS);

  // login
  const [clubPass, setClubPass] = useState("");
  const [memberId, setMemberId] = useState<number>(BASE_MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loggedMember, setLoggedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // troca pin
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  // BAÚ form
  const [vaultDirection, setVaultDirection] = useState<VaultDirection>("ENTRADA");
  const [vaultItemOption, setVaultItemOption] = useState<ItemOption>("OUTRO");
  const [vaultItemCustom, setVaultItemCustom] = useState("");
  const [vaultQty, setVaultQty] = useState<number>(1);
  const [vaultWhere, setVaultWhere] = useState("");
  const [vaultObs, setVaultObs] = useState("");

  // PEDIDOS form
  const [orderKind, setOrderKind] = useState<OrderKind>("EXTERNO");
  const [orderItemOption, setOrderItemOption] = useState<ItemOption>("OUTRO");
  const [orderItemCustom, setOrderItemCustom] = useState("");
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderPartyOrgOption, setOrderPartyOrgOption] = useState<OrgOption>(ORGS[0]);
  const [orderPartyOrgCustom, setOrderPartyOrgCustom] = useState("");
  const [orderPartyMemberId, setOrderPartyMemberId] = useState<number>(BASE_MEMBERS[0]?.id ?? 1);
  const [orderNotes, setOrderNotes] = useState("");

  // DATA
  const [vaultLogs, setVaultLogs] = useState<VaultLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // ocultar por perfil
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [hiddenVaultIds, setHiddenVaultIds] = useState<Set<string>>(new Set());

  // central
  const [centralTab, setCentralTab] = useState<CentralTab>("TODOS");
  const [centralSearch, setCentralSearch] = useState("");
  const [centralBy, setCentralBy] = useState<string>("");
  const [centralParty, setCentralParty] = useState<string>("");
  const [centralItem, setCentralItem] = useState<string>("");

  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === memberId) ?? members[0];
  }, [members, memberId]);

  // bootstrap
  useEffect(() => {
    const withSaved = BASE_MEMBERS.map((m) => loadMemberPin(m.id) ?? m);
    setMembers(withSaved);

    const savedMember = localStorage.getItem("loggedMember");
    if (savedMember) {
      try {
        setLoggedMember(JSON.parse(savedMember) as Member);
      } catch {}
    }
  }, []);

  // carregar banco + realtime
  useEffect(() => {
    if (!supabase) return;

    let unsub: null | (() => void) = null;

    (async () => {
      const res = await loadFromDb(supabase);
      if (!res.vaultError) setVaultLogs(res.vault);
      if (!res.ordersError) setOrders(res.orders);

      unsub = subscribeRealtime(
        supabase,
        (row) => {
          setVaultLogs((prev) => (prev.some((p) => p.id === row.id) ? prev : [row, ...prev]));
        },
        (row) => {
          setOrders((prev) => (prev.some((p) => p.id === row.id) ? prev : [row, ...prev]));
        }
      );
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [supabase]);

  // hidden sets por perfil
  useEffect(() => {
    if (!loggedMember) return;
    setHiddenOrderIds(loadHiddenSet(hiddenOrdersKey(loggedMember.id)));
    setHiddenVaultIds(loadHiddenSet(hiddenVaultKey(loggedMember.id)));
  }, [loggedMember]);

  function hideOrderForMe(orderId: string) {
    if (!loggedMember) return;
    setHiddenOrderIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      saveHiddenSet(hiddenOrdersKey(loggedMember.id), next);
      return next;
    });
  }

  function hideVaultForMe(vaultId: string) {
    if (!loggedMember) return;
    setHiddenVaultIds((prev) => {
      const next = new Set(prev);
      next.add(vaultId);
      saveHiddenSet(hiddenVaultKey(loggedMember.id), next);
      return next;
    });
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

    if (selectedMember.mustChangePin) {
      setChangingPin(true);
      return;
    }

    setLoggedMember(selectedMember);
    localStorage.setItem("loggedMember", JSON.stringify(selectedMember));
  }

  function handleLogout() {
    localStorage.removeItem("loggedMember");
    setLoggedMember(null);
    setClubPass("");
    setPin("");
    setError(null);
  }

  function confirmNewPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newPin.trim()) {
      setError("Digite um novo PIN.");
      return;
    }

    const updated: Member = {
      ...selectedMember,
      pin: newPin.trim(),
      mustChangePin: false,
    };

    saveMemberPin(updated);
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

    setLoggedMember(updated);
    localStorage.setItem("loggedMember", JSON.stringify(updated));

    setChangingPin(false);
    setNewPin("");
  }

  async function addVaultLog(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    const finalItem = resolveItem(vaultItemOption, vaultItemCustom);
    if (!finalItem) return;

    const log: VaultLog = {
      id: crypto.randomUUID(),
      created_when: nowBR(),
      direction: vaultDirection,
      item: finalItem,
      qty: vaultQty,
      where_text: vaultWhere.trim(),
      obs: vaultObs.trim(),
      by_text: loggedMember.name,
    };

    // otimista
    setVaultLogs((prev) => [log, ...prev]);

    if (supabase) {
      const { error: dbErr } = await insertVaultLog(supabase, log);
      if (dbErr) {
        setVaultLogs((prev) => prev.filter((v) => v.id !== log.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("vault", {
      embeds: [
        {
          title: `📦 BAÚ (${vaultTitle(vaultDirection)})`,
          color: vaultColor(vaultDirection),
          fields: [
            { name: "⠀", value: `**👤 NOME:** ${loggedMember.name}`, inline: true },
            { name: "⠀", value: `**📦 ITEM:** ${log.item}`, inline: true },
            { name: "⠀", value: `**🔢 QUANTIDADE:** ${log.qty}`, inline: true },
            { name: "📍 ONDE:", value: log.where_text || "-", inline: false },
            { name: "📝 OBS:", value: log.obs || "-", inline: false },
          ],
        },
      ],
    });

    setVaultItemOption("OUTRO");
    setVaultItemCustom("");
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

    const finalItem = resolveItem(orderItemOption, orderItemCustom);
    if (!finalItem) return;

    let party = "";
    let partyType: OrderPartyType = "ORG";

    if (orderKind === "INTERNO") {
      const m = members.find((x) => x.id === orderPartyMemberId);
      party = m?.name ?? "";
      partyType = "MEMBER";
      if (!party) return;
    } else {
      party = resolveOrg(orderPartyOrgOption, orderPartyOrgCustom);
      partyType = "ORG";
      if (orderPartyOrgOption === "OUTRO" && !party) return;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      created_when: nowBR(),
      kind: orderKind,
      item: finalItem,
      qty: orderQty,
      party_type: partyType,
      party,
      notes: orderNotes.trim(),
      by_text: loggedMember.name,
    };

    setOrders((prev) => [order, ...prev]);

    if (supabase) {
      const { error: dbErr } = await insertOrder(supabase, order);
      if (dbErr) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("orders", {
      embeds: [
        {
          title: `🧾 PEDIDO (${order.kind})`,
          color: orderColor(order.kind),
          fields: [
            { name: "⠀", value: `**👤 NOME:** ${loggedMember.name}`, inline: true },
            { name: "⠀", value: `**📦 ITEM:** ${order.item}`, inline: true },
            { name: "⠀", value: `**🔢 QUANTIDADE:** ${order.qty}`, inline: true },
            { name: "🏷️ PARA:", value: order.party || "-", inline: false },
            { name: "📝 OBS:", value: order.notes || "-", inline: false },
          ],
        },
      ],
    });

    setOrderQty(1);
    setOrderNotes("");
    setOrderItemOption("OUTRO");
    setOrderItemCustom("");

    if (orderKind === "EXTERNO") {
      setOrderPartyOrgOption(ORGS[0]);
      setOrderPartyOrgCustom("");
    } else {
      setOrderPartyMemberId(members[0]?.id ?? 1);
    }
  }

  const visibleVaultLogs = useMemo(
    () => vaultLogs.filter((v) => !hiddenVaultIds.has(v.id)),
    [vaultLogs, hiddenVaultIds]
  );

  const visibleOrders = useMemo(
    () => orders.filter((o) => !hiddenOrderIds.has(o.id)),
    [orders, hiddenOrderIds]
  );

  // filtros
  const memberOptions = useMemo(
    () => members.map((m) => ({ value: m.id, label: m.name })),
    [members]
  );

  const memberNameOptions = useMemo(() => {
    const set = new Set<string>();
    for (const v of vaultLogs) set.add(v.by_text);
    for (const o of orders) set.add(o.by_text);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vaultLogs, orders]);

  const itemFilterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const v of vaultLogs) set.add(v.item);
    for (const o of orders) set.add(o.item);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vaultLogs, orders]);

  const partyFilterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) set.add(o.party);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [orders]);

  const centralVault = useMemo(() => {
    const s = centralSearch.toLowerCase().trim();
    return visibleVaultLogs.filter((v) => {
      if (centralBy && v.by_text !== centralBy) return false;
      if (centralItem && v.item !== centralItem) return false;
      if (!s) return true;

      const blob = `${v.created_when} ${v.direction} ${v.item} ${v.qty} ${v.where_text} ${v.obs} ${v.by_text}`.toLowerCase();
      return blob.includes(s);
    });
  }, [visibleVaultLogs, centralSearch, centralBy, centralItem]);

  const centralOrders = useMemo(() => {
    const s = centralSearch.toLowerCase().trim();
    return visibleOrders.filter((o) => {
      if (centralBy && o.by_text !== centralBy) return false;
      if (centralItem && o.item !== centralItem) return false;
      if (centralParty && o.party !== centralParty) return false;
      if (!s) return true;

      const blob = `${o.created_when} ${o.kind} ${o.item} ${o.qty} ${o.party_type} ${o.party} ${o.notes} ${o.by_text}`.toLowerCase();
      return blob.includes(s);
    });
  }, [visibleOrders, centralSearch, centralBy, centralParty, centralItem]);

  return {
    supabase,

    // state login
    members,
    memberOptions,
    clubPass, setClubPass,
    memberId, setMemberId,
    pin, setPin,
    loggedMember,
    error,
    changingPin,
    newPin, setNewPin,

    // actions login
    handleLogin,
    handleLogout,
    confirmNewPin,
    setChangingPin,

    // forms
    vaultDirection, setVaultDirection,
    vaultItemOption, setVaultItemOption,
    vaultItemCustom, setVaultItemCustom,
    vaultQty, setVaultQty,
    vaultWhere, setVaultWhere,
    vaultObs, setVaultObs,

    orderKind, setOrderKind,
    orderItemOption, setOrderItemOption,
    orderItemCustom, setOrderItemCustom,
    orderQty, setOrderQty,
    orderPartyOrgOption, setOrderPartyOrgOption,
    orderPartyOrgCustom, setOrderPartyOrgCustom,
    orderPartyMemberId, setOrderPartyMemberId,
    orderNotes, setOrderNotes,

    addVaultLog,
    addOrder,

    // central
    centralTab, setCentralTab,
    centralSearch, setCentralSearch,
    centralBy, setCentralBy,
    centralParty, setCentralParty,
    centralItem, setCentralItem,

    memberNameOptions,
    itemFilterOptions,
    partyFilterOptions,

    centralVault,
    centralOrders,

    // hide
    hideVaultForMe,
    hideOrderForMe,

    // constants for UI
    ITEMS,
    ORGS,
  };
}
