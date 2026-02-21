"use client";

import type { VaultDirection } from "@/lib/types";
import type { ItemOption } from "@/lib/constants";
import { ITEMS } from "@/lib/constants";
import { ItemDropdown } from "@/components/ui/ItemDropdown";
import { NiceSelect } from "@/components/ui/NiceSelect";

export function VaultForm(props: {
  vaultDirection: VaultDirection;
  setVaultDirection: (v: VaultDirection) => void;

  vaultItemOption: ItemOption;
  setVaultItemOption: (v: ItemOption) => void;

  vaultItemCustom: string;
  setVaultItemCustom: (v: string) => void;

  vaultQty: number;
  setVaultQty: (v: number) => void;

  vaultWhere: string;
  setVaultWhere: (v: string) => void;

  vaultObs: string;
  setVaultObs: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}) {
  const vaultDirectionOptions = [
    { value: "ENTRADA" as const, label: "Entrada" },
    { value: "SAIDA" as const, label: "Saída" },
  ];

  return (
    <section className="panel p-4">
      <h2 className="text-lg font-semibold">📦 Registrar Baú</h2>

      <form onSubmit={props.onSubmit} className="mt-3 grid gap-3">
        <div>
          <label className="block text-sm text-white/80">Tipo</label>
          <NiceSelect<VaultDirection>
            value={props.vaultDirection}
            options={vaultDirectionOptions}
            onChange={props.setVaultDirection}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Item</label>
          <ItemDropdown
            value={props.vaultItemOption}
            setValue={(v) => props.setVaultItemOption(v as ItemOption)}
            options={[...ITEMS, "OUTRO"]}
            placeholder="Buscar item..."
          />

          {props.vaultItemOption === "OUTRO" && (
            <input
              className="input mt-2"
              value={props.vaultItemCustom}
              onChange={(e) => props.setVaultItemCustom(e.target.value)}
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
            value={props.vaultQty}
            onChange={(e) => props.setVaultQty(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Onde</label>
          <input
            className="input mt-1"
            value={props.vaultWhere}
            onChange={(e) => props.setVaultWhere(e.target.value)}
            placeholder="Ex: Porta-malas do Lucena"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80">Obs</label>
          <input
            className="input mt-1"
            value={props.vaultObs}
            onChange={(e) => props.setVaultObs(e.target.value)}
            placeholder="Ex: Devolver pra ele"
          />
        </div>

        <button className="btn-primary">Registrar no Baú</button>
      </form>
    </section>
  );
}