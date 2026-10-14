import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export default function Signup() {
  const { signup, user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Sign up — StanMart";
  }, []);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const strength = useMemo(() => {
    const v = form.password;
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4);
  }, [form.password]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone)) return setError("Please enter a valid phone number.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!agree) return setError("Please accept the Terms and Privacy Policy.");

    const err = signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (err) return setError(err);
    notify("Account created. Welcome to StanMart!", "success");
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
          <h3>Join thousands shopping smarter every day.</h3>
          <p>Create a free account to shop, track deliveries and save your details at checkout.</p>
          <ul className="auth-points">
            <li>
              <i className="fa-solid fa-user-plus" />
              <div>
                One account, everything in one place
                <span>Orders, reviews and checkout details.</span>
              </div>
            </li>
            <li>
              <i className="fa-solid fa-bolt" />
              <div>
                Faster checkout
                <span>Your info is prefilled, so you shop in seconds.</span>
              </div>
            </li>
            <li>
              <i className="fa-solid fa-tag" />
              <div>
                Exclusive deals
                <span>Get notified about offers and new arrivals.</span>
              </div>
            </li>
          </ul>
        </aside>

        <form className="auth-card" onSubmit={submit}>
          <div className="auth-head">
            <h1>Create account</h1>
            <p>It only takes a minute to get started.</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          <label className="field">
            <span>Full name</span>
            <div className="input-wrap">
              <i className="fa-solid fa-user lead" />
              <input
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>
          </label>

          <div className="two-col">
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

            <label className="field">
              <span>Phone number</span>
              <div className="input-wrap">
                <i className="fa-solid fa-phone lead" />
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                  required
                />
              </div>
            </label>
          </div>

          <div className="two-col">
            <label className="field has-toggle">
              <span>Password</span>
              <div className="input-wrap">
                <i className="fa-solid fa-lock lead" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
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

            <label className="field has-toggle">
              <span>Confirm password</span>
              <div className="input-wrap">
                <i className="fa-solid fa-lock lead" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>
          </div>

          {form.password.length > 0 && (
            <div className="pw-meter" data-level={strength}>
              <div className="pw-bars">
                <span />
                <span />
                <span />
                <span />
              </div>
              <small>Password strength: {STRENGTH_LABELS[strength]}</small>
            </div>
          )}

          <label className="check-label">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
            </span>
          </label>

          <button type="submit" className="btn btn-primary btn-lg">
            Create account <i className="fa-solid fa-arrow-right" />
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
