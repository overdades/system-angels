import { Member } from "./types";

export function hiddenOrdersKey(mid: number) {
  return `hiddenOrders:${mid}`;
}
export function hiddenVaultKey(mid: number) {
  return `hiddenVault:${mid}`;
}

export function loadHiddenSet(key: string): Set<string> {
  const raw = localStorage.getItem(key);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function saveHiddenSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export function loadMemberPin(id: number): Member | null {
  const raw = localStorage.getItem(`memberPin:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

export function saveMemberPin(member: Member) {
  localStorage.setItem(`memberPin:${member.id}`, JSON.stringify(member));
}
