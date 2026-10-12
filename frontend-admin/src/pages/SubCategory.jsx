import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axiosInstance";
import {
  validateImage,
  getErrorMessage,
  IMAGE_ACCEPT,
} from "../utils/formHelpers";

const PAGE_SIZE = 10;

function groupByCategory(subs) {
  return subs.reduce((acc, sub) => {
    const key = sub.Category?.cat_name || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(sub);
    return acc;
  }, {});
}

export default function SubCategory() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [catId, setCatId] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [collapsed, setCollapsed] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(new Set());

  const [message, setMessage] = useState({ text: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await api.get("/api/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/api/subcategories");
    setSubCategories(res.data);
  };

  useEffect(() => {
    const load = async () => {
      await fetchCategories();
      await fetchSubCategories();
    };
    load();
  }, []);

  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const toast = (text, type = "success") => setMessage({ text, type });

  const filtered = useMemo(() => {
    let list = subCategories;
    if (filterCat)
      list = list.filter((s) => s.Category?.cat_name === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.sub_cat_name.toLowerCase().includes(q) ||
          (s.Category?.cat_name || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [subCategories, search, filterCat]);

  const grouped = useMemo(() => {
    const g = groupByCategory(filtered);
    Object.keys(g).forEach((k) => {
      g[k].sort((a, b) => a.sub_cat_name.localeCompare(b.sub_cat_name));
    });
    const entries = Object.entries(g);
    if (sortBy === "name") entries.sort(([a], [b]) => a.localeCompare(b));
    if (sortBy === "count") entries.sort(([, a], [, b]) => b.length - a.length);
    return entries;
  }, [filtered, sortBy]);

  const flatFiltered = filtered;
  const totalPages = Math.max(1, Math.ceil(flatFiltered.length / PAGE_SIZE));

  const pagedSubIds = useMemo(() => {
    const sorted = [...flatFiltered].sort((a, b) =>
      sortBy === "count"
        ? (a.Category?.cat_name || "").localeCompare(b.Category?.cat_name || "")
        : a.sub_cat_name.localeCompare(b.sub_cat_name),
    );
    const start = (page - 1) * PAGE_SIZE;
    return new Set(
      sorted.slice(start, start + PAGE_SIZE).map((s) => s.sub_cat_id),
    );
  }, [flatFiltered, page, sortBy]);

  const pagedGrouped = useMemo(() => {
    return grouped
      .map(([catName, subs]) => [
        catName,
        subs.filter((s) => pagedSubIds.has(s.sub_cat_id)),
      ])
      .filter(([, subs]) => subs.length > 0);
  }, [grouped, pagedSubIds]);

  const categoryNames = useMemo(() => {
    const names = [
      ...new Set(
        subCategories.map((s) => s.Category?.cat_name).filter(Boolean),
      ),
    ];
    return names.sort();
  }, [subCategories]);

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCollapse = useCallback((catName) => {
    setCollapsed((prev) => ({ ...prev, [catName]: !prev[catName] }));
  }, []);

  const handleExpandCollapseAll = () => {
    const next = !allCollapsed;
    setAllCollapsed(next);
    const map = {};
    grouped.forEach(([k]) => {
      map[k] = next;
    });
    setCollapsed(map);
  };

  const isOpen = (catName) => collapsed[catName] !== true;

  const resetForm = () => {
    setCatId("");
    setSubCatName("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const problem = validateImage(file);
    if (problem) {
      toast(problem, "error");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!catId) return toast("Please select a parent category.", "error");
    if (!subCatName.trim())
      return toast("Subcategory name is required.", "error");
    if (subCatName.trim().length > 100)
      return toast("Subcategory name can be at most 100 characters.", "error");

    const formData = new FormData();
    formData.append("cat_id", catId);
    formData.append("sub_cat_name", subCatName.trim());
    if (imageFile) formData.append("image", imageFile);

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/subcategories/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast(`Subcategory "${subCatName.trim()}" updated successfully.`);
      } else {
        await api.post("/api/subcategories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast(`Subcategory "${subCatName.trim()}" added successfully.`);
      }
      resetForm();
      await fetchSubCategories();
      setView("list");
    } catch (error) {
      toast(getErrorMessage(error, "Could not save the subcategory."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (sub) => {
    setEditingId(sub.sub_cat_id);
    setCatId(sub.cat_id);
    setSubCatName(sub.sub_cat_name);
    setImageFile(null);
    setImagePreview(sub.image || null);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory? This cannot be undone."))
      return;
    try {
      await api.delete(`/api/subcategories/${id}`);
      toast("Subcategory deleted.");
      fetchSubCategories();
    } catch (error) {
      toast(
        getErrorMessage(error, "Failed to delete the subcategory."),
        "error",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (
      !window.confirm(
        `Delete ${selected.size} subcategori${selected.size > 1 ? "es" : ""}? This cannot be undone.`,
      )
    )
      return;
    try {
      await Promise.all(
        [...selected].map((id) => api.delete(`/api/subcategories/${id}`)),
      );
      toast(
        `${selected.size} subcategori${selected.size > 1 ? "es" : ""} deleted.`,
      );
      setSelected(new Set());
      fetchSubCategories();
    } catch (error) {
      toast(
        getErrorMessage(error, "Some subcategories could not be deleted."),
        "error",
      );
    }
  };

  const step1Done = !!catId;
  const step2Done = subCatName.trim().length > 0;

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen font-sans">
      {view === "list" && (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-base flex-shrink-0">
                ▥
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  Subcategories
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  {subCategories.length} subcategories · {categoryNames.length}{" "}
                  categories
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
              + Add Subcategory
            </button>
          </div>

          {message.text && (
            <div
              className={
                message.type === "error"
                  ? "bg-brand-danger-bg text-brand-danger border border-brand-danger-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5"
                  : "bg-brand-success-bg text-brand-success border border-brand-success-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5"
              }
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2.5 items-center mb-3.5 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-brand-panel border border-brand-border rounded-lg px-3 py-2.5">
              <span className="text-brand-text-muted text-lg">⌕</span>
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-brand-text"
                type="text"
                placeholder="Search subcategories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  setSelected(new Set());
                }}
              />
              {search && (
                <button
                  className="text-brand-text-muted text-xs"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    setSelected(new Set());
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              className="bg-brand-panel border border-brand-border rounded-lg px-3 py-2.5 text-[12.5px] text-brand-text-dim cursor-pointer outline-none"
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setPage(1);
                setSelected(new Set());
              }}
            >
              <option value="">All categories</option>
              {categoryNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <select
              className="bg-brand-panel border border-brand-border rounded-lg px-3 py-2.5 text-[12.5px] text-brand-text-dim cursor-pointer outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort: A → Z</option>
              <option value="count">Sort: Most items</option>
            </select>

            <button
              className="bg-transparent text-brand-text-dim border border-brand-border-light px-3.5 py-2 rounded-lg text-[12.5px] font-semibold whitespace-nowrap"
              onClick={handleExpandCollapseAll}
            >
              {allCollapsed ? "▸ Expand all" : "▾ Collapse all"}
            </button>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2.5 bg-brand-panel border border-brand-border rounded-lg px-4 py-2.5 mb-3.5">
              <span className="text-sm font-bold text-brand-text flex-1">
                {selected.size} selected
              </span>
              <button
                className="bg-brand-danger-strong text-brand-danger border border-brand-danger-strong-border px-3.5 py-2 rounded-lg text-[12.5px] font-bold"
                onClick={handleBulkDelete}
              >
                Delete selected
              </button>
              <button
                className="bg-transparent text-brand-text-dim border border-brand-border-light px-3.5 py-2 rounded-lg text-[12.5px] font-semibold"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </button>
            </div>
          )}

          {pagedGrouped.length === 0 ? (
            <div className="text-center py-12 text-brand-text-muted text-sm">
              {search || filterCat
                ? "No results found."
                : "No subcategories yet — add your first one."}
            </div>
          ) : (
            pagedGrouped.map(([catName, subs]) => (
              <div
                key={catName}
                className="bg-brand-panel border border-brand-border rounded-xl mb-3.5 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between px-4.5 py-3.5 cursor-pointer select-none bg-brand-panel-alt border-b border-brand-border"
                  onClick={() => toggleCollapse(catName)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-brand-accent text-[13px] w-3.5">
                      {isOpen(catName) ? "▾" : "▸"}
                    </span>
                    <span className="text-[13.5px] font-extrabold text-brand-text">
                      {catName}
                    </span>
                    <span className="bg-brand-panel-alt text-brand-accent text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {subs.length}
                    </span>
                  </div>
                </div>

                {isOpen(catName) && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="text-left text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5 border-b border-brand-border w-8">
                            <input
                              type="checkbox"
                              checked={subs.every((s) =>
                                selected.has(s.sub_cat_id),
                              )}
                              onChange={() => {
                                const allChecked = subs.every((s) =>
                                  selected.has(s.sub_cat_id),
                                );
                                setSelected((prev) => {
                                  const next = new Set(prev);
                                  subs.forEach((s) =>
                                    allChecked
                                      ? next.delete(s.sub_cat_id)
                                      : next.add(s.sub_cat_id),
                                  );
                                  return next;
                                });
                              }}
                              className="accent-brand-accent-strong w-3.5 h-3.5 cursor-pointer"
                            />
                          </th>
                          <th className="text-left text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5 border-b border-brand-border">
                            Subcategory
                          </th>
                          <th className="text-right text-brand-text-muted font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5 border-b border-brand-border">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map((sub) => (
                          <tr
                            key={sub.sub_cat_id}
                            className={`border-b border-brand-border ${selected.has(sub.sub_cat_id) ? "bg-brand-panel-alt" : ""}`}
                          >
                            <td className="px-4.5 py-3">
                              <input
                                type="checkbox"
                                checked={selected.has(sub.sub_cat_id)}
                                onChange={() => toggleOne(sub.sub_cat_id)}
                                className="accent-brand-accent-strong w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="px-4.5 py-3 font-semibold text-brand-text">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent mr-2.5 align-middle" />
                              {sub.sub_cat_name}
                              <span className="ml-2.5 text-[10.5px] font-medium text-brand-text-faint">
                                #{sub.sub_cat_id}
                              </span>
                            </td>
                            <td className="px-4.5 py-3 text-right">
                              <button
                                onClick={() => handleEditClick(sub)}
                                className="text-brand-accent font-bold text-[12.5px] mr-3.5"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(sub.sub_cat_id)}
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
                )}
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex gap-1.5 items-center justify-center mt-5 flex-wrap">
              <button
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold border border-brand-border ${page === 1 ? "opacity-35 cursor-not-allowed" : "bg-brand-panel text-brand-text-dim"}`}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  setSelected(new Set());
                }}
                disabled={page === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={
                    p === page
                      ? "px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold bg-brand-accent-strong text-white border border-brand-accent-strong"
                      : "px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold bg-brand-panel text-brand-text-dim border border-brand-border"
                  }
                  onClick={() => {
                    setPage(p);
                    setSelected(new Set());
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold border border-brand-border ${page === totalPages ? "opacity-35 cursor-not-allowed" : "bg-brand-panel text-brand-text-dim"}`}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  setSelected(new Set());
                }}
                disabled={page === totalPages}
              >
                Next →
              </button>

              <span className="text-xs text-brand-text-muted ml-2">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, flatFiltered.length)} of{" "}
                {flatFiltered.length}
              </span>
            </div>
          )}
        </>
      )}

      {view === "form" && (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-base flex-shrink-0">
                ▥
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-brand-accent tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  {editingId ? "Edit Subcategory" : "Add Subcategory"}
                </h1>
                <p className="text-[12.8px] text-brand-text-dim">
                  {editingId
                    ? "Update this subcategory's details."
                    : "Create a new subcategory under an existing category."}
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
              ← Back
            </button>
          </div>

          {message.text && (
            <div
              className={
                message.type === "error"
                  ? "bg-brand-danger-bg text-brand-danger border border-brand-danger-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5"
                  : "bg-brand-success-bg text-brand-success border border-brand-success-border px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5"
              }
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4.5">
            <div className="bg-brand-panel border border-brand-border rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-sm flex-shrink-0">
                  ▥
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-white">
                    Subcategory details
                  </div>
                  <div className="text-xs text-brand-text-dim mt-0.5">
                    Parent category is required before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Parent category
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.cat_id} value={cat.cat_id}>
                        {cat.cat_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Subcategory name
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={subCatName}
                    onChange={(e) => setSubCatName(e.target.value)}
                    placeholder=""
                    className="w-full bg-brand-bg border border-brand-border-light rounded-lg px-3.5 py-2.5 text-[13.5px] text-brand-text outline-none box-border"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-brand-text-dim mb-1.5">
                    Image{" "}
                    <span className="text-brand-text-muted">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
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
                    disabled={loading}
                  >
                    {loading
                      ? "Saving…"
                      : editingId
                        ? "Save changes"
                        : "Add subcategory"}
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

            <div className="bg-brand-panel border border-brand-border rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-panel-alt text-brand-accent flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <div className="text-[15px] font-extrabold text-white">
                  Checklist
                </div>
              </div>

              {[
                {
                  done: step1Done,
                  title: "Choose parent category",
                  sub: "Required — links this subcategory to a category.",
                },
                {
                  done: step2Done,
                  title: "Name the subcategory",
                  sub: "Shown as a filter on the storefront.",
                },
                {
                  done: step1Done && step2Done,
                  title: "Ready to save",
                  sub: "Click 'Add subcategory' when done.",
                },
              ].map((item, i, arr) => (
                <div key={i}>
                  <div className="flex gap-3 items-start py-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${item.done ? "bg-brand-success" : "bg-brand-border-light"}`}
                    />
                    <div>
                      <div className="text-[13px] font-bold text-brand-text">
                        {item.title}
                      </div>
                      <div className="text-[11.8px] text-brand-text-dim mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-px bg-brand-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
