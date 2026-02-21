"use client";

import { NiceSelect } from "@/components/ui/NiceSelect";

export function OrgDropdown({
  value,
  setValue,
  options,
}: {
  value: string;
  setValue: (v: string) => void;
  options: readonly string[];
}) {
  const mapped = options.map((o) => ({ value: o, label: o }));

  return (
    <NiceSelect<string>
      value={value}
      options={mapped}
      onChange={setValue}
      searchable
      searchPlaceholder="Buscar organização..."
    />
  );
}