// lib/server/clubData.ts
import type { Member } from "@/lib/types";

// Segredos ficam no servidor. NÃO importe isso em componente client.
export const CLUB_PASSWORD = "jgcalvo";

export const MEMBERS_WITH_PINS: Member[] = [
  { id: 1, name: "Drk", pin: "aoddrk", mustChangePin: true },
  { id: 2, name: "Nando", pin: "aodnando", mustChangePin: true },
  // ... completa com os seus membros
  { id: 26, name: "Ryss", pin: "aodryss", mustChangePin: true },
];

// Admin por ID do clube
export const ADMIN_IDS = new Set<number>([1, 2]);

// Quem pode registrar pedidos
export const ORDER_ALLOWED_IDS = new Set<number>([1, 2, 20]);