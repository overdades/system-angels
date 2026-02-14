"use client";

import { useMemo, useState } from "react";
import { useCloseOnOutsideClick } from "@/hooks/useCloseOnOutsideClick";

export type DropOption<T extends string | number> = { value: T; label: string };

export function NiceSelect<T extends string | number>({
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
  const ref = useCloseOnOutsideClick<HTMLDivElement>(open, setOpen);

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

          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-white/60">
              Nada encontrado.
            </div>
          ) : (
            filtered.map((opt) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
