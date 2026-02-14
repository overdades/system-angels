"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { getSupabase } from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useVaultData, type VaultLog, type VaultDirection } from "@/hooks/useVaultData";
import { useOrdersData, type Order, type OrderKind, type OrderPartyType } from "@/hooks/useOrdersData";

/* =====================================================
   TYPES
===================================================== */

type Member = {
  id: number;
  name: string;
  pin: string;
  mustChangePin: boolean;
};

type WebhookChannel = "vault" | "orders";

/* =====================================================
   CONFIG
===================================================== */

const CLUB_PASSWORD = "jgcalvo";

const BASE_MEMBERS: Member[] = [
  { id: 1, name: "Drk", pin: "aoddrk", mustChangePin: true },
  { id: 2, name: "Nando", pin: "aodnando", mustChangePin: true },
  { id: 3, name: "Aurora", pin: "aodaurora", mustChangePin: true },
  { id: 4, name: "Roxy", pin: "aodroxy", mustChangePin: true },
  { id: 5, name: "Rachi", pin: "aodrachi", mustChangePin: true },
  { id: 6, name: "Lucena", pin: "aodlucena", mustChangePin: true },
  { id: 7, name: "Kah", pin: "aodkah", mustChangePin: true },
  { id: 8, name: "Arq", pin: "aodarq", mustChangePin: true },
  { id: 9, name: "Jg", pin: "aodjg", mustChangePin: true },
  { id: 10, name: "Sky", pin: "aodsky", mustChangePin: true },
  { id: 11, name: "Jdl", pin: "aodjdl", mustChangePin: true },
  { id: 12, name: "Slx", pin: "aodslx", mustChangePin: true },
  { id: 13, name: "Fubuka", pin: "aodfubuka", mustChangePin: true },
  { id: 14, name: "Atlas", pin: "aodatlas", mustChangePin: true },
  { id: 15, name: "Dalcin", pin: "aoddalcin", mustChangePin: true },
  { id: 16, name: "Braga", pin: "aodbraga", mustChangePin: true },
  { id: 17, name: "Bomber", pin: "aodbomber", mustChangePin: true },
  { id: 18, name: "Goop", pin: "aodgoop", mustChangePin: true },
  { id: 19, name: "Mavi", pin: "aodmavi", mustChangePin: true },
  { id: 20, name: "Over", pin: "aodover", mustChangePin: true },
  { id: 21, name: "Pitta", pin: "aodpitta", mustChangePin: true },
  { id: 22, name: "Soso", pin: "aodsoso", mustChangePin: true },
  { id: 23, name: "Speed", pin: "aodspeed", mustChangePin: true },
  { id: 24, name: "Clecle", pin: "aodclecle", mustChangePin: true },
  { id: 25, name: "Will", pin: "aodwill", mustChangePin: true },
  { id: 26, name: "Ryss", pin: "aodryss", mustChangePin: true },
];

const ORDER_ALLOWED_IDS = new Set<number>([1, 2, 20]);

const ORGS = [
  "Marabunta",
  "Los Vagos",
  "Families",
  "Ballas",
  "DVD",
  "Nihil",
  "Agnikai's",
  "South Thunder",
  "7 Sombras",
  "Cesarini",
  "Black Rose",
  "Bandolero MC",
  "The Lost MC",
] as const;

type OrgOption = (typeof ORGS)[number] | "OUTRO";

const ITEMS = ["1911", "Munição 9mm"] as const;
type ItemPreset = (typeof ITEMS)[number];
type ItemOption = ItemPreset | "OUTRO";

/* =====================================================
   HELPERS
===================================================== */

function nowBR() {
  return new Date().toLocaleString();
}

function resolveOrg(option: OrgOption, custom: string) {
  return option === "OUTRO" ? custom.trim() : option;
}

function resolveItem(option: ItemOption, custom: string) {
  if (option === "OUTRO") return custom.trim();
  return String(option);
}

async function postWebhook(channel: WebhookChannel, payload: unknown) {
  try {
    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, payload }),
    });
  } catch {
    // ignore
  }
}

/* =====================================================
   SELECT UI OPTIONS
===================================================== */

export type DropOption<T extends string | number> = { value: T; label: string };

/* =====================================================
   CENTRAL
===================================================== */

type CentralTab = "TODOS" | "BAU" | "PEDIDOS";

/* =====================================================
   HOOK
===================================================== */

export function useClubApp() {
  const supabase: SupabaseClient | null = useMemo(() => getSupabase(), []);

  // ✅ data hooks (com delete pronto)
  const vault = useVaultData();
  const ordersDb = useOrdersData();

  // membros “reais”
  const [members, setMembers] = useState<Member[]>(BASE_MEMBERS);

  // login
  const [clubPass, setClubPass] = useState("");
  const [memberId, setMemberId] = useState<number>(BASE_MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loggedMember, setLoggedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // troca de pin
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  // BAÚ (form)
  const [vaultDirection, setVaultDirection] = useState<VaultDirection>("ENTRADA");
  const [vaultItemOption, setVaultItemOption] = useState<ItemOption>("OUTRO");
  const [vaultItemCustom, setVaultItemCustom] = useState("");
  const [vaultQty, setVaultQty] = useState<number>(1);
  const [vaultWhere, setVaultWhere] = useState("");
  const [vaultObs, setVaultObs] = useState("");

  // PEDIDOS (form)
  const [orderKind, setOrderKind] = useState<OrderKind>("EXTERNO");
  const [orderItemOption, setOrderItemOption] = useState<ItemOption>("OUTRO");
  const [orderItemCustom, setOrderItemCustom] = useState("");
  const [orderQty, setOrderQty] = useState<number>(1);

  const [orderPartyOrgOption, setOrderPartyOrgOption] = useState<OrgOption>(ORGS[0]);
  const [orderPartyOrgCustom, setOrderPartyOrgCustom] = useState("");
  const [orderPartyMemberId, setOrderPartyMemberId] = useState<number>(BASE_MEMBERS[0]?.id ?? 1);

  const [orderNotes, setOrderNotes] = useState("");

  // ocultar por perfil
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(new Set());
  const [hiddenVaultIds, setHiddenVaultIds] = useState<Set<string>>(new Set());

  function hiddenOrdersKey(mid: number) {
    return `hiddenOrders:${mid}`;
  }
  function hiddenVaultKey(mid: number) {
    return `hiddenVault:${mid}`;
  }

  function hideOrderForMe(orderId: string) {
    if (!loggedMember) return;
    setHiddenOrderIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      localStorage.setItem(hiddenOrdersKey(loggedMember.id), JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function hideVaultForMe(vaultId: string) {
    if (!loggedMember) return;
    setHiddenVaultIds((prev) => {
      const next = new Set(prev);
      next.add(vaultId);
      localStorage.setItem(hiddenVaultKey(loggedMember.id), JSON.stringify(Array.from(next)));
      return next;
    });
  }

  // bootstrap
  useEffect(() => {
    const withSaved = BASE_MEMBERS.map((m) => {
      const raw = localStorage.getItem(`memberPin:${m.id}`);
      if (!raw) return m;
      try {
        return JSON.parse(raw) as Member;
      } catch {
        return m;
      }
    });
    setMembers(withSaved);

    const savedMember = localStorage.getItem("loggedMember");
    if (savedMember) {
      try {
        setLoggedMember(JSON.parse(savedMember) as Member);
      } catch {}
    }
  }, []);

  // carregar do banco (1x ao iniciar)
  useEffect(() => {
    if (!supabase) return;
    vault.loadVaultFromDb();
    ordersDb.loadOrdersFromDb();
  }, [supabase, vault, ordersDb]);

  // hidden sets por perfil
  useEffect(() => {
    if (!loggedMember) return;

    const rawOrders = localStorage.getItem(hiddenOrdersKey(loggedMember.id));
    if (!rawOrders) setHiddenOrderIds(new Set());
    else {
      try {
        setHiddenOrderIds(new Set(JSON.parse(rawOrders) as string[]));
      } catch {
        setHiddenOrderIds(new Set());
      }
    }

    const rawVault = localStorage.getItem(hiddenVaultKey(loggedMember.id));
    if (!rawVault) setHiddenVaultIds(new Set());
    else {
      try {
        setHiddenVaultIds(new Set(JSON.parse(rawVault) as string[]));
      } catch {
        setHiddenVaultIds(new Set());
      }
    }
  }, [loggedMember]);

  // login / pin change
  const selectedMember = useMemo(() => members.find((m) => m.id === memberId) ?? members[0], [members, memberId]);

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

    const updated: Member = { ...selectedMember, pin: newPin.trim(), mustChangePin: false };

    localStorage.setItem(`memberPin:${updated.id}`, JSON.stringify(updated));
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

    setLoggedMember(updated);
    localStorage.setItem("loggedMember", JSON.stringify(updated));

    setChangingPin(false);
    setNewPin("");
  }

  // create logs
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

    vault.setVaultLogs((prev) => [log, ...prev]);

    if (supabase) {
      const { error: dbErr } = await supabase.from("vault_logs").insert(log);
      if (dbErr) {
        vault.setVaultLogs((prev) => prev.filter((v) => v.id !== log.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("vault", {
      embeds: [
        {
          title: `📦 BAÚ (${log.direction})`,
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

    ordersDb.setOrders((prev) => [order, ...prev]);

    if (supabase) {
      const { error: dbErr } = await supabase.from("orders").insert(order);
      if (dbErr) {
        ordersDb.setOrders((prev) => prev.filter((o) => o.id !== order.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("orders", {
      embeds: [
        {
          title: `🧾 PEDIDO (${order.kind})`,
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

  // derived lists
  const visibleVaultLogs = useMemo(() => vault.vaultLogs.filter((v) => !hiddenVaultIds.has(v.id)), [vault.vaultLogs, hiddenVaultIds]);
  const visibleOrders = useMemo(() => ordersDb.orders.filter((o) => !hiddenOrderIds.has(o.id)), [ordersDb.orders, hiddenOrderIds]);

  // dropdown options
  const memberOptions: DropOption<number>[] = members.map((m) => ({ value: m.id, label: m.name }));

  const memberNameOptions: DropOption<string>[] = useMemo(() => {
    const set = new Set<string>();
    for (const v of vault.vaultLogs) set.add(v.by_text);
    for (const o of ordersDb.orders) set.add(o.by_text);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vault.vaultLogs, ordersDb.orders]);

  const itemFilterOptions: DropOption<string>[] = useMemo(() => {
    const set = new Set<string>();
    for (const v of vault.vaultLogs) set.add(v.item);
    for (const o of ordersDb.orders) set.add(o.item);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vault.vaultLogs, ordersDb.orders]);

  const partyFilterOptions: DropOption<string>[] = useMemo(() => {
    const set = new Set<string>();
    for (const o of ordersDb.orders) set.add(o.party);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [ordersDb.orders]);

  // central filter
  const [centralTab, setCentralTab] = useState<CentralTab>("TODOS");
  const [centralSearch, setCentralSearch] = useState("");
  const [centralBy, setCentralBy] = useState<string>("");
  const [centralParty, setCentralParty] = useState<string>("");
  const [centralItem, setCentralItem] = useState<string>("");

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

    // auth clube
    members,
    memberOptions,
    clubPass,
    setClubPass,
    memberId,
    setMemberId,
    pin,
    setPin,
    loggedMember,
    error,
    handleLogin,
    handleLogout,

    // pin
    changingPin,
    setChangingPin,
    newPin,
    setNewPin,
    confirmNewPin,

    // central
    centralTab,
    setCentralTab,
    centralSearch,
    setCentralSearch,
    centralBy,
    setCentralBy,
    centralParty,
    setCentralParty,
    centralItem,
    setCentralItem,

    memberNameOptions,
    itemFilterOptions,
    partyFilterOptions,

    centralVault,
    centralOrders,

    hideVaultForMe,
    hideOrderForMe,

    // forms
    vaultDirection,
    setVaultDirection,
    vaultItemOption,
    setVaultItemOption,
    vaultItemCustom,
    setVaultItemCustom,
    vaultQty,
    setVaultQty,
    vaultWhere,
    setVaultWhere,
    vaultObs,
    setVaultObs,

    orderKind,
    setOrderKind,
    orderItemOption,
    setOrderItemOption,
    orderItemCustom,
    setOrderItemCustom,
    orderQty,
    setOrderQty,

    orderPartyOrgOption,
    setOrderPartyOrgOption,
    orderPartyOrgCustom,
    setOrderPartyOrgCustom,

    orderPartyMemberId,
    setOrderPartyMemberId,

    orderNotes,
    setOrderNotes,

    addVaultLog,
    addOrder,

    // ✅ delete pro page passar
    deleteVaultLog: vault.deleteVaultLog,
    deleteOrder: ordersDb.deleteOrder,

    // export extras
    ORGS,
    ITEMS,
  };
}
