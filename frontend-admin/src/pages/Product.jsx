import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

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

const IMAGE_FIELDS = [
  { key: "cover_image", label: "Cover image" },
  { key: "image_1", label: "Image 1" },
  { key: "image_2", label: "Image 2" },
  { key: "image_3", label: "Image 3" },
  { key: "image_4", label: "Image 4" },
];

const emptyImageFiles = {
  cover_image: null,
  image_1: null,
  image_2: null,
  image_3: null,
  image_4: null,
};
const emptyImagePreviews = {
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
  const [imageFiles, setImageFiles] = useState(emptyImageFiles);
  const [imagePreviews, setImagePreviews] = useState(emptyImagePreviews);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    const res = await api.get("/api/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/api/subcategories");
    setSubCategories(res.data);
  };

  const fetchBrands = async () => {
    const res = await api.get("/api/brands");
    setBrands(res.data);
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

  const handleImageChange = (field, e) => {
    const file = e.target.files[0];
    setImageFiles((prev) => ({ ...prev, [field]: file }));
    setImagePreviews((prev) => ({
      ...prev,
      [field]: file ? URL.createObjectURL(file) : prev[field],
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFiles(emptyImageFiles);
    setImagePreviews(emptyImagePreviews);
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
      if (value !== "" && value !== null) formData.append(key, value);
    });
    Object.entries(imageFiles).forEach(([field, file]) => {
      if (file) formData.append(field, file);
    });

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Product updated successfully");
      } else {
        await api.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Product added successfully");
      }
      resetForm();
      fetchProducts();
      setView("list");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
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
    setImageFiles(emptyImageFiles);
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
      await api.delete(`/api/products/${id}`);
      setMessage("Product deleted");
      fetchProducts();
    } catch (error) {
      setMessage("Failed to delete product");
      console.error(error);
    }
  };

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen p-7 font-sans">
      {view === "list" ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-base flex-shrink-0">
                ▦
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  Products
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  Manage the products customers can browse and buy.
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
              + Add Product
            </button>
          </div>

          {message && (
            <div className="bg-brand-success-bg text-brand-success border border-brand-success-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5">
              {message}
            </div>
          )}

          <div className="bg-brand-panel border border-brand-border rounded-2xl p-6">
            <table className="w-full border-collapse text-[12.8px]">
              <thead>
                <tr>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Image
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Product
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Category
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Brand
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Price
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Stock
                  </th>
                  <th className="text-left text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Status
                  </th>
                  <th className="text-right text-brand-text-muted font-bold text-[10px] uppercase tracking-wide px-2 pb-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-brand-text-muted text-sm"
                    >
                      No products yet — add your first one above.
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr
                    key={p.product_id}
                    className="border-b border-brand-border"
                  >
                    <td className="py-3 px-2">
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt={p.product_name}
                          className="w-8.5 h-8.5 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-lg bg-brand-input flex items-center justify-center text-brand-text-faint text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 font-semibold text-brand-text">
                      {p.product_name}
                    </td>
                    <td className="py-3 px-2">{p.Category?.cat_name || "—"}</td>
                    <td className="py-3 px-2">{p.Brand?.brand_name || "—"}</td>
                    <td className="py-3 px-2">
                      {p.discount_price ? (
                        <>
                          <span className="text-brand-text-muted line-through mr-1.5">
                            ₹{p.price}
                          </span>
                          <span className="font-bold">₹{p.discount_price}</span>
                        </>
                      ) : (
                        <span className="font-bold">₹{p.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          Number(p.stock_quantity) < 5
                            ? "bg-brand-danger-bg text-brand-danger"
                            : "bg-brand-success-bg text-brand-success"
                        }`}
                      >
                        {p.stock_quantity} left
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          p.status === "active"
                            ? "bg-brand-success-bg text-brand-success"
                            : "bg-[#221a0d] text-brand-warn"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-brand-accent font-bold text-[12.5px] mr-3.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.product_id)}
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
                ▦
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  {editingId ? "Edit Product" : "Add Product"}
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  {editingId
                    ? "Update this product's details."
                    : "Create a new product listing."}
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
              ← Back to Products
            </button>
          </div>

          <div className="grid grid-cols-[1.7fr_1fr] gap-4.5">
            <div className="bg-brand-panel border border-brand-border rounded-2xl p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-sm flex-shrink-0">
                  ▦
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-white">
                    Product Information
                  </div>
                  <div className="text-xs text-brand-text-dim mt-0.5">
                    Name, category, and price are required.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.cat_id}
                      onChange={(e) => {
                        handleChange("cat_id", e.target.value);
                        handleChange("subcat_id", "");
                      }}
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.cat_id} value={c.cat_id}>
                          {c.cat_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Subcategory
                    </label>
                    <select
                      value={form.subcat_id}
                      onChange={(e) =>
                        handleChange("subcat_id", e.target.value)
                      }
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border disabled:opacity-50"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Brand
                    </label>
                    <select
                      value={form.brand_id}
                      onChange={(e) => handleChange("brand_id", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    >
                      <option value="">Select brand</option>
                      {brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>
                          {b.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    >
                      <option value="active">Active</option>
                      <option value="not-active">Not Active</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Product name
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={form.product_name}
                    onChange={(e) =>
                      handleChange("product_name", e.target.value)
                    }
                    className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Short product description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border min-h-[80px] resize-y font-sans"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Discount price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={form.discount_price}
                      onChange={(e) =>
                        handleChange("discount_price", e.target.value)
                      }
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                      Stock quantity
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock_quantity}
                      onChange={(e) =>
                        handleChange("stock_quantity", e.target.value)
                      }
                      className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-2">
                    Images
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {IMAGE_FIELDS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex flex-col items-center gap-2"
                      >
                        <label
                          htmlFor={key}
                          className="w-full aspect-square rounded-lg border border-dashed border-brand-border-light bg-brand-bg flex items-center justify-center cursor-pointer overflow-hidden"
                        >
                          {imagePreviews[key] ? (
                            <img
                              src={imagePreviews[key]}
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-brand-text-faint text-2xl">
                              +
                            </span>
                          )}
                        </label>
                        <input
                          id={key}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(key, e)}
                          className="hidden"
                        />
                        <span className="text-[10.5px] text-brand-text-muted text-center">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 mt-1.5">
                  <button
                    type="submit"
                    className="bg-brand-accent-strong text-white px-4.5 py-2.5 rounded-lg text-sm font-bold"
                  >
                    {editingId ? "Save Changes" : "Add Product"}
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
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${form.cat_id ? "bg-brand-success" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Choose category
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                    Required — determines where this shows in navigation.
                  </div>
                </div>
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${form.product_name.trim() && form.price ? "bg-brand-accent" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Name and price
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                    Both required before this can be saved.
                  </div>
                </div>
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${form.stock_quantity !== "" ? "bg-brand-warn" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Set stock quantity
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                    Controls "out of stock" state on the storefront.
                  </div>
                </div>
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex gap-3 items-start py-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${imagePreviews.cover_image ? "bg-brand-success" : "bg-brand-border-light"}`}
                />
                <div>
                  <div className="text-[13px] font-bold text-brand-text">
                    Add cover image
                  </div>
                  <div className="text-[11.8px] text-brand-text-dim mt-0.5">
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

export default Product;
