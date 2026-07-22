export interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

export interface CategoryCard {
  name: string;
  slug: string;
  image_url: string;
  product_count?: number;
  is_visible?: boolean;
}
