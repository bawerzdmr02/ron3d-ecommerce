export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  model_url: string;
  shopier_url: string;
  is_customizable: boolean;
  created_at: string;
  category?: string;
}
