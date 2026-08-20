import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "../assets/css/SubCategory.css";

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
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/subcategories");
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
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catId) return toast("Please select a parent category.", "error");
    if (!subCatName.trim())
      return toast("Subcategory name is required.", "error");

    const formData = new FormData();
    formData.append("cat_id", catId);
    formData.append("sub_cat_name", subCatName.trim());
    if (imageFile) formData.append("image", imageFile);

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/subcategories/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast("Subcategory updated.");
      } else {
        await axios.post("http://localhost:5000/api/subcategories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast("Subcategory added.");
      }
      resetForm();
      await fetchSubCategories();
      setView("list");
    } catch {
      toast("Something went wrong.", "error");
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
      await axios.delete(`http://localhost:5000/api/subcategories/${id}`);
      toast("Subcategory deleted.");
      fetchSubCategories();
    } catch {
      toast("Failed to delete.", "error");
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
        [...selected].map((id) =>
          axios.delete(`http://localhost:5000/api/subcategories/${id}`),
        ),
      );
      toast(
        `${selected.size} subcategori${selected.size > 1 ? "es" : ""} deleted.`,
      );
      setSelected(new Set());
      fetchSubCategories();
    } catch {
      toast("Some deletes failed.", "error");
    }
  };

  const step1Done = !!catId;
  const step2Done = subCatName.trim().length > 0;

  return (
    <div className="page min-h-screen p-7 font-sans">
      {view === "list" && (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="header-icon w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                ▥
              </div>
              <div>
                <div className="kicker text-[10.5px] font-extrabold tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  Subcategories
                </h1>
                <p className="sub-text text-[12.8px]">
                  {subCategories.length} subcategories · {categoryNames.length}{" "}
                  categories
                </p>
              </div>
            </div>
            <button
              className="btn-primary px-4.5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap"
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
              className={`${message.type === "error" ? "toast-error" : "toast"} px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2.5 items-center mb-3.5 flex-wrap">
            <div className="search-wrap flex items-center gap-2 flex-1 min-w-[180px] rounded-lg px-3 py-2.5">
              <span className="search-icon text-lg">⌕</span>
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#e7e9ee]"
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
                  className="clear-btn text-xs"
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
              className="select rounded-lg px-3 py-2.5 text-[12.5px] cursor-pointer outline-none"
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
              className="select rounded-lg px-3 py-2.5 text-[12.5px] cursor-pointer outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort: A → Z</option>
              <option value="count">Sort: Most items</option>
            </select>

            <button
              className="btn-ghost px-3.5 py-2 rounded-lg text-[12.5px] font-semibold whitespace-nowrap"
              onClick={handleExpandCollapseAll}
            >
              {allCollapsed ? "▸ Expand all" : "▾ Collapse all"}
            </button>
          </div>

          {selected.size > 0 && (
            <div className="bulk-bar flex items-center gap-2.5 rounded-lg px-4 py-2.5 mb-3.5">
              <span className="text-sm font-bold text-[#e7e9ee] flex-1">
                {selected.size} selected
              </span>
              <button
                className="btn-danger px-3.5 py-2 rounded-lg text-[12.5px] font-bold"
                onClick={handleBulkDelete}
              >
                Delete selected
              </button>
              <button
                className="btn-ghost px-3.5 py-2 rounded-lg text-[12.5px] font-semibold"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </button>
            </div>
          )}

          {pagedGrouped.length === 0 ? (
            <div className="empty-state text-center py-12 text-sm">
              {search || filterCat
                ? "No results found."
                : "No subcategories yet — add your first one."}
            </div>
          ) : (
            pagedGrouped.map(([catName, subs]) => (
              <div
                key={catName}
                className="group rounded-xl mb-3.5 overflow-hidden"
              >
                <div
                  className="group-header flex items-center justify-between px-4.5 py-3.5 cursor-pointer select-none"
                  onClick={() => toggleCollapse(catName)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="chevron text-[13px] w-3.5">
                      {isOpen(catName) ? "▾" : "▸"}
                    </span>
                    <span className="text-[13.5px] font-extrabold text-[#e7e9ee]">
                      {catName}
                    </span>
                    <span className="group-badge text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {subs.length}
                    </span>
                  </div>
                </div>

                {isOpen(catName) && (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="th text-left font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5 w-8">
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
                            className="checkbox w-3.5 h-3.5 cursor-pointer"
                          />
                        </th>
                        <th className="th text-left font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5">
                          Subcategory
                        </th>
                        <th className="th text-right font-bold text-[10.5px] uppercase tracking-wide px-4.5 py-2.5">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((sub) => (
                        <tr
                          key={sub.sub_cat_id}
                          className={`tr ${selected.has(sub.sub_cat_id) ? "tr-selected" : ""}`}
                        >
                          <td className="px-4.5 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(sub.sub_cat_id)}
                              onChange={() => toggleOne(sub.sub_cat_id)}
                              className="checkbox w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="px-4.5 py-3 font-semibold text-[#e7e9ee]">
                            <span className="sub-dot inline-block w-1.5 h-1.5 rounded-full mr-2.5 align-middle" />
                            {sub.sub_cat_name}
                            <span className="id-tag ml-2.5 text-[10.5px] font-medium">
                              #{sub.sub_cat_id}
                            </span>
                          </td>
                          <td className="px-4.5 py-3 text-right">
                            <button
                              onClick={() => handleEditClick(sub)}
                              className="edit-link font-bold text-[12.5px] mr-3.5"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sub.sub_cat_id)}
                              className="delete-link font-bold text-[12.5px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex gap-1.5 items-center justify-center mt-5 flex-wrap">
              <button
                className={`page-btn ${page === 1 ? "page-btn-disabled" : ""} px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold`}
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
                  className={`${p === page ? "page-btn-active" : "page-btn"} px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold`}
                  onClick={() => {
                    setPage(p);
                    setSelected(new Set());
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                className={`page-btn ${page === totalPages ? "page-btn-disabled" : ""} px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold`}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  setSelected(new Set());
                }}
                disabled={page === totalPages}
              >
                Next →
              </button>

              <span className="page-info text-xs ml-2">
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
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3.5">
              <div className="header-icon w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                ▥
              </div>
              <div>
                <div className="kicker text-[10.5px] font-extrabold tracking-wide mb-1">
                  CATALOG
                </div>
                <h1 className="text-2xl font-extrabold mb-1 -tracking-wide">
                  {editingId ? "Edit Subcategory" : "Add Subcategory"}
                </h1>
                <p className="sub-text text-[12.8px]">
                  {editingId
                    ? "Update this subcategory's details."
                    : "Create a new subcategory under an existing category."}
                </p>
              </div>
            </div>
            <button
              className="btn-secondary px-4.5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap"
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
              className={`${message.type === "error" ? "toast-error" : "toast"} px-4 py-2.5 rounded-lg text-[12.8px] font-semibold mb-4.5`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-[1.6fr_1fr] gap-4.5">
            <div className="card rounded-2xl p-6">
              <div className="card-head flex gap-3 mb-5 items-start">
                <div className="card-head-icon w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                  ▥
                </div>
                <div>
                  <div className="card-title text-[15px] font-extrabold">
                    Subcategory details
                  </div>
                  <div className="card-sub text-xs mt-0.5">
                    Parent category is required before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-[#c7cbd4] mb-1.5">
                    Parent category
                  </label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="input w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none box-border"
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
                  <label className="block text-[12.5px] font-semibold text-[#c7cbd4] mb-1.5">
                    Subcategory name
                  </label>
                  <input
                    type="text"
                    value={subCatName}
                    onChange={(e) => setSubCatName(e.target.value)}
                    placeholder=""
                    className="input w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none box-border"
                  />
                </div>

                <div className="mb-4.5">
                  <label className="block text-[12.5px] font-semibold text-[#c7cbd4] mb-1.5">
                    Image <span className="text-[#6b7280]">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-[12.5px] text-[#9aa2b1]"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="preview-img block mt-3 w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="flex gap-2.5 mt-1.5">
                  <button
                    type="submit"
                    className="btn-primary px-4.5 py-2.5 rounded-lg text-sm font-bold"
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
                    className="btn-secondary px-4.5 py-2.5 rounded-lg text-sm font-bold"
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

            <div className="card rounded-2xl p-6">
              <div className="card-head flex gap-3 mb-5 items-start">
                <div className="card-head-icon w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                  ✓
                </div>
                <div className="card-title text-[15px] font-extrabold">
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
                      className={`dot ${item.done ? "dot-done" : "dot-pending"} w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0`}
                    />
                    <div>
                      <div className="check-title text-[13px] font-bold">
                        {item.title}
                      </div>
                      <div className="check-sub text-[11.8px] mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="divider h-px" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
