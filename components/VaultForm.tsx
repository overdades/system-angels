"use client";

import { VaultDirection } from "@/lib/types";
import { ItemOption, ITEMS } from "@/lib/constants";
import { NiceSelect } from "@/components/ui/NiceSelect";
import { ItemDropdown } from "@/components/ui/ItemDropdown";

export function VaultForm({
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
  onSubmit,
}: {
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
    <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-lg font-semibold">📦 Registrar Baú</h2>

      <form onSubmit={onSubmit} className="mt-3 grid gap-3">
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
    </section>
  );
}
