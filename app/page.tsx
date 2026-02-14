"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* =====================================================
   TYPES
===================================================== */

type Member = { id: number; name: string; pin: string; mustChangePin: boolean };

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

// quem é o "PARA" do pedido
type OrderPartyType = "ORG" | "MEMBER";

type Order = {
  id: string;
  when: string;
  kind: OrderKind;
  item: string;
  qty: number;

  partyType: OrderPartyType;
  party: string;

  notes: string;
  by: string;
};

type WebhookChannel = "vault" | "orders";

/* =====================================================
   CONFIG
===================================================== */

const CLUB_PASSWORD = "jgcalvo";

const MEMBERS: Member[] = [
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

const ORDER_ALLOWED_IDS = new Set<number>([1, 2]);

// org presets
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

// item presets (edita aqui quando quiser)
const ITEMS = ["1911", "Munição 9mm"] as const;

type ItemPreset = (typeof ITEMS)[number];
type ItemOption = ItemPreset | "OUTRO";

/* =====================================================
   HELPERS
===================================================== */

function nowBR(): string {
  return new Date().toLocaleString();
}

function resolveParty(option: OrgOption, custom: string) {
  return option === "OUTRO" ? custom.trim() : option;
}

function resolvePartyFromOrg(option: OrgOption, custom: string) {
  return resolveParty(option, custom);
}

function resolveItem(option: ItemOption, custom: string) {
  if (option === "OUTRO") return custom.trim();
  return String(option);
}

function vaultTitle(direction: VaultDirection) {
  return direction === "ENTRADA" ? "ENTRADA" : "SAÍDA";
}

function vaultColor(direction: VaultDirection) {
  return direction === "ENTRADA" ? 5763719 : 15548997;
}

function orderColor(kind: OrderKind) {
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
    // intentionally silent (MVP)
  }
}

/* =====================================================
   GENERIC DROPDOWN CORE
===================================================== */

type DropOption<T extends string | number> = {
  value: T;
  label: string;
};

function useCloseOnOutsideClick(open: boolean, setOpen: (v: boolean) => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return ref;
}

function NiceSelect<T extends string | number>({
  value,
  options,
  onChange,
  placeholder,
  searchable = false,
  searchPlaceholder = "Buscar...",
}: {
  value: T;
  options: DropOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useCloseOnOutsideClick(open, setOpen);

  const current =
    options.find((o) => o.value === value)?.label ?? placeholder ?? "";

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const s = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [options, searchable, search]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-left hover:bg-black/50 transition"
      >
        {current || placeholder}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur shadow-xl p-2 max-h-60 overflow-auto">
          {searchable && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full mb-2 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm outline-none"
            />
          )}

          {filtered.map((opt) => (
            <div
              key={String(opt.value)}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                setSearch("");
              }}
              className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   ORG DROPDOWN
===================================================== */

function OrgDropdown({
  value,
  customValue,
  onChange,
}: {
  value: OrgOption;
  customValue: string;
  onChange: (opt: OrgOption, custom?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useCloseOnOutsideClick(open, setOpen);

  const filtered = ORGS.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const label = value === "OUTRO" ? customValue || "Outro..." : value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-left hover:bg-black/50 transition"
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur shadow-xl p-2 max-h-60 overflow-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar organização..."
            className="w-full mb-2 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm outline-none"
          />

          {filtered.map((org) => (
            <div
              key={org}
              onClick={() => {
                onChange(org);
                setOpen(false);
                setSearch("");
              }}
              className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              {org}
            </div>
          ))}

          <div
            onClick={() => onChange("OUTRO")}
            className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer text-white/70"
          >
            Outro...
          </div>

          {value === "OUTRO" && (
            <input
              value={customValue}
              onChange={(e) => onChange("OUTRO", e.target.value)}
              placeholder="Digite o nome..."
              className="mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm outline-none"
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   ITEM DROPDOWN (BAÚ + PEDIDOS)
===================================================== */

function ItemDropdown({
  value,
  customValue,
  onChange,
}: {
  value: ItemOption;
  customValue: string;
  onChange: (opt: ItemOption, custom?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useCloseOnOutsideClick(open, setOpen);

  const filtered = (ITEMS as readonly string[]).filter((it) =>
    it.toLowerCase().includes(search.toLowerCase())
  );

  const label = value === "OUTRO" ? customValue || "Outro..." : String(value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-left hover:bg-black/50 transition"
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur shadow-xl p-2 max-h-60 overflow-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="w-full mb-2 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm outline-none"
          />

          {filtered.map((it) => (
            <div
              key={it}
              onClick={() => {
                onChange(it as ItemOption);
                setOpen(false);
                setSearch("");
              }}
              className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              {it}
            </div>
          ))}

          <div
            onClick={() => onChange("OUTRO")}
            className="px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer text-white/70"
          >
            Outro...
          </div>

          {value === "OUTRO" && (
            <input
              value={customValue}
              onChange={(e) => onChange("OUTRO", e.target.value)}
              placeholder="Digite o item..."
              className="mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm outline-none"
            />
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   HOME PAGE
===================================================== */

export default function Home() {
  const [clubPass, setClubPass] = useState("");
  const [memberId, setMemberId] = useState<number>(MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loggedMember, setLoggedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Change Pin
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  // Baú
  const [vaultDirection, setVaultDirection] =
    useState<VaultDirection>("ENTRADA");

  // Baú: item como preset + "OUTRO"
  const [vaultItemOption, setVaultItemOption] = useState<ItemOption>("OUTRO");
  const [vaultItemCustom, setVaultItemCustom] = useState("");

  const [vaultQty, setVaultQty] = useState<number>(1);
  const [vaultWhere, setVaultWhere] = useState("");
  const [vaultObs, setVaultObs] = useState("");
  const [vaultLogs, setVaultLogs] = useState<VaultLog[]>([]);

  // Pedidos
  const [orderKind, setOrderKind] = useState<OrderKind>("EXTERNO");

  const [orderItemOption, setOrderItemOption] = useState<ItemOption>("OUTRO");
  const [orderItemCustom, setOrderItemCustom] = useState("");

  const [orderQty, setOrderQty] = useState<number>(1);

  // party dinâmico:
  // - EXTERNO: ORGS
  // - INTERNO: MEMBERS
  const [orderPartyOrgOption, setOrderPartyOrgOption] = useState<OrgOption>(
    ORGS[0]
  );
  const [orderPartyOrgCustom, setOrderPartyOrgCustom] = useState("");

  const [orderPartyMemberId, setOrderPartyMemberId] = useState<number>(
    MEMBERS[0]?.id ?? 1
  );

  const [orderNotes, setOrderNotes] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

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

  // membros "reais" (com pin custom salvo no browser)
  // default: MEMBERS, depois do mount a gente carrega do localStorage
  const [membersWithSavedPins, setMembersWithSavedPins] = useState<Member[]>(MEMBERS);

  useEffect(() => {
    // aqui já é browser, então localStorage existe
    const loaded = MEMBERS.map((m) => {
      const raw = localStorage.getItem(`memberPin:${m.id}`);
      if (!raw) return m;

      try {
        return JSON.parse(raw) as Member;
      } catch {
        return m;
      }
    });

    setMembersWithSavedPins(loaded);
  }, []);


  // Carrega estado inicial
  useEffect(() => {
    const savedMember = localStorage.getItem("loggedMember");
    if (savedMember) setLoggedMember(JSON.parse(savedMember));

    const savedVault = localStorage.getItem("vaultLogs");
    if (savedVault) setVaultLogs(JSON.parse(savedVault));

    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("vaultLogs", JSON.stringify(vaultLogs));
  }, [vaultLogs]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Sempre que troca o perfil, recarrega o que foi ocultado por aquele membro
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

  // Quando muda para INTERNO, força party = member; quando volta EXTERNO, party = org
  useEffect(() => {
    if (orderKind === "INTERNO") {
      setOrderPartyMemberId((prev) => prev ?? (membersWithSavedPins[0]?.id ?? 1));
    } else {
      setOrderPartyOrgOption((prev) => prev ?? ORGS[0]);
    }
  }, [orderKind, membersWithSavedPins]);

  const selectedMember = useMemo(() => {
    return membersWithSavedPins.find((m) => m.id === memberId)!;
  }, [memberId, membersWithSavedPins]);

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

    const updatedMember: Member = {
      ...selectedMember,
      pin: newPin.trim(),
      mustChangePin: false,
    };

    localStorage.setItem(`memberPin:${updatedMember.id}`, JSON.stringify(updatedMember));
    localStorage.setItem("loggedMember", JSON.stringify(updatedMember));

    setLoggedMember(updatedMember);
    setChangingPin(false);
    setNewPin("");
  }

  async function addVaultLog(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedMember) return;

    const finalVaultItem = resolveItem(vaultItemOption, vaultItemCustom);
    if (!finalVaultItem) return;

    const log: VaultLog = {
      id: crypto.randomUUID(),
      when: nowBR(),
      direction: vaultDirection,
      item: finalVaultItem,
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
      const member = membersWithSavedPins.find((m) => m.id === orderPartyMemberId);
      party = member?.name ?? "";
      partyType = "MEMBER";
      if (!party) return;
    } else {
      party = resolvePartyFromOrg(orderPartyOrgOption, orderPartyOrgCustom);
      partyType = "ORG";
      if (orderPartyOrgOption === "OUTRO" && !party) return;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      when: nowBR(),
      kind: orderKind,
      item: finalItem,
      qty: orderQty,
      partyType,
      party,
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
      setOrderPartyMemberId(membersWithSavedPins[0]?.id ?? 1);
    }
  }

  const visibleOrders = useMemo(() => {
    return orders.filter((o) => !hiddenOrderIds.has(o.id));
  }, [orders, hiddenOrderIds]);

  const visibleVaultLogs = useMemo(() => {
    return vaultLogs.filter((v) => !hiddenVaultIds.has(v.id));
  }, [vaultLogs, hiddenVaultIds]);

  const memberOptions: DropOption<number>[] = membersWithSavedPins.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const vaultDirectionOptions: DropOption<VaultDirection>[] = [
    { value: "ENTRADA", label: "Entrada" },
    { value: "SAIDA", label: "Saída" },
  ];

  const orderKindOptions: DropOption<OrderKind>[] = [
    { value: "EXTERNO", label: "Externo" },
    { value: "INTERNO", label: "Interno" },
  ];

  const orderMemberTargetOptions: DropOption<number>[] = membersWithSavedPins.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  // ======= FIX TS: member guard =======
  const member = loggedMember;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 select-none">
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-bold">ANGELS OF CODES</h1>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/logo-angels.png"
            alt=""
            className="select-none absolute right-[-120px] top-1/2 -translate-y-1/2 opacity-[0.03] w-[520px] lg:w-[700px]"
          />
        </div>

        {changingPin ? (
          <form onSubmit={confirmNewPin} className="space-y-4 max-w-md mt-6">
            <h2 className="text-lg font-semibold">Crie seu PIN pessoal</h2>

            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Novo PIN"
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
            />

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button className="w-full rounded-xl bg-white text-black py-2">
              Confirmar novo PIN
            </button>
          </form>
        ) : !member ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <form onSubmit={handleLogin} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm italic text-white/80">
                  Senha do clube
                </label>
                <input
                  value={clubPass}
                  onChange={(e) => setClubPass(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                  placeholder="Digite a senha do clube"
                />
              </div>

              <div>
                <label className="block text-sm italic text-white/80">
                  Membro
                </label>
                <NiceSelect<number>
                  value={memberId}
                  options={memberOptions}
                  onChange={(v) => setMemberId(v)}
                  searchable
                  searchPlaceholder="Buscar membro..."
                />
              </div>

              <div>
                <label className="block text-sm italic text-white/80">PIN</label>
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
                <div className="text-lg font-semibold">{member.name}</div>
                <div className="text-xs text-white/60">ID: {member.id}</div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/5"
              >
                Sair
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* BAÚ */}
              <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">📦 Log do Baú</h2>

                <form onSubmit={addVaultLog} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <NiceSelect<VaultDirection>
                      value={vaultDirection}
                      options={vaultDirectionOptions}
                      onChange={(v) => setVaultDirection(v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Item</label>

                    {(ITEMS as readonly string[]).length > 0 ? (
                      <div className="mt-1">
                        <ItemDropdown
                          value={vaultItemOption}
                          customValue={vaultItemCustom}
                          onChange={(opt, custom) => {
                            setVaultItemOption(opt);
                            if (opt === "OUTRO") setVaultItemCustom(custom ?? "");
                            else setVaultItemCustom("");
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        value={vaultItemCustom}
                        onChange={(e) => {
                          setVaultItemOption("OUTRO");
                          setVaultItemCustom(e.target.value);
                        }}
                        placeholder="(Sem itens cadastrados) digite o item..."
                        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                      />
                    )}
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
                    visibleVaultLogs.map((log) => (
                      <div
                        key={log.id}
                        className="relative rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
                      >
                        <button
                          type="button"
                          onClick={() => hideVaultForMe(log.id)}
                          title="Ocultar deste perfil"
                          className="absolute right-2 top-2 h-6 w-6 rounded-full border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center leading-none"
                        >
                          ×
                        </button>

                        <div className="font-medium pr-10">
                          {log.direction} — {log.item} x{log.qty}
                        </div>

                        {log.where && (
                          <div className="text-white/70 mt-1">Onde: {log.where}</div>
                        )}
                        {log.obs && (
                          <div className="text-white/70 mt-1">Obs: {log.obs}</div>
                        )}

                        <div className="mt-2 flex items-end justify-between">
                          <div className="text-white/60">Por: {log.by}</div>
                          <div className="text-white/50 text-xs">{log.when}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* PEDIDOS */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold">🧾 Pedidos</h2>

                <form onSubmit={addOrder} className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-sm text-white/80">Tipo</label>
                    <NiceSelect<OrderKind>
                      value={orderKind}
                      options={orderKindOptions}
                      onChange={(v) => setOrderKind(v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/80">Item</label>

                    {(ITEMS as readonly string[]).length > 0 ? (
                      <div className="mt-1">
                        <ItemDropdown
                          value={orderItemOption}
                          customValue={orderItemCustom}
                          onChange={(opt, custom) => {
                            setOrderItemOption(opt);
                            if (opt === "OUTRO") setOrderItemCustom(custom ?? "");
                            else setOrderItemCustom("");
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        value={orderItemCustom}
                        onChange={(e) => {
                          setOrderItemOption("OUTRO");
                          setOrderItemCustom(e.target.value);
                        }}
                        placeholder="(Sem itens cadastrados) digite o item..."
                        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
                      />
                    )}
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
                      {orderKind === "INTERNO" ? "Membro do clube" : "Organização / Parte"}
                    </label>

                    {orderKind === "INTERNO" ? (
                      <NiceSelect<number>
                        value={orderPartyMemberId}
                        options={orderMemberTargetOptions}
                        onChange={(v) => setOrderPartyMemberId(v)}
                        searchable
                        searchPlaceholder="Buscar membro..."
                      />
                    ) : (
                      <OrgDropdown
                        value={orderPartyOrgOption}
                        customValue={orderPartyOrgCustom}
                        onChange={(opt, custom) => {
                          setOrderPartyOrgOption(opt);
                          if (opt === "OUTRO") setOrderPartyOrgCustom(custom ?? "");
                          else setOrderPartyOrgCustom("");
                        }}
                      />
                    )}
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
                    visibleOrders.map((o) => (
                      <div
                        key={o.id}
                        className="relative rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
                      >
                        <button
                          type="button"
                          onClick={() => hideOrderForMe(o.id)}
                          title="Ocultar deste perfil"
                          className="absolute right-2 top-2 h-6 w-6 rounded-full border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center leading-none"
                        >
                          ×
                        </button>

                        <div className="font-medium pr-10">
                          {o.kind} — {o.item} x{o.qty}
                        </div>

                        <div className="text-white/70 mt-1">
                          Para: {o.party || "-"}{" "}
                          <span className="text-white/40">
                            ({o.partyType === "MEMBER" ? "membro" : "org"})
                          </span>
                        </div>

                        {o.notes && <div className="text-white/70 mt-1">{o.notes}</div>}

                        <div className="mt-2 flex items-end justify-between">
                          <div className="text-white/60">Por: {o.by}</div>
                          <div className="text-white/50 text-xs">{o.when}</div>
                        </div>
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
