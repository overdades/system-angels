"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import type {
  Member,
  Order,
  OrderKind,
  OrderPartyType,
  VaultDirection,
  VaultLog,
} from "@/lib/types";
import {
  ADMIN_IDS,
  BASE_MEMBERS,
  CLUB_PASSWORD,
  ItemOption,
  ORDER_ALLOWED_IDS,
  ORGS,
  OrgOption,
  VaultStorePlace,
} from "@/lib/constants";
import { buildOrderEmbed, buildVaultEmbed, postWebhook } from "@/lib/webhook";
import { mapOrderRow } from "@/hooks/useOrdersData";
import { mapVaultRow, nowBR } from "@/hooks/useVaultData";
import type { DropOption } from "@/components/ui/NiceSelect";

type CentralTab = "TODOS" | "BAU" | "PEDIDOS";

export function useClubApp() {
  const supabase = useMemo(() => getSupabase(), []);

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

  // forms vault
  const [vaultDirection, setVaultDirection] =
    useState<VaultDirection>("ENTRADA");

  const [vaultItemOption, setVaultItemOption] = useState<ItemOption>("OUTRO");
  const [vaultItemCustom, setVaultItemCustom] = useState("");

  const [vaultQty, setVaultQty] = useState<number>(1);

  /** ✅ NOVO: onde guardar */
  const [vaultStorePlace, setVaultStorePlace] =
    useState<VaultStorePlace>("BAU_MEMBRO");

  /** ✅ NOVO: se Porta-malas, “de quem?” */
  const [vaultTrunkWho, setVaultTrunkWho] = useState("");

  const [vaultObs, setVaultObs] = useState("");

  // forms order
  const [orderKind, setOrderKind] = useState<OrderKind>("EXTERNO");
  const [orderItemOption, setOrderItemOption] = useState<ItemOption>("OUTRO");
  const [orderItemCustom, setOrderItemCustom] = useState("");
  const [orderQty, setOrderQty] = useState<number>(1);

  const [orderPartyOrgOption, setOrderPartyOrgOption] = useState<OrgOption>(
    ORGS[0]
  );
  const [orderPartyOrgCustom, setOrderPartyOrgCustom] = useState("");

  const [orderPartyMemberId, setOrderPartyMemberId] = useState<number>(
    BASE_MEMBERS[0]?.id ?? 1
  );

  const [orderNotes, setOrderNotes] = useState("");

  // data
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

  const isAdminAuthed = !!loggedMember && ADMIN_IDS.has(loggedMember.id);

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
      localStorage.setItem(
        hiddenOrdersKey(loggedMember.id),
        JSON.stringify(Array.from(next))
      );
      return next;
    });
  }

  function hideVaultForMe(vaultId: string) {
    if (!loggedMember) return;
    setHiddenVaultIds((prev) => {
      const next = new Set(prev);
      next.add(vaultId);
      localStorage.setItem(
        hiddenVaultKey(loggedMember.id),
        JSON.stringify(Array.from(next))
      );
      return next;
    });
  }

  // bootstrap: pins custom + sessão
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

  // hidden sets
  useEffect(() => {
    if (!loggedMember) return;

    const rawOrders = localStorage.getItem(hiddenOrdersKey(loggedMember.id));
    setHiddenOrderIds(rawOrders ? new Set(JSON.parse(rawOrders)) : new Set());

    const rawVault = localStorage.getItem(hiddenVaultKey(loggedMember.id));
    setHiddenVaultIds(rawVault ? new Set(JSON.parse(rawVault)) : new Set());
  }, [loggedMember]);

  // loader + realtime
  async function loadFromDb() {
    if (!supabase) return;

    const [vaultRes, ordersRes] = await Promise.all([
      supabase
        .from("vault_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    if (!vaultRes.error && Array.isArray(vaultRes.data)) {
      setVaultLogs(vaultRes.data.map(mapVaultRow));
    } else if (vaultRes.error) {
      console.error("vault select error:", vaultRes.error);
    }

    if (!ordersRes.error && Array.isArray(ordersRes.data)) {
      setOrders(ordersRes.data.map(mapOrderRow));
    } else if (ordersRes.error) {
      console.error("orders select error:", ordersRes.error);
    }
  }

  useEffect(() => {
    if (!supabase) return;

    loadFromDb();

    const vaultChannel = supabase
      .channel("realtime-vault")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vault_logs" },
        (payload) => {
          const log = mapVaultRow((payload as any).new);
          setVaultLogs((prev) =>
            prev.some((p) => p.id === log.id) ? prev : [log, ...prev]
          );
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = mapOrderRow((payload as any).new);
          setOrders((prev) =>
            prev.some((p) => p.id === order.id) ? prev : [order, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vaultChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [supabase]);

  // login / pin change
  const selectedMember = useMemo(
    () => members.find((m) => m.id === memberId) ?? members[0],
    [members, memberId]
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

    localStorage.setItem(`memberPin:${updated.id}`, JSON.stringify(updated));
    setMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );

    setLoggedMember(updated);
    localStorage.setItem("loggedMember", JSON.stringify(updated));

    setChangingPin(false);
    setNewPin("");
  }

  // helpers
  function resolveItem(option: ItemOption, custom: string) {
    return option === "OUTRO" ? custom.trim() : String(option);
  }

  function resolveOrg(option: OrgOption, custom: string) {
    return option === "OUTRO" ? custom.trim() : option;
  }

  /** ✅ NOVO: monta onde guardar em texto final */
  function buildWhereText(place: VaultStorePlace, who: string) {
    if (place === "BAU_MEMBRO") return "Baú membro";
    if (place === "BAU_GERENCIA") return "Baú gerência";
    // porta malas
    const clean = who.trim();
    return clean ? `Porta-malas do ${clean}` : "Porta-malas";
  }

  // create vault
  async function addVaultLog(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    const finalItem = resolveItem(vaultItemOption, vaultItemCustom);
    if (!finalItem) return;

    if (vaultStorePlace === "PORTA_MALAS" && !vaultTrunkWho.trim()) {
      alert("Digite de quem é o porta-malas.");
      return;
    }

    const log: VaultLog = {
      id: crypto.randomUUID(),
      created_when: nowBR(),
      direction: vaultDirection,
      item: finalItem,
      qty: vaultQty,
      where_text: buildWhereText(vaultStorePlace, vaultTrunkWho),
      obs: vaultObs.trim(),
      by_text: loggedMember.name,
    };

    setVaultLogs((prev) => [log, ...prev]);

    if (supabase) {
      const { error: dbErr } = await supabase.from("vault_logs").insert([log]);
      if (dbErr) {
        setVaultLogs((prev) => prev.filter((v) => v.id !== log.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("vault", buildVaultEmbed(log));

    // reset
    setVaultItemOption("OUTRO");
    setVaultItemCustom("");
    setVaultQty(1);

    setVaultStorePlace("BAU_MEMBRO");
    setVaultTrunkWho("");

    setVaultObs("");
  }

  // create order
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
      const { error: dbErr } = await supabase.from("orders").insert([order]);
      if (dbErr) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        alert("Erro ao salvar no banco (Supabase). Veja o console.");
        console.error(dbErr);
        return;
      }
    }

    await postWebhook("orders", buildOrderEmbed(order));

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

  // delete (admin)
  async function deleteVaultLog(id: string) {
    if (!supabase) throw new Error("Supabase não configurado.");
    if (!isAdminAuthed) throw new Error("Sem permissão.");

    setVaultLogs((prev) => prev.filter((x) => x.id !== id));
    const { error } = await supabase.from("vault_logs").delete().eq("id", id);
    if (error) throw error;
  }

  async function deleteOrder(id: string) {
    if (!supabase) throw new Error("Supabase não configurado.");
    if (!isAdminAuthed) throw new Error("Sem permissão.");

    setOrders((prev) => prev.filter((x) => x.id !== id));
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  }

  // derived
  const visibleVaultLogs = useMemo(
    () => vaultLogs.filter((v) => !hiddenVaultIds.has(v.id)),
    [vaultLogs, hiddenVaultIds]
  );
  const visibleOrders = useMemo(
    () => orders.filter((o) => !hiddenOrderIds.has(o.id)),
    [orders, hiddenOrderIds]
  );

  const memberOptions: DropOption<number>[] = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const memberNameOptions: DropOption<string>[] = useMemo(() => {
    const set = new Set<string>();
    for (const v of vaultLogs) set.add(v.by_text);
    for (const o of orders) set.add(o.by_text);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vaultLogs, orders]);

  const itemFilterOptions: DropOption<string>[] = useMemo(() => {
    const set = new Set<string>();
    for (const v of vaultLogs) set.add(v.item);
    for (const o of orders) set.add(o.item);
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "", label: "Todos" }, ...arr.map((x) => ({ value: x, label: x }))];
  }, [vaultLogs, orders]);

  const partyFilterOptions: DropOption<string>[] = useMemo(() => {
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

    // auth
    clubPass,
    setClubPass,
    memberId,
    setMemberId,
    pin,
    setPin,
    loggedMember,
    error,
    changingPin,
    setChangingPin,
    newPin,
    setNewPin,
    selectedMember,

    handleLogin,
    handleLogout,
    confirmNewPin,

    // forms vault
    vaultDirection,
    setVaultDirection,
    vaultItemOption,
    setVaultItemOption,
    vaultItemCustom,
    setVaultItemCustom,
    vaultQty,
    setVaultQty,

    vaultStorePlace,
    setVaultStorePlace,
    vaultTrunkWho,
    setVaultTrunkWho,

    vaultObs,
    setVaultObs,
    addVaultLog,

    // forms order
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
    addOrder,

    // data / lists
    members,
    memberOptions,
    memberNameOptions,
    itemFilterOptions,
    partyFilterOptions,

    centralTab,
    setCentralTab,
    centralSearch,
    setCentralSearch,
    centralBy,
    setCentralBy,
    centralItem,
    setCentralItem,
    centralParty,
    setCentralParty,

    centralVault,
    centralOrders,
    hideVaultForMe,
    hideOrderForMe,

    // admin
    isAdminAuthed,
    deleteVaultLog,
    deleteOrder,
  };
}