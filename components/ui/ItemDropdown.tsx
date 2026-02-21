"use client";

import { NiceSelect } from "@/components/ui/NiceSelect";

export function ItemDropdown({
  value,
  setValue,
  options,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  const mapped = options.map((o) => ({ value: o, label: o }));

  return (
    <NiceSelect<string>
      value={value}
      options={mapped}
      onChange={setValue}
      searchable
      searchPlaceholder={placeholder}
    />
  );
}