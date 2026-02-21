"use client";

import type { VaultDirection } from "@/lib/types";
import type { ItemOption, VaultStorePlace } from "@/lib/constants";
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

  /** ✅ NOVO: dropdown “onde guardar” */
  vaultStorePlace: VaultStorePlace;
  setVaultStorePlace: (v: VaultStorePlace) => void;

  /** ✅ NOVO: se Porta-malas, digita o nome */
  vaultTrunkWho: string;
  setVaultTrunkWho: (v: string) => void;

  vaultObs: string;
  setVaultObs: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}) {
  const vaultDirectionOptions = [
    { value: "ENTRADA" as const, label: "Entrada" },
    { value: "SAIDA" as const, label: "Saída" },
  ];

  const storeOptions = [
    { value: "BAU_MEMBRO" as const, label: "Baú membro" },
    { value: "BAU_GERENCIA" as const, label: "Baú gerência" },
    { value: "PORTA_MALAS" as const, label: "Porta-malas" },
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

        {/* ✅ NOVO: onde guardar */}
        <div>
          <label className="block text-sm text-white/80">Onde foi armazenado</label>

          <NiceSelect<VaultStorePlace>
            value={props.vaultStorePlace}
            options={storeOptions}
            onChange={props.setVaultStorePlace}
          />

          {props.vaultStorePlace === "PORTA_MALAS" && (
            <input
              className="input mt-2"
              value={props.vaultTrunkWho}
              onChange={(e) => props.setVaultTrunkWho(e.target.value)}
              placeholder="Porta-malas de quem? (ex: Lucena)"
            />
          )}
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