import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [filterRating, setFilterRating] = useState("all");

  const fetchReviews = async () => {
    try {
      const res = await api.get("/api/reviews/admin/all");
      setReviews(res.data);
      setLoadError("");
    } catch (err) {
      console.error(err);
      setLoadError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) =>
    filterRating === "all" ? true : r.rating === Number(filterRating),
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    try {
      await api.delete(`/api/reviews/admin/${id}`);
      setReviews((prev) => prev.filter((r) => r.review_id !== id));
      setIsError(false);
      setMessage("Review deleted");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.response?.data?.message || "Failed to delete review");
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : "—";

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  if (loading) {
    return (
      <div className="font-sans text-[#e7e9ee] flex items-center justify-center py-24">
        <p className="text-[7c8699] text-sm">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#e7e9ee]">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div className="flex gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#1b2436] flex items-center justify-center text-base text-[#5b8cff] flex-shrink-0">
            ★
          </div>
          <div>
            <div className="text-[10.5px] font-extrabold text-[#5b8cff] tracking-wider mb-1">
              PEOPLE
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">
              Reviews
            </h1>
            <p className="text-xs text-[#9aa2b1]">
              Moderate reviews submitted by customers.
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="bg-[#2a1414] text-[#f87171] px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border border-[#4a1d1d]">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5 max-w-[500px]">
        <div className="bg-[#111623] border border-[#1e2432] rounded-xl p-4.5">
          <div className="text-[11.5px] text-[#8a92a3] font-semibold mb-2">
            Total reviews
          </div>
          <div className="text-[22px] font-extrabold">{reviews.length}</div>
        </div>
        <div className="bg-[#111623] border border-[#1e2432] rounded-xl p-4.5">
          <div className="text-[11.5px] text-[#8a92a3] font-semibold mb-2">
            Average rating
          </div>
          <div className="text-[22px] font-extrabold text-[#eab308]">
            {avgRating}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border ${
            isError
              ? "bg-[#2a1414] text-[#f87171] border-[#4a1d1d]"
              : "bg-[#0f2a1c] text-[#4ade80] border-[#17422c]"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "5", "4", "3", "2", "1"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border ${
              filterRating === r
                ? "bg-[#1b2436] text-[#5b8cff] border-[#2c3a55]"
                : "bg-[#111623] text-[#9aa2b1] border-[#1e2432]"
            }`}
          >
            {r === "all" ? "All" : `${r} ★`}
          </button>
        ))}
      </div>

      <div className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                  Product
                </th>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                  User
                </th>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                  Rating
                </th>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                  Review
                </th>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432]">
                  Date
                </th>
                <th className="text-left text-[#6b7280] font-bold text-[10.5px] uppercase tracking-wide pb-3.5 px-2.5 border-b border-[#1e2432] !text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8.5 text-[#6b7280] text-sm"
                  >
                    {reviews.length === 0
                      ? "No reviews yet."
                      : "No reviews match this filter."}
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.review_id} className="border-b border-[#1e2432]">
                  <td className="py-3.5 px-2.5 align-middle font-semibold text-[#e7e9ee]">
                    {r.product_name}
                  </td>
                  <td className="py-3.5 px-2.5 align-middle">{r.username}</td>
                  <td className="py-3.5 px-2.5 align-middle text-[#eab308] tracking-[1px] whitespace-nowrap">
                    {renderStars(r.rating)}
                  </td>
                  <td className="py-3.5 px-2.5 align-middle text-[#9aa2b1] min-w-[200px] max-w-[280px] break-words">
                    {r.review || <span className="text-[7c8699]">No text</span>}
                  </td>
                  <td className="py-3.5 px-2.5 align-middle text-[#9aa2b1] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-2.5 align-middle text-right">
                    <button
                      onClick={() => handleDelete(r.review_id)}
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
      </div>
    </div>
  );
}

export default Reviews;
