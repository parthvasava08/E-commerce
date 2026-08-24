import { useState, useEffect } from "react";
import axios from "axios";

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
    <div className="font-sans text-[#e7e9ee]">
      {view === "list" ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ▤
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Categories
                </h1>
                <p className="text-xs text-[#9aa2b1]">
                  Manage top-level product categories for your store.
                </p>
              </div>
            </div>
            <button
              className="bg-[#3b6ee8] text-white px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Category
            </button>
          </div>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border border-[#17422c]">
              {message}
            </div>
          )}

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                    Image
                  </th>
                  <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                    Name
                  </th>
                  <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                    ID
                  </th>
                  <th className="text-right text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8.5 text-[#6b7280] text-sm"
                    >
                      No categories yet — add your first one above.
                    </td>
                  </tr>
                )}
                {categories.map((cat) => (
                  <tr key={cat.cat_id} className="border-b border-[#1e2432]">
                    <td className="py-3.5 px-2.5 align-middle">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.cat_name}
                          className="w-9.5 h-9.5 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-9.5 h-9.5 rounded-lg bg-[#161b26] flex items-center justify-center text-[#3a3f4b] text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-2.5 align-middle font-semibold text-[#e7e9ee]">
                      {cat.cat_name}
                    </td>
                    <td className="py-3.5 px-2.5 align-middle text-[#6b7280]">
                      {cat.cat_id}
                    </td>
                    <td className="py-3.5 px-2.5 align-middle text-right">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="text-[#5b8cff] font-bold text-xs mr-4 cursor-pointer bg-transparent border-none"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.cat_id)}
                        className="text-[#f87171] font-bold text-xs cursor-pointer bg-transparent border-none"
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
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ▤
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  {editingId ? "Edit Category" : "Add Category"}
                </h1>
                <p className="text-xs text-[#9aa2b1]">
                  {editingId
                    ? "Update this category's details."
                    : "Create a new top-level product category."}
                </p>
              </div>
            </div>
            <button
              className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              ← Back to Categories
            </button>
          </div>

          <div className="grid grid-cols-[1.6fr_1fr] gap-4.5">
            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                  ▤
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                    Category Information
                  </div>
                  <div className="text-xs text-[#8a92a3] mt-0.5">
                    Fields marked required must be filled before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4.5">
                  <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                    Category name
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-[#9aa2b1]"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="block mt-3 w-16 h-16 rounded-lg object-cover border border-[#262c3a]"
                    />
                  )}
                </div>

                <div className="flex gap-2.5 mt-1.5">
                  <button
                    type="submit"
                    className="bg-[#3b6ee8] text-white px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
                  >
                    {editingId ? "Save Changes" : "Add Category"}
                  </button>
                  <button
                    type="button"
                    className="bg-[#161b26] text-[#c7cbd4] border border-[#262c3a] px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap"
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

            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                  ☰
                </div>
                <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                  Checklist
                </div>
              </div>

              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    step1Done ? "bg-[#22c55e]" : "bg-[#3a3f4b]"
                  }`}
                />
                <div>
                  <div className="text-sm font-bold text-[#e7e9ee]">
                    Name your category
                  </div>
                  <div className="text-[11.8px] text-[#8a92a3] mt-0.5">
                    Keep it short — this shows in navigation.
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#1e2432]" />
              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    step2Done ? "bg-[#3b82f6]" : "bg-[#3a3f4b]"
                  }`}
                />
                <div>
                  <div className="text-sm font-bold text-[#e7e9ee]">
                    Add an image
                  </div>
                  <div className="text-[11.8px] text-[#8a92a3] mt-0.5">
                    Used as the category thumbnail in the storefront.
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#1e2432]" />
              <div className="flex gap-3 items-start py-3">
                <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-[#eab308]" />
                <div>
                  <div className="text-sm font-bold text-[#e7e9ee]">Save</div>
                  <div className="text-[11.8px] text-[#8a92a3] mt-0.5">
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
