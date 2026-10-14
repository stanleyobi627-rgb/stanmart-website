import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultProducts } from "../data/products";
import type { Product } from "../types";

export type ProductInput = Omit<Product, "id">;
export type ExportScope = "custom" | "all";

interface ProductsContextValue {
  products: Product[];
  custom: Product[];
  addProduct: (input: ProductInput) => Product;
  removeProduct: (id: number) => void;
  exportProducts: (scope: ExportScope) => void;
  importProducts: (json: string) => number;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);
const CUSTOM_KEY = "stanmart_products";

function readCustom(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function download(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isProduct(value: unknown): value is ProductInput {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.price === "number" &&
    typeof item.category === "string" &&
    typeof item.image === "string"
  );
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<Product[]>(readCustom);

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  }, [custom]);

  const nextId = () => {
    const ids = [...defaultProducts.map((p) => p.id), ...readCustom().map((p) => p.id)];
    return (ids.length ? Math.max(...ids) : 0) + 1;
  };

  const addProduct = useCallback((input: ProductInput): Product => {
    const product: Product = { ...input, id: nextId() };
    setCustom((list) => [product, ...list]);
    return product;
  }, []);

  const removeProduct = useCallback((id: number) => {
    setCustom((list) => list.filter((p) => p.id !== id));
  }, []);

  const exportProducts = useCallback(
    (scope: ExportScope) => {
      const list = scope === "all" ? [...custom, ...defaultProducts] : custom;
      const filename = scope === "all" ? "products.json" : "my-products.json";
      download(filename, JSON.stringify(list, null, 2));
    },
    [custom],
  );

  const importProducts = useCallback((json: string): number => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("That file is not valid JSON.");
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const valid = items.filter(isProduct);
    if (valid.length === 0) {
      throw new Error("No valid products found in that file.");
    }
    let id = nextId();
    const imported = valid.map((item) => {
      const product: Product = {
        ...item,
        id: id++,
        rating: item.rating ?? 5,
        reviews: item.reviews ?? 0,
        stock: item.stock ?? 0,
        description: item.description || "Imported product.",
      };
      return product;
    });
    setCustom((list) => [...imported, ...list]);
    return imported.length;
  }, []);

  const products = useMemo(() => [...custom, ...defaultProducts], [custom]);
  const value = useMemo(
    () => ({ products, custom, addProduct, removeProduct, exportProducts, importProducts }),
    [products, custom, addProduct, removeProduct, exportProducts, importProducts],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
