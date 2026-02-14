import { OrderKind, VaultDirection } from "./types";
import { ItemOption, OrgOption } from "./constants";

export function nowBR() {
  return new Date().toLocaleString();
}

export function resolveOrg(option: OrgOption, custom: string) {
  return option === "OUTRO" ? custom.trim() : option;
}

export function resolveItem(option: ItemOption, custom: string) {
  if (option === "OUTRO") return custom.trim();
  return String(option);
}

export function vaultTitle(direction: VaultDirection) {
  return direction === "ENTRADA" ? "ENTRADA" : "SAÍDA";
}

export function vaultColor(direction: VaultDirection) {
  return direction === "ENTRADA" ? 5763719 : 15548997;
}

export function orderColor(kind: OrderKind) {
  return kind === "EXTERNO" ? 3447003 : 10181046;
}
