import { useState, useEffect } from "react";
import axios from "axios";

function Brand() {
  const [brandName, setBrandName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brands, setBrands] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/brands");
      setBrands(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBrands(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("brand_name", brandName);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/brands/${editingId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        setMessage("Brand updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/brands", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Brand added successfully");
      }
      resetForm();
      fetchBrands();
      setView("list");
    } catch (error) {
      setMessage("Something went wrong");
      console.error(error);
    }
  };

  const resetForm = () => {
    setBrandName("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleEditClick = (brand) => {
    setEditingId(brand.brand_id);
    setBrandName(brand.brand_name);
    setImageFile(null);
    setImagePreview(brand.logo_image || null);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/brands/${id}`);
      setMessage("Brand deleted");
      fetchBrands();
    } catch (error) {
      setMessage("Failed to delete brand");
      console.error(error);
    }
  };

  const step1Done = brandName.trim().length > 0;
  const step2Done = !!imageFile || !!imagePreview;

  return (
    <div style={s.page}>
      {view === "list" ? (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>◈</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>Brands</h1>
                <p style={s.sub}>
                  Manage manufacturer/brand records used across products.
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
              + Add Brand
            </button>
          </div>

          {message && <div style={s.toast}>{message}</div>}

          <div style={s.card}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Logo</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>ID</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={4} style={s.emptyState}>
                      No brands yet — add your first one above.
                    </td>
                  </tr>
                )}
                {brands.map((brand) => (
                  <tr key={brand.brand_id} style={s.tr}>
                    <td style={s.td}>
                      {brand.logo_image ? (
                        <img
                          src={brand.logo_image}
                          alt={brand.brand_name}
                          style={s.thumb}
                        />
                      ) : (
                        <div style={s.thumbPlaceholder}>—</div>
                      )}
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: "#e7e9ee" }}>
                      {brand.brand_name}
                    </td>
                    <td style={{ ...s.td, color: "#6b7280" }}>
                      {brand.brand_id}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        onClick={() => handleEditClick(brand)}
                        style={s.editLink}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brand.brand_id)}
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
              <div style={s.headerIcon}>◈</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>{editingId ? "Edit Brand" : "Add Brand"}</h1>
                <p style={s.sub}>
                  {editingId
                    ? "Update this brand's details."
                    : "Create a new brand record."}
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
              ← Back to Brands
            </button>
          </div>

          <div style={s.formGrid}>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>◈</div>
                <div>
                  <div style={s.cardTitle}>Brand Information</div>
                  <div style={s.cardSub}>
                    Fields marked required must be filled before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>Brand name</label>
                  <input
                    type="text"
                    placeholder=""
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Logo</label>
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
                    {editingId ? "Save Changes" : "Add Brand"}
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
                    background: step1Done ? "#22c55e" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Name the brand</div>
                  <div style={s.checkSub}>
                    Shown as a filter option on the storefront.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span
                  style={{
                    ...s.dot,
                    background: step2Done ? "#3b82f6" : "#3a3f4b",
                  }}
                />
                <div>
                  <div style={s.checkTitle}>Add a logo</div>
                  <div style={s.checkSub}>
                    Used next to the brand name in filters.
                  </div>
                </div>
              </div>
              <div style={s.divider} />
              <div style={s.checkItem}>
                <span style={{ ...s.dot, background: "#eab308" }} />
                <div>
                  <div style={s.checkTitle}>Save</div>
                  <div style={s.checkSub}>
                    New brands appear immediately in the product form.
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
  formGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 },
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
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "0 10px 14px",
    borderBottom: "1px solid #1e2432",
  },
  tr: { borderBottom: "1px solid #1e2432" },
  td: { padding: "13px 10px", verticalAlign: "middle" },
  thumb: { width: 38, height: 38, borderRadius: 8, objectFit: "cover" },
  thumbPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    background: "#161b26",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3a3f4b",
    fontSize: 12,
  },
  editLink: {
    background: "none",
    border: "none",
    color: "#5b8cff",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    marginRight: 16,
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

export default Brand;
