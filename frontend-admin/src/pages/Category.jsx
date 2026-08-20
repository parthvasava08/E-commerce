import { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/Category.css";

function Category() {
  const [catName, setCatName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("cat_name", catName);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/categories/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setMessage("Category updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Category added successfully");
      }
      resetForm();
      fetchCategories();
      setView("list");
    } catch (error) {
      setMessage("Something went wrong");
      console.error(error);
    }
  };

  const resetForm = () => {
    setCatName("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.cat_id);
    setCatName(cat.cat_name);
    setImageFile(null);
    setImagePreview(cat.image || null);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      setMessage("Category deleted");
      fetchCategories();
    } catch (error) {
      setMessage("Failed to delete category");
      console.error(error);
    }
  };

  const step1Done = catName.trim().length > 0;
  const step2Done = !!imageFile || !!imagePreview;

  return (
    <div className="page">
      {view === "list" ? (
        <>
          <div className="header-row">
            <div className="header-left">
              <div className="header-icon">▤</div>
              <div>
                <div className="kicker">CATALOG</div>
                <h1 className="h1">Categories</h1>
                <p className="sub">
                  Manage top-level product categories for your store.
                </p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Category
            </button>
          </div>

          {message && <div className="toast">{message}</div>}

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Image</th>
                  <th className="th">Name</th>
                  <th className="th">ID</th>
                  <th className="th th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No categories yet — add your first one above.
                    </td>
                  </tr>
                )}
                {categories.map((cat) => (
                  <tr key={cat.cat_id} className="tr">
                    <td className="td">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.cat_name}
                          className="thumb"
                        />
                      ) : (
                        <div className="thumb-placeholder">—</div>
                      )}
                    </td>
                    <td className="td td-name">{cat.cat_name}</td>
                    <td className="td td-id">{cat.cat_id}</td>
                    <td className="td td-right">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="edit-link"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.cat_id)}
                        className="delete-link"
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
          <div className="header-row">
            <div className="header-left">
              <div className="header-icon">▤</div>
              <div>
                <div className="kicker">CATALOG</div>
                <h1 className="h1">
                  {editingId ? "Edit Category" : "Add Category"}
                </h1>
                <p className="sub">
                  {editingId
                    ? "Update this category's details."
                    : "Create a new top-level product category."}
                </p>
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              ← Back to Categories
            </button>
          </div>

          <div className="form-grid">
            <div className="card">
              <div className="card-head">
                <div className="card-head-icon">▤</div>
                <div>
                  <div className="card-title">Category Information</div>
                  <div className="card-sub">
                    Fields marked required must be filled before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Category name</label>
                  <input
                    type="text"
                    placeholder=""
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="field">
                  <label className="label">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="preview-img"
                    />
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? "Save Changes" : "Add Category"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
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

            <div className="card">
              <div className="card-head">
                <div className="card-head-icon">☰</div>
                <div className="card-title">Checklist</div>
              </div>

              <div className="check-item">
                <span
                  className={`dot ${step1Done ? "dot-done" : "dot-pending"}`}
                />
                <div>
                  <div className="check-title">Name your category</div>
                  <div className="check-sub">
                    Keep it short — this shows in navigation.
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div className="check-item">
                <span
                  className={`dot ${step2Done ? "dot-partial" : "dot-pending"}`}
                />
                <div>
                  <div className="check-title">Add an image</div>
                  <div className="check-sub">
                    Used as the category thumbnail in the storefront.
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div className="check-item">
                <span
                  className="dot dot-partial"
                  style={{ background: "#eab308" }}
                />
                <div>
                  <div className="check-title">Save</div>
                  <div className="check-sub">
                    New categories appear immediately in the product form.
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

export default Category;
