import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>
            STAN <span>MART</span>
          </h2>
          <p>
            Quality products. Better prices. Your trusted online store for everyday shopping —
            delivered safely to your doorstep.
          </p>
          <div className="socials">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
            <a href="#" aria-label="X"><i className="fa-brands fa-x-twitter" /></a>
            <a href="#" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp" /></a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/orders">Track Order</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Customer Service</h3>
          <ul>
            <li><a href="#">Shipping &amp; Delivery</a></li>
            <li><a href="#">Returns &amp; Refunds</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contact Support</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <p><i className="fa-solid fa-envelope" /> stanleyobi627@gmail.com</p>
          <p><i className="fa-solid fa-phone" /> 07041482947</p>
          <p><i className="fa-solid fa-location-dot" /> Nigeria</p>
        </div>
      </div>

      <div className="copyright">
        <p>
          <i className="fa-regular fa-copyright" /> 2026 StanMart Online Store. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}
