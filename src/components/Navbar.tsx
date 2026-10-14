import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { count, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userOpen, setUserOpen] = useState(false);

  const closeMenus = () => {
    setMenuOpen(false);
    setUserOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMenuOpen(false);
    notify("You have been logged out.", "info");
    navigate("/");
  };

  const navItems = [
    { to: "/", label: "Home", icon: "fa-house" },
    { to: "/shop", label: "Shop", icon: "fa-bag-shopping" },
    { to: "/about", label: "About", icon: "fa-circle-info" },
  ];

  const links = (
    <>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={closeMenus}>
          {item.label}
        </NavLink>
      ))}
      {user && (
        <NavLink to="/orders" onClick={closeMenus}>
          My Orders
        </NavLink>
      )}
    </>
  );

  const mobileLinks = (
    <>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={closeMenus}>
          <i className={`fa-solid ${item.icon}`} />
          {item.label}
          <i className="fa-solid fa-chevron-right chev" />
        </NavLink>
      ))}
      {user && (
        <NavLink to="/orders" onClick={closeMenus}>
          <i className="fa-solid fa-box" />
          My Orders
          <i className="fa-solid fa-chevron-right chev" />
        </NavLink>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <img src="/images/bg.png" alt="StanMart logo" width="52" height="52" />
          <h1>
            STAN <span>MART</span>
          </h1>
        </Link>

        <nav className="nav-links">{links}</nav>

        <form className="nav-search" onSubmit={submitSearch} role="search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"} />
          </button>

          <button type="button" className="icon-btn cart-btn" onClick={openCart} aria-label="Open cart">
            <i className="fa-solid fa-cart-shopping" />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>

          {user ? (
            <div className="user-menu">
              <button
                type="button"
                className="user-btn"
                onClick={() => setUserOpen((o) => !o)}
              >
                <i className="fa-solid fa-circle-user" />
                <span>{user.name.split(" ")[0]}</span>
                <i className="fa-solid fa-chevron-down caret" />
              </button>
              {userOpen && (
                <div className="user-dropdown">
                  <p className="user-email">{user.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/orders");
                      setUserOpen(false);
                    }}
                  >
                    <i className="fa-solid fa-box" /> My Orders
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/admin");
                        setUserOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-plus" /> Sell a product
                    </button>
                  )}
                  <button type="button" onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-head">
          <Link to="/" className="mobile-brand" onClick={closeMenus}>
            <img src="/images/bg.png" alt="StanMart logo" width="40" height="40" />
            <span>
              STAN <b>MART</b>
            </span>
          </Link>
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form className="nav-search mobile-search" onSubmit={submitSearch} role="search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <nav className="mobile-links">{mobileLinks}</nav>

        <div className="mobile-account">
          {user ? (
            <>
              <div className="mobile-user">
                <span className="mobile-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    navigate("/admin");
                    setMenuOpen(false);
                  }}
                >
                  <i className="fa-solid fa-plus" /> Sell a product
                </button>
              )}
            </>
          ) : (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-ghost" onClick={closeMenus}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary" onClick={closeMenus}>
                Sign up
              </Link>
            </div>
          )}

          <button type="button" className="mobile-theme" onClick={toggleTheme}>
            <i className={theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"} />
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
