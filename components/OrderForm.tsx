"use client";

import type { OrderKind } from "@/lib/types";
import type { ItemOption, OrgOption } from "@/lib/constants";
import { ITEMS, ORGS } from "@/lib/constants";
import { ItemDropdown } from "@/components/ui/ItemDropdown";
import { OrgDropdown } from "@/components/ui/OrgDropdown";
import { NiceSelect } from "@/components/ui/NiceSelect";

export function OrderForm(props: {
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
    <section className="panel p-4">
      <h2 className="text-lg font-semibold">🧾 Registrar Pedido</h2>

      <form onSubmit={props.onSubmit} className="mt-3 grid gap-3">
        <div>
          <label className="block text-sm text-white/80">Tipo</label>
          <NiceSelect<OrderKind>
            value={props.orderKind}
            options={orderKindOptions}
            onChange={props.setOrderKind}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Item</label>
          <ItemDropdown
            value={props.orderItemOption}
            setValue={(v) => props.setOrderItemOption(v as ItemOption)}
            options={[...ITEMS, "OUTRO"]}
            placeholder="Buscar item..."
          />
          {props.orderItemOption === "OUTRO" && (
            <input
              className="input mt-2"
              value={props.orderItemCustom}
              onChange={(e) => props.setOrderItemCustom(e.target.value)}
              placeholder="Digite o item..."
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80">Quantidade</label>
          <input
            type="number"
            min={1}
            className="input mt-1"
            value={props.orderQty}
            onChange={(e) => props.setOrderQty(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">
            {props.orderKind === "INTERNO" ? "Membro do clube" : "Organização / Parte"}
          </label>

          {props.orderKind === "INTERNO" ? (
            <NiceSelect<number>
              value={props.orderPartyMemberId}
              options={props.memberOptions}
              onChange={props.setOrderPartyMemberId}
              searchable
              searchPlaceholder="Buscar membro..."
            />
          ) : (
            <>
              <OrgDropdown
                value={props.orderPartyOrgOption}
                setValue={(v) => props.setOrderPartyOrgOption(v as OrgOption)}
                options={[...ORGS, "OUTRO"]}
              />
              {props.orderPartyOrgOption === "OUTRO" && (
                <input
                  className="input mt-2"
                  value={props.orderPartyOrgCustom}
                  onChange={(e) => props.setOrderPartyOrgCustom(e.target.value)}
                  placeholder="Digite o nome da organização..."
                />
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80">Observações</label>
          <input
            className="input mt-1"
            value={props.orderNotes}
            onChange={(e) => props.setOrderNotes(e.target.value)}
            placeholder="Ex: Pra amanhã"
          />
        </div>

        <button className="btn-primary">Registrar Pedido</button>
      </form>
    </section>
  );
}