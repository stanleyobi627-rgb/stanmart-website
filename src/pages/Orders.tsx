import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders, orderStatus, STATUS_STEPS } from "../context/OrdersContext";
import { useAuth } from "../context/AuthContext";
import { naira } from "../data/products";
import { openOrderWhatsApp } from "../utils/whatsapp";
import type { Order, OrderStatus } from "../types";

const STATUS_ICONS: Record<OrderStatus, string> = {
  Processing: "fa-solid fa-hourglass-half",
  Packed: "fa-solid fa-box",
  Dispatched: "fa-solid fa-truck-fast",
  Delivered: "fa-solid fa-circle-check",
};

function OrderCard({ order }: { order: Order }) {
  const status = orderStatus(order);
  const stepIndex = STATUS_STEPS.indexOf(status);
  const progress = (stepIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <article className="order-card card">
      <header className="order-head">
        <div>
          <h3>
            Order <strong>#{order.id}</strong>
          </h3>
          <p>
            <i className="fa-regular fa-clock" />
            {new Date(order.createdAt).toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className={`status-chip status-${status.toLowerCase()}`}>
          <i className={STATUS_ICONS[status]} />
          {status}
        </span>
      </header>

      <ul className="tracker">
        <span className="tracker-line">
          <span className="tracker-fill" style={{ width: `${progress}%` }} />
        </span>
        {STATUS_STEPS.map((s, i) => (
          <li key={s} className={i <= stepIndex ? "done" : ""}>
            <span className="dot">
              <i className={STATUS_ICONS[s]} />
            </span>
            <span className="label">{s}</span>
          </li>
        ))}
      </ul>

      <div className="order-body">
        <ul className="order-items">
          {order.items.map((item) => (
            <li key={item.product.id}>
              <img src={item.product.image} alt={item.product.name} />
              <div className="oi-info">
                <strong>{item.product.name}</strong>
                <span>Qty × {item.qty}</span>
              </div>
              <span className="oi-price">{naira(item.product.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="order-meta">
          <p>
            <i className="fa-solid fa-user" /> {order.fullName}
          </p>
          <p>
            <i className="fa-solid fa-phone" /> {order.phone}
          </p>
          <p>
            <i className="fa-solid fa-location-dot" /> {order.address}, {order.city}
          </p>
          <p>
            <i className="fa-solid fa-truck" /> {order.method} delivery
          </p>
          <p>
            <i className="fa-solid fa-credit-card" /> {order.payment}
          </p>
          {order.note && (
            <p>
              <i className="fa-solid fa-note-sticky" /> {order.note}
            </p>
          )}
          <div className="order-total">
            <span>Total</span>
            <strong>{naira(order.total)}</strong>
          </div>
          <button
            type="button"
            className="btn btn-whatsapp order-wa"
            onClick={() => openOrderWhatsApp(order)}
          >
            <i className="fa-brands fa-whatsapp" /> Send on WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Orders() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    document.title = "My Orders — StanMart";
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const mine = user
    ? orders.filter((o) => o.email.toLowerCase() === user.email.toLowerCase())
    : [];

  if (mine.length === 0) {
    return (
      <section className="section">
        <div className="empty-state">
          <i className="fa-solid fa-box" />
          <h3>No orders yet</h3>
          <p>Your orders will appear here once you check out.</p>
          <Link to="/shop" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      </section>
    );
  }

  const delivered = mine.filter((o) => orderStatus(o) === "Delivered").length;
  const inProgress = mine.length - delivered;

  return (
    <>
      <section className="shop-hero">
        <p className="kicker">MY ORDERS</p>
        <h1>Order History</h1>
        <p className="section-sub">
          Track your deliveries — status updates automatically as time passes.
        </p>
      </section>

      <section className="section" data-tick={tick}>
        <div className="stats-band orders-stats">
          <div>
            <strong>{mine.length}</strong>
            <span>Total orders</span>
          </div>
          <div>
            <strong>{inProgress}</strong>
            <span>In progress</span>
          </div>
          <div>
            <strong>{delivered}</strong>
            <span>Delivered</span>
          </div>
        </div>

        <div className="orders-list">
          {mine.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </section>
    </>
  );
}
