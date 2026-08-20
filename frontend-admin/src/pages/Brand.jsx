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
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
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
    <div className="bg-brand-bg text-brand-text min-h-screen p-7 font-sans">
      {view === "list" ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-base flex-shrink-0">
                ◈
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  Brands
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  Manage manufacturer/brand records used across products.
                </p>
              </div>
            </div>
            <button
              className="bg-brand-accent-strong text-white px-4.5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap"
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Brand
            </button>
          </div>

          {message && (
            <div className="bg-brand-success-bg text-brand-success border border-brand-success-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5">
              {message}
            </div>
          )}

          <div className="bg-brand-panel border border-brand-border rounded-2xl p-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5">
                    Logo
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5">
                    Name
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5">
                    ID
                  </th>
                  <th className="text-right text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-brand-text-muted text-sm"
                    >
                      No brands yet — add your first one above.
                    </td>
                  </tr>
                )}
                {brands.map((brand) => (
                  <tr
                    key={brand.brand_id}
                    className="border-b border-brand-border"
                  >
                    <td className="py-3 px-2.5">
                      {brand.logo_image ? (
                        <img
                          src={brand.logo_image}
                          alt={brand.brand_name}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-brand-input flex items-center justify-center text-brand-text-faint text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2.5 font-semibold text-brand-text">
                      {brand.brand_name}
                    </td>
                    <td className="py-3 px-2.5 text-brand-text-muted">
                      {brand.brand_id}
                    </td>
                    <td className="py-3 px-2.5 text-right">
                      <button
                        onClick={() => handleEditClick(brand)}
                        className="text-brand-accent font-bold text-[12.5px] mr-3.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brand.brand_id)}
                        className="text-brand-danger font-bold text-[12.5px]"
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
              <div className="w-9 h-9 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-base flex-shrink-0">
                ◈
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  {editingId ? "Edit Brand" : "Add Brand"}
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  {editingId
                    ? "Update this brand's details."
                    : "Create a new brand record."}
                </p>
              </div>
            </div>
            <button
              className="bg-brand-input text-brand-text-dim border border-brand-border-light px-4.5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap"
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              ← Back to Brands
            </button>
          </div>

          <div className="grid grid-cols-[1.6fr_1fr] gap-4.5">
            <div className="bg-brand-panel border border-brand-border rounded-2xl p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-sm flex-shrink-0">
                  ◈
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-white">
                    Brand Information
                  </div>
                  <div className="text-xs text-brand-text-dim mt-0.5">
                    Fields marked required must be filled before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Brand name
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-[12.5px] text-brand-text-dim"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="block mt-3 w-16 h-16 rounded-lg object-cover border border-brand-border-light"
                    />
                  )}
                </div>

                <div className="flex gap-2.5 mt-1.5">
                  <button
                    type="submit"
                    className="bg-brand-accent-strong text-white px-4.5 py-2.5 rounded-lg text-sm font-bold"
                  >
                    {editingId ? "Save Changes" : "Add Brand"}
                  </button>
                  <button
                    type="button"
                    className="bg-brand-input text-brand-text-dim border border-brand-border-light px-4.5 py-2.5 rounded-lg text-sm font-bold"
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

            <div className="bg-brand-panel border border-brand-border rounded-2xl p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-sm flex-shrink-0">
                  ☰
                </div>
                <div className="text-[15px] font-extrabold text-white">
                  Checklist
                </div>
              </div>

              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${step1Done ? "bg-brand-success" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Name the brand
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                    Shown as a filter option on the storefront.
                  </div>
                </div>
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${step2Done ? "bg-brand-accent" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Add a logo
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                    Used next to the brand name in filters.
                  </div>
                </div>
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex gap-3 items-start py-3">
                <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-brand-warn" />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Save
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
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

export default Brand;
