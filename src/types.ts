export type Category = "Electronics" | "Fashion" | "Beauty" | "Accessories";

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  category: Category;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  description: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface StoredUser extends User {
  password: string;
}

export type OrderStatus = "Processing" | "Packed" | "Dispatched" | "Delivered";
export type DeliveryMethod = "Standard" | "Express";
export type PaymentMethod = "Card" | "Transfer" | "Cash on Delivery";

export interface OrderDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  method: DeliveryMethod;
  payment: PaymentMethod;
  note?: string;
}

export interface Order extends OrderDetails {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  email: string;
  createdAt: number;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
}
