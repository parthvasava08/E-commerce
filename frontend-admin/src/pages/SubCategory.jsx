import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

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
  // data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // form
  const [view, setView] = useState("list"); // "list" | "form"
  const [editingId, setEditingId] = useState(null);
  const [catId, setCatId] = useState("");
  const [subCatName, setSubCatName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(""); // category filter dropdown
  const [sortBy, setSortBy] = useState("name"); // "name" | "count"
  const [collapsed, setCollapsed] = useState({}); // catName → bool
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

  const flatFiltered = filtered; // for pagination count
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
    <div style={s.page}>
      {view === "list" && (
        <>
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>▥</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>Subcategories</h1>
                <p style={s.sub}>
                  {subCategories.length} subcategories · {categoryNames.length}{" "}
                  categories
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
              + Add Subcategory
            </button>
          </div>

          {message.text && (
            <div
              style={{
                ...s.toast,
                ...(message.type === "error" ? s.toastError : {}),
              }}
            >
              {message.text}
            </div>
          )}

          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>⌕</span>
              <input
                style={s.searchInput}
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
                  style={s.clearBtn}
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
              style={s.select}
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
              style={s.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort: A → Z</option>
              <option value="count">Sort: Most items</option>
            </select>

            <button style={s.ghostBtn} onClick={handleExpandCollapseAll}>
              {allCollapsed ? "▸ Expand all" : "▾ Collapse all"}
            </button>
          </div>

          {selected.size > 0 && (
            <div style={s.bulkBar}>
              <span style={s.bulkCount}>{selected.size} selected</span>
              <button style={s.dangerBtn} onClick={handleBulkDelete}>
                Delete selected
              </button>
              <button style={s.ghostBtn} onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          )}

          {pagedGrouped.length === 0 ? (
            <div style={s.emptyState}>
              {search || filterCat
                ? `No results found.`
                : "No subcategories yet — add your first one."}
            </div>
          ) : (
            pagedGrouped.map(([catName, subs]) => (
              <div key={catName} style={s.group}>
                <div
                  style={s.groupHeader}
                  onClick={() => toggleCollapse(catName)}
                >
                  <div style={s.groupLeft}>
                    <span style={s.chevron}>{isOpen(catName) ? "▾" : "▸"}</span>
                    <span style={s.groupName}>{catName}</span>
                    <span style={s.groupBadge}>{subs.length}</span>
                  </div>
                </div>

                {isOpen(catName) && (
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={{ ...s.th, width: 36 }}>
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
                            style={s.checkbox}
                          />
                        </th>
                        <th style={s.th}>Subcategory</th>
                        <th style={s.th}>ID</th>
                        <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((sub) => (
                        <tr
                          key={sub.sub_cat_id}
                          style={{
                            ...s.tr,
                            ...(selected.has(sub.sub_cat_id)
                              ? s.trSelected
                              : {}),
                          }}
                        >
                          <td style={s.td}>
                            <input
                              type="checkbox"
                              checked={selected.has(sub.sub_cat_id)}
                              onChange={() => toggleOne(sub.sub_cat_id)}
                              style={s.checkbox}
                            />
                          </td>
                          <td
                            style={{
                              ...s.td,
                              fontWeight: 600,
                              color: "#e7e9ee",
                            }}
                          >
                            <span style={s.subDot} />
                            {sub.sub_cat_name}
                          </td>
                          <td style={{ ...s.td, color: "#6b7280" }}>
                            #{sub.sub_cat_id}
                          </td>
                          <td style={{ ...s.td, textAlign: "right" }}>
                            <button
                              onClick={() => handleEditClick(sub)}
                              style={s.editLink}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sub.sub_cat_id)}
                              style={s.deleteLink}
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
            <div style={s.pagination}>
              <button
                style={{
                  ...s.pageBtn,
                  ...(page === 1 ? s.pageBtnDisabled : {}),
                }}
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
                  style={{
                    ...s.pageBtn,
                    ...(p === page ? s.pageBtnActive : {}),
                  }}
                  onClick={() => {
                    setPage(p);
                    setSelected(new Set());
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                style={{
                  ...s.pageBtn,
                  ...(page === totalPages ? s.pageBtnDisabled : {}),
                }}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  setSelected(new Set());
                }}
                disabled={page === totalPages}
              >
                Next →
              </button>

              <span style={s.pageInfo}>
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
          <div style={s.headerRow}>
            <div style={s.headerLeft}>
              <div style={s.headerIcon}>▥</div>
              <div>
                <div style={s.kicker}>CATALOG</div>
                <h1 style={s.h1}>
                  {editingId ? "Edit Subcategory" : "Add Subcategory"}
                </h1>
                <p style={s.sub}>
                  {editingId
                    ? "Update this subcategory's details."
                    : "Create a new subcategory under an existing category."}
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
              ← Back
            </button>
          </div>

          {message.text && (
            <div
              style={{
                ...s.toast,
                ...(message.type === "error" ? s.toastError : {}),
              }}
            >
              {message.text}
            </div>
          )}

          <div style={s.formGrid}>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardHeadIcon}>▥</div>
                <div>
                  <div style={s.cardTitle}>Subcategory details</div>
                  <div style={s.cardSub}>
                    Parent category is required before saving.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>Parent category</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    style={s.input}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.cat_id} value={cat.cat_id}>
                        {cat.cat_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Subcategory name</label>
                  <input
                    type="text"
                    value={subCatName}
                    onChange={(e) => setSubCatName(e.target.value)}
                    placeholder="e.g. Car Accessories"
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>
                    Image <span style={{ color: "#6b7280" }}>(optional)</span>
                  </label>
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
                  <button type="submit" style={s.primaryBtn} disabled={loading}>
                    {loading
                      ? "Saving…"
                      : editingId
                        ? "Save changes"
                        : "Add subcategory"}
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
                <div style={s.cardHeadIcon}>✓</div>
                <div style={s.cardTitle}>Checklist</div>
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
                  <div style={s.checkItem}>
                    <span
                      style={{
                        ...s.dot,
                        background: item.done ? "#22c55e" : "#3a3f4b",
                      }}
                    />
                    <div>
                      <div style={s.checkTitle}>{item.title}</div>
                      <div style={s.checkSub}>{item.sub}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div style={s.divider} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

//  style
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
  ghostBtn: {
    background: "none",
    color: "#9aa2b1",
    border: "1px solid #262c3a",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  dangerBtn: {
    background: "#3b1515",
    color: "#f87171",
    border: "1px solid #5a1e1e",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
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
  toastError: {
    background: "#2a0f0f",
    color: "#f87171",
    border: "1px solid #422017",
  },

  // Toolbar
  toolbar: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 180,
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 9,
    padding: "9px 12px",
  },
  searchIcon: { fontSize: 17, color: "#6b7280" },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "#e7e9ee",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: 12,
  },
  select: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 9,
    padding: "9px 12px",
    fontSize: 12.5,
    color: "#c7cbd4",
    cursor: "pointer",
    outline: "none",
  },

  // Bulk bar
  bulkBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 9,
    padding: "10px 16px",
    marginBottom: 14,
  },
  bulkCount: { fontSize: 13, fontWeight: 700, color: "#e7e9ee", flex: 1 },

  // Groups
  group: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 18px",
    cursor: "pointer",
    borderBottom: "1px solid #1e2432",
    userSelect: "none",
  },
  groupLeft: { display: "flex", alignItems: "center", gap: 10 },
  chevron: { fontSize: 13, color: "#5b8cff", width: 13 },
  groupName: { fontSize: 13.5, fontWeight: 800, color: "#e7e9ee" },
  groupBadge: {
    background: "#1b2436",
    color: "#5b8cff",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
  },

  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "10px 18px",
    borderBottom: "1px solid #1e2432",
  },
  tr: { borderBottom: "1px solid #1e2432" },
  trSelected: { background: "#131a2e" },
  td: { padding: "11px 18px", verticalAlign: "middle" },
  subDot: {
    display: "inline-block",
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#5b8cff",
    marginRight: 9,
    verticalAlign: "middle",
  },
  checkbox: {
    cursor: "pointer",
    accentColor: "#3b6ee8",
    width: 14,
    height: 14,
  },
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
    padding: "48px 0",
    color: "#6b7280",
    fontSize: 13,
  },

  // Pagination
  pagination: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  pageBtn: {
    background: "#111623",
    color: "#c7cbd4",
    border: "1px solid #1e2432",
    padding: "7px 13px",
    borderRadius: 8,
    fontSize: 12.5,
    cursor: "pointer",
    fontWeight: 600,
  },
  pageBtnActive: {
    background: "#3b6ee8",
    color: "#fff",
    border: "1px solid #3b6ee8",
  },
  pageBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  pageInfo: { fontSize: 12, color: "#6b7280", marginLeft: 8 },

  // Form
  formGrid: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 },
  card: {
    background: "#111623",
    border: "1px solid #1e2432",
    borderRadius: 14,
    padding: 24,
  },
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
};
