import { useEffect } from "react";
import { Link } from "react-router-dom";

const stats = [
  { value: "12k+", label: "Happy customers" },
  { value: "500+", label: "Products" },
  { value: "36", label: "States delivered" },
  { value: "24/7", label: "Support" },
];

const values = [
  { icon: "fa-badge-check", title: "Quality you can trust", text: "Every product is carefully selected for quality, value and satisfaction." },
  { icon: "fa-tags", title: "Affordable prices", text: "Great products at fair, competitive prices — without compromising quality." },
  { icon: "fa-truck-fast", title: "Safe, fast delivery", text: "Your orders are packaged with care and delivered safely to your doorstep." },
  { icon: "fa-shield-halved", title: "Secure shopping", text: "Your data and transactions are protected from checkout to delivery." },
];

export default function About() {
  useEffect(() => {
    document.title = "About | StanMart";
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <p className="kicker">ABOUT STANMART</p>
        <h1>Your trusted shopping destination</h1>
        <p className="section-sub">
          StanMart is a space that lets you shop for quality products online and have them
          delivered safely to you — easing stress and saving you time.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-content">
          <h2>
            Shopping made <span>simple, safe and convenient</span>
          </h2>
          <p>
            Stanmart Online Store provides customers with quality products at affordable prices.
            Our goal is to make online shopping simple, secure and convenient for everyone — from
            everyday essentials to lifestyle products, we carefully select items that offer great
            value, quality and satisfaction.
          </p>
          <p>
            With a wide selection of electronics, fashion, beauty products and accessories, we
            bring the marketplace to your fingertips. Order in minutes, pay securely, and track
            your delivery right up to your doorstep.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Start shopping <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
        <div className="about-media">
          <img src="/images/about.jpg" alt="StanMart shopper" />
        </div>
      </div>

      <div className="stats-band">
        {stats.map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="section-head">
        <p className="kicker">OUR VALUES</p>
        <h2>What we stand for</h2>
      </div>
      <div className="benefit-grid">
        {values.map((v) => (
          <div key={v.title} className="benefit-card">
            <div className="benefit-icon">
              <i className={`fa-solid ${v.icon}`} />
            </div>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
