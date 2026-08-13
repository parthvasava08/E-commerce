import { useState } from "react";

const mockCategories = [
  { cat_id: 1, cat_name: "Electronics" },
  { cat_id: 2, cat_name: "Clothing" },
];
const mockSubCategories = [
  { sub_cat_id: 1, cat_id: 1, sub_cat_name: "Mobiles" },
  { sub_cat_id: 2, cat_id: 1, sub_cat_name: "Laptops" },
  { sub_cat_id: 3, cat_id: 2, sub_cat_name: "Men" },
];
const mockBrands = [
  { brand_id: 1, brand_name: "Samsung" },
  { brand_id: 2, brand_name: "Apple" },
  { brand_id: 3, brand_name: "Nike" },
];

const initialProducts = [
  {
    product_id: 1,
    cat_id: 1,
    subcat_id: 1,
    brand_id: 1,
    product_name: "Galaxy S24",
    description: "Flagship smartphone with AMOLED display.",
    price: 74999,
    discount_price: 69999,
    stock_quantity: 24,
    status: "active",
    cover_image: null,
  },
];

const emptyForm = {
  cat_id: "",
  subcat_id: "",
  brand_id: "",
  product_name: "",
  description: "",
  price: "",
  discount_price: "",
  stock_quantity: "",
  status: "active",
};

function Product() {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const availableSubCats = mockSubCategories.filter(
    (s) => String(s.cat_id) === String(form.cat_id),
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.product_name.trim() || !form.price || !form.cat_id) {
      setMessage("Product name, category, and price are required");
      return;
    }

    if (editingId) {
      // mock update — swap for axios.put(`/api/products/${editingId}`, formData)
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === editingId
            ? { ...p, ...form, cover_image: imagePreview || p.cover_image }
            : p,
        ),
      );
      setMessage("Product updated successfully");
    } else {
      // mock create — swap for axios.post('/api/products', formData)
      const newProduct = {
        product_id: products.length
          ? Math.max(...products.map((p) => p.product_id)) + 1
          : 1,
        ...form,
        cover_image: imagePreview,
      };
      setProducts((prev) => [...prev, newProduct]);
      setMessage("Product added successfully");
    }

    resetForm();
    setView("list");
  };

  const handleEditClick = (product) => {
    setEditingId(product.product_id);
    setForm({
      cat_id: product.cat_id,
      subcat_id: product.subcat_id,
      brand_id: product.brand_id,
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      status: product.status,
    });
    setImageFile(null);
    setImagePreview(product.cover_image || null);
    setView("form");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    // mock delete — swap for axios.delete(`/api/products/${id}`)
    setProducts((prev) => prev.filter((p) => p.product_id !== id));
    setMessage("Product deleted");
  };

  const catName = (id) =>
    mockCategories.find((c) => String(c.cat_id) === String(id))?.cat_name ||
    "—";
  const brandName = (id) =>
    mockBrands.find((b) => String(b.brand_id) === String(id))?.brand_name ||
    "—";

  return (
    <div style={s.page}>
      {view === "list" ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>▦</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>Products</h1>
                <p style={s.sub}>
                  Manage the products customers can browse and buy.
                </p>
              </div>
            </div>
            <button
              style={s.primaryBtn}
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Product
            </button>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Image</th>
                  <th style={s.th}>Product</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Brand</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Status</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} style={s.emptyState}>
                      No products yet — add your first one above.
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p.product_id} style={s.tr}>
                    <td style={s.td}>
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt={p.product_name}
                          style={s.thumb}
                        />
                      ) : (
                        <div style={s.thumbPlaceholder}>—</div>
                      )}
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: "#e7e9ee" }}>
                      {p.product_name}
                    </td>
                    <td style={s.td}>{catName(p.cat_id)}</td>
                    <td style={s.td}>{brandName(p.brand_id)}</td>
                    <td style={s.td}>
                      {p.discount_price ? (
                        <>
                          <span
                            style={{
                              color: "#6b7280",
                              textDecoration: "line-through",
                              marginRight: 6,
                            }}
                          >
                            ₹{p.price}
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            ₹{p.discount_price}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700 }}>₹{p.price}</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.stockBadge,
                          ...(Number(p.stock_quantity) < 5
                            ? s.stockLow
                            : s.stockOk),
                        }}
                      >
                        {p.stock_quantity} left
                      </span>
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.statusBadge,
                          ...(p.status === "active"
                            ? s.statusActive
                            : s.statusInactive),
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => handleEditClick(p)}
                        style={s.editLink}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        style={s.deleteLink}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>▦</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>
                  {editingId ? "Edit Product" : "Add Product"}
                </h1>
                <p style={s.sub}>
                  {editingId
                    ? "Update this product's details."
                    : "Create a new product listing."}
                </p>
              </div>
            </div>
            <button
              style={s.secondaryBtn}
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              ← Back to Products
            </button>
          </div>

          <div style={s.formGrid}>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>▦</div>
                <div>
                  <div style={s.cardTitle}>Product Information</div>
                  <div style={s.cardSub}>
                    Name, category, and price are required.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <select
                      value={form.cat_id}
                      onChange={(e) => {
                        handleChange("cat_id", e.target.value);
                        handleChange("subcat_id", "");
                      }}
                      style={s.input}
                    >
                      <option value="">Select category</option>
                      {mockCategories.map((c) => (
                        <option key={c.cat_id} value={c.cat_id}>
                          {c.cat_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Subcategory</label>
                    <select
                      value={form.subcat_id}
                      onChange={(e) =>
                        handleChange("subcat_id", e.target.value)
                      }
                      style={s.input}
                      disabled={!form.cat_id}
                    >
                      <option value="">Select subcategory</option>
                      {availableSubCats.map((sc) => (
                        <option key={sc.sub_cat_id} value={sc.sub_cat_id}>
                          {sc.sub_cat_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={s.row2}>
                  <div style={s.field}>
                    <label style={s.label}>Brand</label>
                    <select
                      value={form.brand_id}
                      onChange={(e) => handleChange("brand_id", e.target.value)}
                      style={s.input}
                    >
                      <option value="">Select brand</option>
                      {mockBrands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>
                          {b.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      style={s.input}
                    >
                      <option value="active">Active</option>
                      <option value="not-active">Not Active</option>
                    </select>
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Product name</label>
                  <input
                    type="text"
                    placeholder="e.g. Galaxy S24"
                    value={form.product_name}
                    onChange={(e) =>
                      handleChange("product_name", e.target.value)
                    }
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <textarea
                    placeholder="Short product description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    style={{
                      ...s.input,
                      minHeight: 80,
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={s.row3}>
                  <div style={s.field}>
                    <label style={s.label}>Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      style={s.input}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Discount price (₹)</label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={form.discount_price}
                      onChange={(e) =>
                        handleChange("discount_price", e.target.value)
                      }
                      style={s.input}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Stock quantity</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock_quantity}
                      onChange={(e) =>
                        handleChange("stock_quantity", e.target.value)
                      }
                      style={s.input}
                    />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Cover image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={s.fileInput}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={s.previewImg}
                    />
                  )}
                </div>

                <div style={s.formActions}>
                  <button type="submit" style={s.primaryBtn}>
                    {editingId ? "Save Changes" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    style={s.secondaryBtn}
                    onClick={() => {
                      resetForm();
                      setView("list");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>☰</div>
                <div style={s.cardTitle}>Checklist</div>
              </div>

              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: form.cat_id ? "#22c55e" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Choose category</div>
                  <div style={s.checkSub}>
                    Required — determines where this shows in navigation.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background:
                      form.product_name.trim() && form.price
                        ? "#3b82f6"
                        : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Name and price</div>
                  <div style={s.checkSub}>
                    Both required before this can be saved.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background:
                      form.stock_quantity !== "" ? "#eab308" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Set stock quantity</div>
                  <div style={s.checkSub}>
                    Controls "out of stock" state on the storefront.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: imagePreview ? "#22c55e" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Add cover image</div>
                  <div style={s.checkSub}>
                    Shown in product listings and cart.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "#0b0e14",
    color: "#e7e9ee",
    padding: 28,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: { display: "flex", gap: 14 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#5b8cff",
    flexShrink: 0,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#5b8cff",
    letterSpacing: "1px",
    marginBottom: 4,
  },
  h1: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  sub: { fontSize: 12.8, color: "#9aa2b1", margin: 0 },
  primaryBtn: {
    background: "#3b6ee8",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    background: "#161b26",
    color: "#c7cbd4",
    border: "1px solid #262c3a",
    padding: "10px 18px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  toast: {
    background: "#0f2a1c",
    color: "#4ade80",
    padding: "10px 16px",
    borderRadius: 9,
    fontSize: 12.8,
    fontWeight: 600,
    marginBottom: 18,
    border: "1px solid #17422c",
  },
  card: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 24,
  },
  formGrid: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18 },
  cardHead: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  cardHeadIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "#1b2436",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#5b8cff",
    flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: 800, color: "#f1f2f6" },
  cardSub: { fontSize: 12, color: "#8a92a3", marginTop: 3 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  field: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#c7cbd4",
    marginBottom: 7,
  },
  input: {
    width: "100%",
    background: "#0b0e14",
    border: "1px solid #262c3a",
    borderRadius: 9,
    padding: "11px 14px",
    fontSize: 13.5,
    color: "#e7e9ee",
    outline: "none",
    boxSizing: "border-box",
  },
  fileInput: { fontSize: 12.5, color: "#9aa2b1" },
  previewImg: {
    display: "block",
    marginTop: 12,
    width: 64,
    height: 64,
    borderRadius: 10,
    objectFit: "cover",
    border: "1px solid #262c3a",
  },
  formActions: { display: "flex", gap: 10, marginTop: 6 },
  checkItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: "12px 0",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    marginTop: 5,
    flexShrink: 0,
  },
  checkTitle: { fontSize: 13, fontWeight: 700, color: "#e7e9ee" },
  checkSub: { fontSize: 11.8, color: "#8a92a3", marginTop: 2 },
  divider: { height: 1, background: "#1e2432" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12.8 },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "0 8px 14px",
    borderBottom: "1px solid #1e2432",
  },
  tr: { borderBottom: "1px solid #1e2432" },
  td: { padding: "12px 8px", verticalAlign: "middle" },
  thumb: { width: 34, height: 34, borderRadius: 8, objectFit: "cover" },
  thumbPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#161b26",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3a3f4b",
    fontSize: 12,
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 20,
  },
  stockOk: { background: "#0f2a1c", color: "#4ade80" },
  stockLow: { background: "#2a1414", color: "#f87171" },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  statusActive: { background: "#0f2a1c", color: "#4ade80" },
  statusInactive: { background: "#221a0d", color: "#eab308" },
  editLink: {
    background: "none",
    border: "none",
    color: "#5b8cff",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    marginRight: 14,
  },
  deleteLink: {
    background: "none",
    border: "none",
    color: "#f87171",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "34px 0",
    color: "#6b7280",
    fontSize: 13,
  },
};

export default Product;
