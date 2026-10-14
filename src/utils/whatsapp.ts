import type { Order } from "../types";
import { naira } from "../data/products";
import { STORE_WHATSAPP } from "../config";

export function orderMessage(order: Order): string {
  const lines = [
    "*New Order - StanMart*",
    `Order ID: #${order.id}`,
    "",
    "*Customer details*",
    `Name: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Address: ${order.address}, ${order.city}`,
    "",
    "*Items*",
    ...order.items.map((i) => `- ${i.product.name} x${i.qty} = ${naira(i.product.price * i.qty)}`),
    "",
    `Subtotal: ${naira(order.subtotal)}`,
    `Delivery (${order.method}): ${naira(order.deliveryFee)}`,
    `*Total: ${naira(order.total)}*`,
    "",
    `Payment: ${order.payment}`,
  ];
  if (order.note) lines.push(`Note: ${order.note}`);
  return lines.join("\n");
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function openOrderWhatsApp(order: Order): void {
  window.open(whatsappLink(orderMessage(order)), "_blank", "noopener,noreferrer");
}
