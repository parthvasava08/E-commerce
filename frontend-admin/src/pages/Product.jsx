import { useState, useEffect } from "react";
import axios from "axios";

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

const emptyImages = {
  cover_image: null,
  image_1: null,
  image_2: null,
  image_3: null,
  image_4: null,
};

function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState(emptyImages);
  const [imagePreviews, setImagePreviews] = useState(emptyImages);

  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/subcategories");
      setSubCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/brands");
      setBrands(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts(); // eslint-disable-line react-hooks/set-state-in-effect
    fetchCategories();
    fetchSubCategories();
    fetchBrands();
  }, []);

  const availableSubCats = subCategories.filter(
    (s) => String(s.cat_id) === String(form.cat_id),
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    setImageFiles((prev) => ({ ...prev, [field]: file }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleRemoveImage = (field) => {
    setImageFiles((prev) => ({ ...prev, [field]: null }));
    setImagePreviews((prev) => ({ ...prev, [field]: null }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFiles(emptyImages);
    setImagePreviews(emptyImages);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product_name.trim() || !form.price || !form.cat_id) {
      setMessage("Product name, category, and price are required");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    Object.entries(imageFiles).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        setMessage("Product updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Product added successfully");
      }
      resetForm();
      fetchProducts();
      setView("list");
    } catch (error) {
      setMessage("Something went wrong");
      console.error(error);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.product_id);
    setForm({
      cat_id: product.cat_id || "",
      subcat_id: product.subcat_id || "",
      brand_id: product.brand_id || "",
      product_name: product.product_name || "",
      description: product.description || "",
      price: product.price || "",
      discount_price: product.discount_price || "",
      stock_quantity: product.stock_quantity || "",
      status: product.status || "active",
    });
    setImageFiles(emptyImages);
    setImagePreviews({
      cover_image: product.cover_image || null,
      image_1: product.image_1 || null,
      image_2: product.image_2 || null,
      image_3: product.image_3 || null,
      image_4: product.image_4 || null,
    });
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setMessage("Product deleted");
      fetchProducts();
    } catch (error) {
      setMessage("Failed to delete product");
      console.error(error);
    }
  };

  const catName = (product) => product.Category?.cat_name || "—";
  const brandName = (product) => product.Brand?.brand_name || "—";

  const imageFields = [
    "cover_image",
    "image_1",
    "image_2",
    "image_3",
    "image_4",
  ];
  const slotLabel = (field, idx) => (idx === 0 ? "Cover" : `Photo ${idx}`);

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
                    <td style={s.td}>{catName(p)}</td>
                    <td style={s.td}>{brandName(p)}</td>
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
                      {categories.map((c) => (
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
                      {brands.map((b) => (
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
                    placeholder=""
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
                  <label style={s.label}>Product images</label>
                  <div style={s.imageGrid}>
                    {imageFields.map((field, idx) => (
                      <div key={field} style={s.imageSlot}>
                        {imagePreviews[field] ? (
                          <div style={s.imageSlotFilled}>
                            <img
                              src={imagePreviews[field]}
                              alt={field}
                              style={s.slotImg}
                            />
                            <button
                              type="button"
                              style={s.removeBtn}
                              onClick={() => handleRemoveImage(field)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label style={s.imageSlotEmpty}>
                            <span style={s.slotPlus}>+</span>
                            <span style={s.slotLabelText}>
                              {slotLabel(field, idx)}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(field, e)}
                              style={{ display: "none" }}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  <p style={s.imageHint}>
                    Cover image shows in listings. Up to 4 additional photos
                    appear on the product page.
                  </p>
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
                    background: imagePreviews.cover_image
                      ? "#22c55e"
                      : "#3a3f4b",
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
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 10,
  },
  imageSlot: {
    aspectRatio: "1",
    width: "100%",
  },
  imageSlotEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    background: "#0b0e14",
    border: "1px dashed #262c3a",
    borderRadius: 10,
    cursor: "pointer",
    color: "#6b7280",
  },
  slotPlus: { fontSize: 20, fontWeight: 300, lineHeight: 1 },
  slotLabelText: { fontSize: 10, fontWeight: 600 },
  imageSlotFilled: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  slotImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #262c3a",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#f87171",
    color: "#fff",
    border: "2px solid #0b0e14",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  imageHint: {
    fontSize: 11.5,
    color: "#6b7280",
    marginTop: 8,
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
