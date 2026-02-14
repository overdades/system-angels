"use client";

import { OrderKind } from "@/lib/types";
import { ItemOption, OrgOption, ORGS, ITEMS } from "@/lib/constants";
import { NiceSelect } from "@/components/ui/NiceSelect";
import { ItemDropdown } from "@/components/ui/ItemDropdown";
import { OrgDropdown } from "@/components/ui/OrgDropdown";

export function OrderForm({
  orderKind,
  setOrderKind,
  orderItemOption,
  setOrderItemOption,
  orderItemCustom,
  setOrderItemCustom,
  orderQty,
  setOrderQty,
  orderPartyMemberId,
  setOrderPartyMemberId,
  memberOptions,
  orderPartyOrgOption,
  setOrderPartyOrgOption,
  orderPartyOrgCustom,
  setOrderPartyOrgCustom,
  orderNotes,
  setOrderNotes,
  onSubmit,
}: {
  orderKind: OrderKind;
  setOrderKind: (v: OrderKind) => void;

  orderItemOption: ItemOption;
  setOrderItemOption: (v: ItemOption) => void;

  orderItemCustom: string;
  setOrderItemCustom: (v: string) => void;

  orderQty: number;
  setOrderQty: (v: number) => void;

  orderPartyMemberId: number;
  setOrderPartyMemberId: (v: number) => void;

  memberOptions: { value: number; label: string }[];

  orderPartyOrgOption: OrgOption;
  setOrderPartyOrgOption: (v: OrgOption) => void;

  orderPartyOrgCustom: string;
  setOrderPartyOrgCustom: (v: string) => void;

  orderNotes: string;
  setOrderNotes: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}) {
  const orderKindOptions = [
    { value: "EXTERNO" as const, label: "Externo" },
    { value: "INTERNO" as const, label: "Interno" },
  ];

  return (
    <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-lg font-semibold">🧾 Registrar Pedido</h2>

      <form onSubmit={onSubmit} className="mt-3 grid gap-3">
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
              options={memberOptions}
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
    </section>
  );
}
