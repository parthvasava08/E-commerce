import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const emptyForm = {
  coupon_code: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_amount: "",
  expiry_date: "",
  status: "active",
};

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/api/coupons");
      setCoupons(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCoupons(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.coupon_code.trim() || !form.discount_value) {
      setMessage("Coupon code and discount value are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/coupons/${editingId}`, form);
        setMessage("Coupon updated successfully");
      } else {
        await api.post("/api/coupons", form);
        setMessage("Coupon added successfully");
      }
      resetForm();
      fetchCoupons();
      setView("list");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon.coupon_id);
    setForm({
      coupon_code: coupon.coupon_code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount,
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split("T")[0] : "",
      status: coupon.status,
    });
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon? This cannot be undone.")) return;
    try {
      await api.delete(`/api/coupons/${id}`);
      setMessage("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      setMessage("Failed to delete coupon");
      console.error(error);
    }
  };

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

  return (
    <div className="font-sans text-[#e7e9ee]">
      {view === "list" ? (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ◍
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  SALES
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  Coupons
                </h1>
                <p className="text-xs text-[#9aa2b1]">
                  Manage discount codes applied at checkout.
                </p>
              </div>
            </div>
            <button
              className="bg-[#3b6ee8] text-white px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap border-none"
              onClick={() => {
                resetForm();
                setView("form");
              }}
            >
              + Add Coupon
            </button>
          </div>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border border-[#17422c]">
              {message}
            </div>
          )}

          <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[13px] whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Code
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Discount
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Min. Order
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Expires
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                      Status
                    </th>
                    <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8.5 text-[#6b7280] text-sm"
                      >
                        No coupons yet — add your first one above.
                      </td>
                    </tr>
                  )}
                  {coupons.map((c) => {
                    const expired = isExpired(c.expiry_date);
                    return (
                      <tr
                        key={c.coupon_id}
                        className="border-b border-[#1e2432]"
                      >
                        <td className="py-3.5 px-2.5 align-middle font-bold font-mono">
                          {c.coupon_code}
                        </td>
                        <td className="py-3.5 px-2.5 align-middle">
                          {c.discount_type === "percentage"
                            ? `${c.discount_value}%`
                            : `₹${c.discount_value}`}
                        </td>
                        <td className="py-3.5 px-2.5 align-middle">
                          ₹{c.minimum_amount}
                        </td>
                        <td
                          className={`py-3.5 px-2.5 align-middle ${
                            expired ? "text-[#f87171]" : "text-[#9aa2b1]"
                          }`}
                        >
                          {c.expiry_date ? c.expiry_date.split("T")[0] : "—"}{" "}
                          {expired && "(expired)"}
                        </td>
                        <td className="py-3.5 px-2.5 align-middle">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                              c.status === "active" && !expired
                                ? "bg-[#0f2a1c] text-[#4ade80]"
                                : "bg-[#2a1414] text-[#f87171]"
                            }`}
                          >
                            {expired ? "expired" : c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2.5 align-middle text-right">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="text-[#5b8cff] font-bold text-xs mr-4 cursor-pointer bg-transparent border-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.coupon_id)}
                            className="text-[#f87171] font-bold text-xs cursor-pointer bg-transparent border-none"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
                ◍
              </div>
              <div>
                <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
                  SALES
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                  {editingId ? "Edit Coupon" : "Add Coupon"}
                </h1>
                <p className="text-xs text-[#9aa2b1]">
                  {editingId
                    ? "Update this coupon's rules."
                    : "Create a new discount code."}
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
              ← Back to Coupons
            </button>
          </div>

          {message && (
            <div className="bg-[#0f2a1c] text-[#4ade80] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border border-[#17422c]">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4.5">
            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                  ◍
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                    Coupon Rules
                  </div>
                  <div className="text-xs text-[#8a92a3] mt-0.5">
                    Code and discount value are required.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4.5">
                  <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                    Coupon code
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={form.coupon_code}
                    onChange={(e) =>
                      handleChange("coupon_code", e.target.value.toUpperCase())
                    }
                    className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4.5">
                    <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                      Discount type
                    </label>
                    <select
                      value={form.discount_type}
                      onChange={(e) =>
                        handleChange("discount_type", e.target.value)
                      }
                      className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat amount</option>
                    </select>
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                      Discount value{" "}
                      {form.discount_type === "percentage" ? "(%)" : "(₹)"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.discount_value}
                      onChange={(e) =>
                        handleChange("discount_value", e.target.value)
                      }
                      className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4.5">
                    <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                      Minimum order amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.minimum_amount}
                      onChange={(e) =>
                        handleChange("minimum_amount", e.target.value)
                      }
                      className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                      Expiry date
                    </label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) =>
                        handleChange("expiry_date", e.target.value)
                      }
                      className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="block text-xs font-semibold text-[#c7cbd4] mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#262c3a] rounded-lg px-3.5 py-2.5 text-sm text-[#e7e9ee] outline-none focus:border-[#5b8cff]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-1.5">
                  <button
                    type="submit"
                    className="bg-[#3b6ee8] text-white px-4.5 py-2.5 rounded-lg text-sm font-bold cursor-pointer whitespace-nowrap border-none"
                  >
                    {editingId ? "Save Changes" : "Add Coupon"}
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

            <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3 mb-5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#1b2436] flex items-center justify-center text-sm text-[#5b8cff] flex-shrink-0">
                  ☰
                </div>
                <div className="text-[15px] font-extrabold text-[#f1f2f6]">
                  How this applies at checkout
                </div>
              </div>
              <div className="flex gap-3 items-start py-3">
                <span className="w-[9px] h-[9px] rounded-full mt-1.5 flex-shrink-0 bg-[#22c55e]" />
                <div>
                  <div className="text-[13px] font-bold text-[#e7e9ee]">
                    Code entered
                  </div>
                  <div className="text-xs text-[#8a92a3] mt-0.5">
                    Customer types the code at checkout.
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#1e2432]" />
              <div className="flex gap-3 items-start py-3">
                <span className="w-[9px] h-[9px] rounded-full mt-1.5 flex-shrink-0 bg-[#3b82f6]" />
                <div>
                  <div className="text-[13px] font-bold text-[#e7e9ee]">
                    Rules checked
                  </div>
                  <div className="text-xs text-[#8a92a3] mt-0.5">
                    Active status, not expired, cart meets minimum amount.
                  </div>
                </div>
              </div>
              <div className="h-px bg-[#1e2432]" />
              <div className="flex gap-3 items-start py-3">
                <span className="w-[9px] h-[9px] rounded-full mt-1.5 flex-shrink-0 bg-[#eab308]" />
                <div>
                  <div className="text-[13px] font-bold text-[#e7e9ee]">
                    Discount applied
                  </div>
                  <div className="text-xs text-[#8a92a3] mt-0.5">
                    Reduces the order total before payment.
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

export default Coupons;
