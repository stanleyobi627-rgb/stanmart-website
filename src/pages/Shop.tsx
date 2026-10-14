import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/products";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const SORTS: { label: string; value: SortKey }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState(700000);

  useEffect(() => {
    document.title = "Shop — StanMart";
  }, []);

  useEffect(() => {
    const next: Record<string, string> = {};
    if (search) next.q = search;
    if (category !== "All") next.category = category;
    setSearchParams(next, { replace: true });
  }, [search, category, setSearchParams]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list: Product[] = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.price <= maxPrice &&
        (!query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, search, category, sort, maxPrice]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("featured");
    setMaxPrice(700000);
  };

  return (
    <>
      <section className="shop-hero">
        <p className="kicker">OUR SHOP</p>
        <h1>Shop Our Products</h1>
        <p className="section-sub">Browse quality products at affordable prices.</p>
      </section>

      <section className="section shop-section">
        <div className="shop-toolbar">
          <div className="shop-search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          <div className="shop-sort">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort products">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shop-filters">
          <div className="filter-chips">
            {["All", ...categories.map((c) => c.name)].map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="price-filter">
            <label>
              Max price: <strong>₦{maxPrice.toLocaleString("en-NG", { maximumFractionDigits: 0 })}</strong>
            </label>
            <input
              type="range"
              min={20000}
              max={700000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Maximum price"
            />
          </div>
        </div>

        <p className="search-note">
          <strong>{filtered.length}</strong> product{filtered.length !== 1 && "s"} found
          {category !== "All" && ` in ${category}`}
          {search && ` for "${search}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-magnifying-glass" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
