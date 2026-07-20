import { getPopularProducts } from "@/lib/data/categories";
import ProductCatalog from "./ProductCatalog";

export default async function ProductGrid() {
  const products = await getPopularProducts(9);
  return <ProductCatalog products={products} />;
}
