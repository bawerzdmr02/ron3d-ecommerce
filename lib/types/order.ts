export interface Order {
  id: string;
  user_email: string;
  product_id: string | null;
  product_title: string;
  amount: number;
  status: string;
  created_at: string;
}
