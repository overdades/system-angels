import type { Member } from "@/lib/types";

export const CLUB_PASSWORD = "jgcalvo";

export const BASE_MEMBERS: Member[] = [
  { id: 1, name: "Drk", pin: "aoddrk", mustChangePin: true },
  { id: 2, name: "Nando", pin: "aodnando", mustChangePin: true },
  { id: 3, name: "Aurora", pin: "aodaurora", mustChangePin: true },
  { id: 4, name: "Roxy", pin: "aodroxy", mustChangePin: true },
  { id: 5, name: "Rachi", pin: "aodrachi", mustChangePin: true },
  { id: 6, name: "Lucena", pin: "aodlucena", mustChangePin: true },
  { id: 7, name: "Kah", pin: "aodkah", mustChangePin: true },
  { id: 8, name: "Arq", pin: "aodarq", mustChangePin: true },
  { id: 9, name: "Jg", pin: "aodjg", mustChangePin: true },
  { id: 10, name: "Sky", pin: "aodsky", mustChangePin: true },
  { id: 11, name: "Jdl", pin: "aodjdl", mustChangePin: true },
  { id: 12, name: "Slx", pin: "aodslx", mustChangePin: true },
  { id: 13, name: "Fubuka", pin: "aodfubuka", mustChangePin: true },
  { id: 14, name: "Atlas", pin: "aodatlas", mustChangePin: true },
  { id: 15, name: "Dalcin", pin: "aoddalcin", mustChangePin: true },
  { id: 16, name: "Braga", pin: "aodbraga", mustChangePin: true },
  { id: 17, name: "Bomber", pin: "aodbomber", mustChangePin: true },
  { id: 18, name: "Goop", pin: "aodgoop", mustChangePin: true },
  { id: 19, name: "Mavi", pin: "aodmavi", mustChangePin: true },
  { id: 20, name: "Over", pin: "aodover", mustChangePin: true },
  { id: 21, name: "Pitta", pin: "aodpitta", mustChangePin: true },
  { id: 22, name: "Soso", pin: "aodsoso", mustChangePin: true },
  { id: 23, name: "Speed", pin: "aodspeed", mustChangePin: true },
  { id: 24, name: "Clecle", pin: "aodclecle", mustChangePin: true },
  { id: 25, name: "Will", pin: "aodwill", mustChangePin: true },
  { id: 26, name: "Ryss", pin: "aodryss", mustChangePin: true },
];

// quem pode registrar PEDIDOS (ajuste)
export const ORDER_ALLOWED_IDS = new Set<number>([1, 2, 20]);

// admins do site (podem deletar registros no banco)
export const ADMIN_IDS = new Set<number>([1, 2, 20]); // <- coloque aqui os IDs admin

export const ORGS = [
  "Marabunta",
  "Los Vagos",
  "Families",
  "Ballas",
  "DVD",
  "Nihil",
  "Agnikai's",
  "South Thunder",
  "7 Sombras",
  "Cesarini",
  "Black Rose",
  "Bandolero MC",
  "The Lost MC",
] as const;

export type OrgOption = (typeof ORGS)[number] | "OUTRO";

export const ITEMS = [
  ".4 ACP",
  "Notas Marcadas",
  "SNS",
  "Colete",
  "Linha",
  "Resina",
  "Tesoura",
  "Agulha",
  "Placa Falsa",
  "Cobre",
  "Aluminio",
  "Borracha",
  "Sucata",
  "Kit Eletrônico",
  "Plástico",
  "Peça de Roupa",
  "Caixa de Pólvora",
  "Laptop",
  "Telefone Quebrado",
  "Celular",
  "Rádio",
] as const;

export type ItemOption = (typeof ITEMS)[number] | "OUTRO";

/** ✅ NOVO: locais para guardar (Baú) */
export const VAULT_STORE_PLACES = [
  "BAU_MEMBRO",
  "BAU_GERENCIA",
  "PORTA_MALAS",
] as const;

export type VaultStorePlace = (typeof VAULT_STORE_PLACES)[number];