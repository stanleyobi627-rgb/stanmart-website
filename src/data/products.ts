import type { Category, Product } from "../types";
import rawProducts from "./products.json";

export const defaultProducts = rawProducts as Product[];

export const categories: { name: Category; icon: string; blurb: string }[] = [
  { name: "Electronics", icon: "fa-laptop", blurb: "Phones, laptops and gadgets." },
  { name: "Fashion", icon: "fa-shirt", blurb: "Clothes, shoes and accessories." },
  { name: "Beauty", icon: "fa-spa", blurb: "Beauty and personal care." },
  { name: "Accessories", icon: "fa-clock", blurb: "Smart watches and more." },
];

export const naira = (amount: number) =>
  "₦" + amount.toLocaleString("en-NG", { maximumFractionDigits: 0 });
