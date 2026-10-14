import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "stanmart_cart";

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product: Product, qty = 1) => {
    setItems((list) => {
      const existing = list.find((i) => i.product.id === product.id);
      if (existing) {
        return list.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i,
        );
      }
      return [...list, { product, qty: Math.min(qty, product.stock) }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((list) => list.filter((i) => i.product.id !== productId));
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((list) =>
      list
        .map((i) =>
          i.product.id === productId
            ? { ...i, qty: Math.max(0, Math.min(qty, i.product.stock)) }
            : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.product.price, 0);
    return {
      items,
      isOpen,
      count,
      subtotal,
      add,
      remove,
      setQty,
      clear,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [items, isOpen, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
