import { useNavigate } from "react-router-dom";
import { naira } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, setQty, remove, clear } = useCart();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const goCheckout = () => {
    closeCart();
    if (!user) {
      notify("Please log in to continue to checkout.", "info");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "open" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h2>
            <i className="fa-solid fa-cart-shopping" /> Your Cart
          </h2>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label="Close cart">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <i className="fa-solid fa-basket-shopping" />
            <p>Your cart is empty.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                closeCart();
                navigate("/shop");
              }}
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="cart-line">
                  <img src={product.image} alt={product.name} />
                  <div className="cart-line-info">
                    <h4>{product.name}</h4>
                    <p className="cart-line-price">{naira(product.price)}</p>
                    <div className="qty-row">
                      <button type="button" onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease">
                        <i className="fa-solid fa-minus" />
                      </button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty(product.id, qty + 1)} aria-label="Increase">
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <div className="drawer-total">
                <span>Subtotal</span>
                <strong>{naira(subtotal)}</strong>
              </div>
              <p className="drawer-note">
                <i className="fa-solid fa-truck-fast" /> Delivery fee calculated at checkout
              </p>
              <button type="button" className="btn btn-primary btn-block" onClick={goCheckout}>
                Proceed to Checkout
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={clear}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
