import { useState } from "react";
import { naira } from "../data/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import type { Product } from "../types";
import Stars from "./Stars";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { notify } = useToast();
  const [quick, setQuick] = useState(false);
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    add(product, qty);
    notify(`${product.name} added to cart.`, "success");
    setQuick(false);
    setQty(1);
  };

  return (
    <>
      <article className="product-card">
        <div className="product-media" onClick={() => setQuick(true)}>
          <img src={product.image} alt={product.name} loading="lazy" />
          {product.badge && <span className="badge">{product.badge}</span>}
          <span className="quick-eye" title="Quick view">
            <i className="fa-solid fa-eye" />
          </span>
        </div>
        <div className="product-body">
          <span className="product-cat">{product.category}</span>
          <h3>{product.name}</h3>
          <Stars rating={product.rating} reviews={product.reviews} />
          <div className="product-price">
            <strong>{naira(product.price)}</strong>
            {product.oldPrice && <del>{naira(product.oldPrice)}</del>}
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={handleAdd}>
            <i className="fa-solid fa-cart-plus" /> Add to Cart
          </button>
        </div>
      </article>

      {quick && (
        <div className="modal-backdrop" onClick={() => setQuick(false)}>
          <div className="quick-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-btn modal-close"
              onClick={() => setQuick(false)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <div className="quick-grid">
              <img src={product.image} alt={product.name} />
              <div className="quick-info">
                <span className="product-cat">{product.category}</span>
                <h2>{product.name}</h2>
                <Stars rating={product.rating} reviews={product.reviews} size="15px" />
                <div className="product-price">
                  <strong>{naira(product.price)}</strong>
                  {product.oldPrice && <del>{naira(product.oldPrice)}</del>}
                </div>
                <p className="quick-desc">{product.description}</p>
                <p className={`stock ${product.stock <= 10 ? "low" : ""}`}>
                  <i className="fa-solid fa-box" />
                  {product.stock <= 10 ? `Only ${product.stock} left in stock` : "In stock"}
                </p>
                <div className="quick-actions">
                  <div className="qty-row">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">
                      <i className="fa-solid fa-minus" />
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      aria-label="Increase"
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleAdd}>
                    <i className="fa-solid fa-cart-plus" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
