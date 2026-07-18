export const ORDER_STATUSES = [
  "Bekliyor",
  "Hazırlanıyor",
  "Kargoya Verildi",
  "İptal",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  user_id: string;
  product_id: string | null;
  custom_text: string | null;
  status: OrderStatus | string;
  price: number;
  created_at: string;
  product_title?: string;
}

export function orderStatusBadgeClass(status: string): string {
  switch (status) {
    case "Kargoya Verildi":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Hazırlanıyor":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "Bekliyor":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "İptal":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
}
