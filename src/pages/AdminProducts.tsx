import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { categories, naira } from "../data/products";
import { useProducts } from "../context/ProductsContext";
import { useToast } from "../context/ToastContext";
import type { Category } from "../types";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const EMPTY = {
  name: "",
  price: "",
  oldPrice: "",
  category: "Electronics" as Category,
  stock: "10",
  badge: "",
  description: "",
  featured: false,
};

const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

export default function AdminProducts() {
  const { products, custom, addProduct, removeProduct, exportProducts, importProducts } = useProducts();
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    document.title = "Sell a Product — StanMart";
  }, []);

  const imageName = useMemo(() => {
    const extension = file ? (file.name.split(".").pop() || "jpg").toLowerCase() : "jpg";
    return `${slugify(form.name) || "product"}.${extension}`;
  }, [form.name, file]);

  const storedPath = `/images/${imageName}`;
  const previewSrc = file ? fileData : imageUrl || "/images/bg.png";
  const featuredCount = products.filter((p) => p.featured).length;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) {
      notify("Please choose an image file.", "error");
      return;
    }
    if (chosen.size > MAX_IMAGE_BYTES) {
      notify("Image is too large. Please use one under 2MB.", "error");
      return;
    }
    setFile(chosen);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = () => setFileData(String(reader.result));
    reader.readAsDataURL(chosen);
  };

  const downloadImage = () => {
    if (!fileData || !file) return;
    const link = document.createElement("a");
    link.href = fileData;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    try {
      const text = await chosen.text();
      const count = importProducts(text);
      notify(`Imported ${count} product${count === 1 ? "" : "s"}.`, "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Import failed.", "error");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const oldPrice = form.oldPrice ? Number(form.oldPrice) : undefined;
    const stock = Number(form.stock) || 0;
    const image = file ? storedPath : imageUrl.trim();

    if (form.name.trim().length < 3) return notify("Please enter a product name.", "error");
    if (!price || price <= 0) return notify("Please enter a valid price.", "error");
    if (!image) return notify("Please add a product image (upload or paste a URL).", "error");

    addProduct({
      name: form.name.trim(),
      price,
      oldPrice,
      category: form.category,
      image,
      rating: 5,
      reviews: 0,
      stock,
      badge: form.badge.trim() || undefined,
      featured: form.featured,
      description: form.description.trim() || "Quality product from StanMart.",
    });
    notify(`"${form.name.trim()}" was added to your shop!`, "success");
    setForm(EMPTY);
    setFile(null);
    setFileData("");
    setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <section className="shop-hero">
        <p className="kicker">SELLER DASHBOARD</p>
        <h1>Sell a Product</h1>
        <p className="section-sub">Add products, then export your catalog to publish it to the store.</p>
      </section>

      <section className="section admin-section">
        <div className="admin-stats">
          <div className="admin-stat card">
            <i className="fa-solid fa-box" />
            <div>
              <strong>{products.length}</strong>
              <span>Total products</span>
            </div>
          </div>
          <div className="admin-stat card">
            <i className="fa-solid fa-circle-plus" />
            <div>
              <strong>{custom.length}</strong>
              <span>Your products</span>
            </div>
          </div>
          <div className="admin-stat card">
            <i className="fa-solid fa-star" />
            <div>
              <strong>{featuredCount}</strong>
              <span>Featured</span>
            </div>
          </div>
        </div>

        <div className="admin-grid">
          <form className="admin-form card" onSubmit={submit}>
            <h2>Product details</h2>

            <label className="field">
              <span>Product name</span>
              <div className="input-wrap">
                <i className="fa-solid fa-tag lead" />
                <input
                  placeholder="e.g. Wireless Earbuds Pro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </label>

            <label className="field">
              <span>Category</span>
              <div className="input-wrap">
                <i className="fa-solid fa-layer-group lead" />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="admin-row">
              <label className="field">
                <span>Price (₦)</span>
                <div className="input-wrap">
                  <i className="fa-solid fa-naira-sign lead" />
                  <input
                    type="number"
                    min="0"
                    placeholder="28000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </label>
              <label className="field">
                <span>Old price (optional)</span>
                <div className="input-wrap">
                  <i className="fa-solid fa-naira-sign lead" />
                  <input
                    type="number"
                    min="0"
                    placeholder="35000"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  />
                </div>
              </label>
            </div>

            <div className="admin-row">
              <label className="field">
                <span>Stock</span>
                <div className="input-wrap">
                  <i className="fa-solid fa-boxes-stacked lead" />
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </label>
              <label className="field">
                <span>Badge (optional)</span>
                <div className="input-wrap">
                  <i className="fa-solid fa-certificate lead" />
                  <input
                    placeholder="New, Hot, Sale..."
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                </div>
              </label>
            </div>

            <label className="field">
              <span>Description</span>
              <div className="input-wrap">
                <i className="fa-solid fa-align-left lead" />
                <textarea
                  rows={3}
                  placeholder="Tell customers about this product..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </label>

            <label className="check-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span>Feature this product on the home page</span>
            </label>

            <div className="field">
              <span>Product image</span>
              <div className="upload-drop">
                <i className="fa-solid fa-cloud-arrow-up" /> Upload a file (max 2MB). It will be saved as{" "}
                <code>{storedPath}</code>.
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} />
              {file && (
                <div className="download-row">
                  <span>
                    Save the file into <code>public/images/{imageName}</code>
                  </span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={downloadImage}>
                    <i className="fa-solid fa-download" /> Download image
                  </button>
                </div>
              )}
              <input
                placeholder="or paste an image URL (https://...)"
                value={imageUrl}
                disabled={!!file}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg ck-submit">
              <i className="fa-solid fa-plus" /> Add product
            </button>
          </form>

          <aside className="admin-preview card">
            <h2>Live preview</h2>
            <div className="preview-card">
              <img src={previewSrc} alt="Product preview" />
              <div className="pc-body">
                <h3>{form.name || "Product name"}</h3>
                <div>
                  <span className="pc-price">{naira(Number(form.price) || 0)}</span>
                  {form.oldPrice && <span className="pc-old">{naira(Number(form.oldPrice))}</span>}
                </div>
                <p>{form.description || "Short product description appears here."}</p>
              </div>
            </div>

            <div className="publish-block">
              <h2>Publish</h2>
              <p className="admin-note">
                Exported files use <code>/images/&lt;name&gt;</code> paths. Drop your downloaded images into{" "}
                <code>public/images/</code>, replace <code>src/data/products.json</code>, then rebuild and deploy.
              </p>
              <div className="publish-actions">
                <button type="button" className="btn btn-primary" onClick={() => exportProducts("all")}>
                  <i className="fa-solid fa-file-export" /> Export full catalog
                </button>
                <button type="button" className="btn btn-outline" onClick={() => exportProducts("custom")}>
                  <i className="fa-solid fa-download" /> Export my products
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => importRef.current?.click()}
                >
                  <i className="fa-solid fa-file-import" /> Import JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={onImport}
                />
              </div>
              <ol className="publish-steps">
                <li>Add a product and click <strong>Download image</strong>.</li>
                <li>Save the file into <code>public/images/</code>.</li>
                <li>Click <strong>Export full catalog</strong> and replace <code>src/data/products.json</code>.</li>
                <li>Run <code>npm run build</code> and deploy.</li>
              </ol>
            </div>

            <h2>Your products ({custom.length})</h2>
            {custom.length === 0 ? (
              <p className="admin-empty">You haven't added any products yet.</p>
            ) : (
              <div className="admin-list">
                {custom.map((p) => (
                  <div key={p.id} className="admin-list-item">
                    <img src={p.image} alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {naira(p.price)} · {p.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="del"
                      onClick={() => {
                        removeProduct(p.id);
                        notify(`Removed "${p.name}".`, "info");
                      }}
                      aria-label={`Remove ${p.name}`}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Link to="/shop" className="btn btn-outline">
              View shop <i className="fa-solid fa-arrow-right" />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
