"use client";

import { useState } from "react";
import { ORGS, OrgOption } from "@/lib/constants";
import { useCloseOnOutsideClick } from "@/hooks/useCloseOnOutsideClick";

export function OrgDropdown({
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
  const ref = useCloseOnOutsideClick<HTMLDivElement>(open, setOpen);

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
