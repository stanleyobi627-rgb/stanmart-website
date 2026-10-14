import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders, DELIVERY_FEES } from "../context/OrdersContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { naira } from "../data/products";
import { openOrderWhatsApp } from "../utils/whatsapp";
import type { DeliveryMethod, PaymentMethod } from "../types";

const METHOD_META: Record<DeliveryMethod, { icon: string; desc: string }> = {
  Standard: { icon: "fa-truck", desc: "3–5 business days" },
  Express: { icon: "fa-bolt", desc: "Same day delivery" },
};

const PAYMENT_META: Record<PaymentMethod, string> = {
  Card: "fa-credit-card",
  Transfer: "fa-building-columns",
  "Cash on Delivery": "fa-money-bill-wave",
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { placeOrder } = useOrders();
  const { notify } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    method: "Standard" as DeliveryMethod,
    payment: "Card" as PaymentMethod,
    notes: "",
  });

  useEffect(() => {
    document.title = "Checkout — StanMart";
  }, []);

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="empty-state">
          <i className="fa-solid fa-bag-shopping" />
          <h3>Your cart is empty</h3>
          <p>Add some products before checking out.</p>
          <Link to="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  const deliveryFee = DELIVERY_FEES[form.method];
  const total = subtotal + deliveryFee;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      notify("Please fill in all required fields.", "error");
      return;
    }
    const order = placeOrder(
      {
        fullName: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        method: form.method,
        payment: form.payment,
        note: form.notes || undefined,
      },
      items,
      subtotal,
      form.email,
    );
    openOrderWhatsApp(order);
    clear();
    notify("Order placed! Finish it on WhatsApp.", "success");
    navigate("/orders");
  };

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <section className="shop-hero">
        <p className="kicker">CHECKOUT</p>
        <h1>Complete Your Order</h1>
        <p className="section-sub">Just a few details and your items are on the way.</p>
      </section>

      <section className="section checkout-section">
        <form className="checkout-form card" onSubmit={submit}>
          <div className="ck-block">
            <div className="ck-head">
              <span className="ck-icon">
                <i className="fa-solid fa-location-dot" />
              </span>
              <div>
                <h2>Contact &amp; delivery</h2>
                <p>Where should we deliver your order?</p>
              </div>
            </div>

            <div className="ck-grid-2">
              <label className="ck-field">
                <span>Full name</span>
                <div className="ck-input">
                  <i className="fa-solid fa-user" />
                  <input placeholder="Jane Doe" value={form.name} onChange={set("name")} />
                </div>
              </label>
              <label className="ck-field">
                <span>Email address</span>
                <div className="ck-input">
                  <i className="fa-solid fa-envelope" />
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                </div>
              </label>
              <label className="ck-field">
                <span>Phone number</span>
                <div className="ck-input">
                  <i className="fa-solid fa-phone" />
                  <input placeholder="+234 801 234 5678" value={form.phone} onChange={set("phone")} />
                </div>
              </label>
              <label className="ck-field">
                <span>City</span>
                <div className="ck-input">
                  <i className="fa-solid fa-city" />
                  <input placeholder="Lagos" value={form.city} onChange={set("city")} />
                </div>
              </label>
            </div>

            <label className="ck-field">
              <span>Street address</span>
              <div className="ck-input">
                <i className="fa-solid fa-map-pin" />
                <textarea rows={2} placeholder="12 Marina Road, Victoria Island" value={form.address} onChange={set("address")} />
              </div>
            </label>

            <label className="ck-field">
              <span>Delivery notes (optional)</span>
              <div className="ck-input">
                <i className="fa-solid fa-note-sticky" />
                <textarea rows={2} placeholder="Landmark, gate color, best time to deliver..." value={form.notes} onChange={set("notes")} />
              </div>
            </label>
          </div>

          <div className="ck-block">
            <div className="ck-head">
              <span className="ck-icon">
                <i className="fa-solid fa-truck-fast" />
              </span>
              <div>
                <h2>Delivery method</h2>
                <p>Choose how fast you need it.</p>
              </div>
            </div>

            <div className="option-row">
              {(Object.keys(DELIVERY_FEES) as DeliveryMethod[]).map((m) => (
                <label key={m} className={`option-card ${form.method === m ? "option-active" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    checked={form.method === m}
                    onChange={() => setForm({ ...form, method: m })}
                  />
                  <i className={`fa-solid ${METHOD_META[m].icon}`} />
                  <strong>{m}</strong>
                  <span className="option-desc">{METHOD_META[m].desc}</span>
                  <em>{naira(DELIVERY_FEES[m])}</em>
                  <span className="option-check">
                    <i className="fa-solid fa-check" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="ck-block">
            <div className="ck-head">
              <span className="ck-icon">
                <i className="fa-solid fa-credit-card" />
              </span>
              <div>
                <h2>Payment method</h2>
                <p>All transactions are secure and encrypted.</p>
              </div>
            </div>

            <div className="option-row option-row-3">
              {(["Card", "Transfer", "Cash on Delivery"] as PaymentMethod[]).map((p) => (
                <label key={p} className={`option-card pay ${form.payment === p ? "option-active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === p}
                    onChange={() => setForm({ ...form, payment: p })}
                  />
                  <i className={`fa-solid ${PAYMENT_META[p]}`} />
                  <strong>{p}</strong>
                  <span className="option-check">
                    <i className="fa-solid fa-check" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-whatsapp btn-lg ck-submit">
            <i className="fa-brands fa-whatsapp" /> Place order on WhatsApp · {naira(total)}
          </button>
          <p className="safe-note">
            <i className="fa-solid fa-shield-halved" /> Your order is sent to our WhatsApp to confirm and arrange delivery.
          </p>
        </form>

        <aside className="order-summary card">
          <h2>Order summary</h2>

          <div className="summary-items">
            {items.map((item) => (
              <div key={item.product.id} className="summary-item">
                <img src={item.product.image} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>Qty × {item.qty}</span>
                </div>
                <span>{naira(item.product.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{naira(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery ({form.method})</span>
              <span>{naira(deliveryFee)}</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>{naira(total)}</span>
          </div>

          <ul className="summary-perks">
            <li>
              <i className="fa-solid fa-truck-fast" /> Fast, safe delivery to your doorstep
            </li>
            <li>
              <i className="fa-solid fa-rotate-left" /> Easy returns within 7 days
            </li>
            <li>
              <i className="fa-solid fa-headset" /> 24/7 customer support
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
}
