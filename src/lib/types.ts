export type CargoType = "documents" | "fragile" | "regular";
export type OrderStatus = "Создано" | "В обработке" | "Доставлено";

export type Draft = {
  senderName: string;
  senderPhone: string;
  cityFrom: string;

  receiverName: string;
  cityTo: string;
  cargoType: CargoType;
  weightKg: number | "";
};

export type Order = {
  id: string;
  createdAt: number;
  status: OrderStatus;
} & Omit<Draft, "weightKg"> & { weightKg: number };