import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { useToast } from "../context/ToastContext";
import type { Testimonial } from "../types";
import Countdown from "../components/Countdown";
import ProductCard from "../components/ProductCard";
import Stars from "../components/Stars";

const DEFAULT_REVIEWS: Testimonial[] = [
  {
    id: "r1",
    name: "Genevive Ngozi",
    rating: 5,
    text: "I got my laptop from StanMart and everything was perfectly okay. The product was exactly as shown and delivery was fast.",
  },
  {
    id: "r2",
    name: "Obi Chigozie",
    rating: 4,
    text: "StanMart or nothing! StanMart made shopping very easy for me. My Samsung phone arrived in good condition and I really love it.",
  },
  {
    id: "r3",
    name: "Temitope James",
    rating: 5,
    text: "Great customer service and good quality. I will definitely shop with StanMart again.",
  },
  {
    id: "r4",
    name: "John David",
    rating: 5,
    text: "Ordering was simple and my package arrived safely and on time. Highly recommended!",
  },
];

const REVIEWS_KEY = "stanmart_reviews";

const benefits = [
  { icon: "fa-truck-fast", title: "Fast Delivery", text: "We deliver your orders quickly and safely to your doorstep." },
  { icon: "fa-lock", title: "Secure Payment", text: "Your transactions are protected with secure payment methods." },
  { icon: "fa-star", title: "Quality Products", text: "We provide quality products at competitive and affordable prices." },
  { icon: "fa-headset", title: "Customer Support", text: "Our friendly support team is always available to assist you." },
];

function readReviews(): Testimonial[] {
  try {
    const saved = localStorage.getItem(REVIEWS_KEY);
    return saved ? [...JSON.parse(saved), ...DEFAULT_REVIEWS] : DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

export default function Home() {
  const { notify } = useToast();
  const { user } = useAuth();
  const { products } = useProducts();
  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 6), [products]);
  const [reviews, setReviews] = useState<Testimonial[]>(readReviews);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "StanMart Online Store";
  }, []);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify("Please log in to write a review.", "info");
      return;
    }
    if (form.text.trim().length < 5) {
      notify("Please write a short review.", "error");
      return;
    }
    const review: Testimonial = {
      id: crypto.randomUUID(),
      name: user.name,
      rating: form.rating,
      text: form.text.trim(),
    };
    const saved = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? "[]") as Testimonial[];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify([review, ...saved]));
    setReviews([review, ...reviews]);
    setForm({ name: "", rating: 5, text: "" });
    notify("Thanks for your review!", "success");
  };

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("Please enter a valid email address.", "error");
      return;
    }
    setEmail("");
    notify("You are subscribed to StanMart updates!", "success");
  };

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-kicker">WELCOME TO STANMART</p>
          <h1>
            QUALITY PRODUCT.
            <br />
            <span>BETTER PRICES.</span>
          </h1>
          <p className="hero-sub">
            Discover electronics, fashion, beauty products and everyday essentials at affordable
            prices. Find what you need, enjoy better prices and shop with confidence — delivered
            safely to you.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop now <i className="fa-solid fa-arrow-right" />
            </Link>
            <a href="#categories" className="btn btn-outline btn-lg">
              Explore categories
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>12k+</strong>
              <span>Happy customers</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Quality products</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Customer support</span>
            </div>
          </div>
        </div>
        <div className="hero-art">
          <img src="/images/bg.png" alt="StanMart shopping" />
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((i) => (
            <span key={i}>
              Welcome to StanMart online store — your trusted destination for quality products at
              affordable prices. Safe delivery, customer satisfaction and great deals, every time.
              &nbsp;&nbsp;★&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="categories">
        <div className="section-head">
          <p className="kicker">EXPLORE</p>
          <h2>Shop By Category</h2>
          <p className="section-sub">Find everything you need in one place.</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`} className="category-card">
              <div className="category-icon">
                <i className={`fa-solid ${cat.icon}`} />
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="shop">
        <div className="section-head">
          <p className="kicker">FEATURED</p>
          <h2>Featured Products</h2>
          <p className="section-sub">Shop our most popular products.</p>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="center">
          <Link to="/shop" className="btn btn-outline">
            View all products <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </section>

      <section className="promotion">
        <div className="promo-content">
          <p className="promo-label">LIMITED OFFER</p>
          <h2>
            Get Up To <span>40% OFF</span>
          </h2>
          <p>Don't miss our special deals on selected products.</p>
          <Countdown />
          <Link to="/shop" className="btn btn-light btn-lg">
            Shop Deals
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">WHY STANMART</p>
          <h2>Why Shop With Us</h2>
          <p className="section-sub">We make online shopping simple, safe, affordable and convenient.</p>
        </div>
        <div className="benefit-grid">
          {benefits.map((b) => (
            <div key={b.title} className="benefit-card">
              <div className="benefit-icon">
                <i className={`fa-solid ${b.icon}`} />
              </div>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="about">
        <div className="about-grid">
          <div className="about-content">
            <p className="kicker">ABOUT STANMART</p>
            <h2>
              Welcome to <span>Stanmart Online Store</span> — your trusted shopping destination.
            </h2>
            <p>
              Stanmart Online Store provides customers with quality products at affordable prices.
              Our goal is to make online shopping simple, secure and convenient for everyone — from
              everyday essentials to lifestyle products, selected for great value and satisfaction.
            </p>
            <div className="about-points">
              <div>
                <strong><i className="fa-solid fa-circle-check" /> Quality</strong>
                <p>Products you can trust.</p>
              </div>
              <div>
                <strong><i className="fa-solid fa-circle-check" /> Affordable</strong>
                <p>Great products at fair prices.</p>
              </div>
              <div>
                <strong><i className="fa-solid fa-circle-check" /> Reliable</strong>
                <p>Fast and dependable delivery.</p>
              </div>
            </div>
            <Link to="/about" className="btn btn-primary">
              Discover More
            </Link>
          </div>
          <div className="about-media">
            <img src="/images/about.jpg" alt="Shopping with StanMart" />
          </div>
        </div>
      </section>

      <section className="section" id="testimonials">
        <div className="section-head">
          <p className="kicker">TESTIMONIALS</p>
          <h2>What Our Customers Say</h2>
          <p className="section-sub">See what our happy customers have to say about StanMart.</p>
        </div>
        <div className="testimonial-grid">
          {reviews.slice(0, 8).map((r) => (
            <article key={r.id} className="testimonial-card">
              <div className="testimonial-top">
                <div className="avatar">{r.name.charAt(0)}</div>
                <div>
                  <h3>{r.name}</h3>
                  <Stars rating={r.rating} />
                </div>
              </div>
              <p>{r.text}</p>
            </article>
          ))}
        </div>

        <form className="review-form" onSubmit={submitReview}>
          <h3>Write a review</h3>
          {!user && (
            <p className="review-hint">
              <i className="fa-solid fa-circle-info" /> Please <Link to="/login">log in</Link> to
              submit a review.
            </p>
          )}
          <div className="review-row">
            <input
              type="text"
              placeholder={user ? user.name : "Your name (login required)"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!user}
            />
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              aria-label="Rating"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={3}
            placeholder="Share your experience..."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            disabled={!user}
          />
          <button type="submit" className="btn btn-primary" disabled={!user}>
            Submit review
          </button>
        </form>
      </section>

      <section className="newsletter">
        <div>
          <h2>Stay Updated</h2>
          <p>Subscribe to receive new product updates and special offers.</p>
        </div>
        <form onSubmit={subscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <button type="submit" className="btn btn-dark">
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}
