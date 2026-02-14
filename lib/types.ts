export type Member = {
  id: number;
  name: string;
  pin: string;
  mustChangePin: boolean;
};

export type VaultDirection = "ENTRADA" | "SAIDA";

export type VaultLog = {
  id: string;
  created_when: string;
  direction: VaultDirection;
  item: string;
  qty: number;
  where_text: string;
  obs: string;
  by_text: string;
};

export type OrderKind = "EXTERNO" | "INTERNO";
export type OrderPartyType = "ORG" | "MEMBER";

export type Order = {
  id: string;
  created_when: string;
  kind: OrderKind;
  item: string;
  qty: number;
  party_type: OrderPartyType;
  party: string;
  notes: string;
  by_text: string;
};

export type WebhookChannel = "vault" | "orders";

export type CentralTab = "TODOS" | "BAU" | "PEDIDOS";
