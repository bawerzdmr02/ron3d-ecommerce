export interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  updated_at: string;
}

export interface CategoryCard {
  name: string;
  slug: string;
  image_url: string;
  product_count?: number;
}
