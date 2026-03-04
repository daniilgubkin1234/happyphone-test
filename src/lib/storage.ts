import type { Order, Draft } from "./types";



const KEY = "parcel_orders_v1";
const DRAFT_KEY = "parcel_draft_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadOrders(): Order[] {
  if (!isBrowser()) return [];
  return safeParse<Order[]>(localStorage.getItem(KEY), []);
}

export function saveOrders(orders: Order[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  const orders = loadOrders();
  saveOrders([order, ...orders]);
}

export function deleteOrder(id: string) {
  const orders = loadOrders();
  saveOrders(orders.filter((o) => o.id !== id));
}

export function getOrderById(id: string): Order | undefined {
  return loadOrders().find((o) => o.id === id);
}

export function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
export type DraftPersisted = {
  step: 1 | 2 | 3;
  draft: Draft;
  agreeDelivery?: boolean;
  agreePersonal?: boolean;
};

export function loadDraft(): DraftPersisted | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as DraftPersisted;
    if (!data || !data.draft || !data.step) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveDraft(data: DraftPersisted) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}