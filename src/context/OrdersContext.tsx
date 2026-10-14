import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Order, OrderDetails, OrderStatus } from "../types";

interface OrdersContextValue {
  orders: Order[];
  placeOrder: (details: OrderDetails, items: CartItem[], subtotal: number, email: string) => Order;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const ORDERS_KEY = "stanmart_orders";

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export const DELIVERY_FEES = { Standard: 2000, Express: 5000 } as const;

export function orderStatus(order: Order): OrderStatus {
  const minutes = (Date.now() - order.createdAt) / 60000;
  const pace = order.method === "Express" ? 2 : 1;
  if (minutes < 2 * pace) return "Processing";
  if (minutes < 5 * pace) return "Packed";
  if (minutes < 10 * pace) return "Dispatched";
  return "Delivered";
}

export const STATUS_STEPS: OrderStatus[] = ["Processing", "Packed", "Dispatched", "Delivered"];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(readOrders);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const placeOrder = useCallback(
    (details: OrderDetails, items: CartItem[], subtotal: number, email: string) => {
      const deliveryFee = DELIVERY_FEES[details.method];
      const order: Order = {
        ...details,
        id: "SM" + Date.now().toString(36).toUpperCase(),
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        email,
        createdAt: Date.now(),
      };
      setOrders((list) => [order, ...list]);
      return order;
    },
    [],
  );

  const value = useMemo(() => ({ orders, placeOrder }), [orders, placeOrder]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
