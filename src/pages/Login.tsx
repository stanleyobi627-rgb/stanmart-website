import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login, user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Login — StanMart";
  }, []);

  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/", { replace: true });
    }
  }, [user, navigate, location.state]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(form.email, form.password);
    if (err) {
      setError(err);
      return;
    }
    notify("Welcome back!", "success");
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-visual">
          <Link to="/" className="auth-brand">
            <img src="/images/bg.png" alt="StanMart" />
            <h2>
              STAN <span>MART</span>
            </h2>
          </Link>
          <h3>Quality products. Better prices. Welcome back.</h3>
          <p>Log in to continue shopping, track your orders and manage your account.</p>
          <ul className="auth-points">
            <li>
              <i className="fa-solid fa-truck-fast" />
              <div>
                Fast, safe delivery
                <span>We deliver quickly and safely to your doorstep.</span>
              </div>
            </li>
            <li>
              <i className="fa-solid fa-shield-halved" />
              <div>
                Your data stays with you
                <span>Account details are stored on this device only.</span>
              </div>
            </li>
            <li>
              <i className="fa-solid fa-star" />
              <div>
                Quality guaranteed
                <span>Carefully selected products at fair prices.</span>
              </div>
            </li>
          </ul>
        </aside>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-head">
            <h1>Log in</h1>
            <p>Enter your details to continue.</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <label className="field">
            <span>Email address</span>
            <div className="input-wrap">
              <i className="fa-solid fa-envelope lead" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="field has-toggle">
            <span>Password</span>
            <div className="input-wrap">
              <i className="fa-solid fa-lock lead" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <i className={showPw ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
              </button>
            </div>
          </label>

          <div className="auth-row">
            <label className="check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                notify("Password reset isn't available in this demo.", "info");
              }}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Log in <i className="fa-solid fa-arrow-right" />
          </button>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
