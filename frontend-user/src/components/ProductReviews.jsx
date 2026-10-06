import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, BadgeCheck } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const MAX_TEXT = 1000;

function Stars({ value, size = 16 }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(value)
              ? "text-[#eab308] fill-[#eab308]"
              : "text-gray-300 dark:text-[#2a3042]"
          }
        />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className="bg-transparent border-none cursor-pointer p-0.5"
        >
          <Star
            size={28}
            className={
              n <= shown
                ? "text-[#eab308] fill-[#eab308]"
                : "text-gray-300 dark:text-[#2a3042]"
            }
          />
        </button>
      ))}
    </div>
  );
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function ProductReviews({ productId }) {
  const { user, checked } = useAuth();

  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [myReview, setMyReview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = useCallback(
    async (pageToLoad, append) => {
      try {
        const res = await api.get(`/api/reviews/product/${productId}`, {
          params: { page: pageToLoad },
        });
        setSummary({
          average: res.data.average,
          count: res.data.count,
          breakdown: res.data.breakdown,
        });
        setReviews((prev) =>
          append ? [...prev, ...res.data.reviews] : res.data.reviews,
        );
        setPage(res.data.page);
        setHasMore(res.data.has_more);
        setLoadError("");
      } catch (err) {
        console.error(err);
        setLoadError("Could not load reviews. Please try again later.");
      }
    },
    [productId],
  );

  const loadMine = useCallback(async () => {
    try {
      const res = await api.get(`/api/reviews/mine/${productId}`);
      setMyReview(res.data.review);
    } catch (err) {
      console.error(err);
    }
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadReviews(1, false).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadReviews]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) loadMine();
    else setMyReview(null);
  }, [user, loadMine]);

  const showMore = async () => {
    setLoadingMore(true);
    await loadReviews(page + 1, true);
    setLoadingMore(false);
  };

  const startEdit = () => {
    setRating(myReview.rating);
    setText(myReview.review || "");
    setFormError("");
    setNotice("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setRating(0);
    setText("");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setFormError("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      if (myReview) {
        await api.put(`/api/reviews/${myReview.review_id}`, {
          rating,
          review: text,
        });
        setNotice("Your review was updated.");
      } else {
        await api.post("/api/reviews", {
          product_id: productId,
          rating,
          review: text,
        });
        setNotice("Thanks! Your review was submitted.");
      }
      setEditing(false);
      setRating(0);
      setText("");
      await Promise.all([loadReviews(1, false), loadMine()]);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Could not save your review. Try again.",
      );

      if (err.response?.status === 409) loadMine();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/api/reviews/${myReview.review_id}`);
      setMyReview(null);
      setNotice("Your review was deleted.");
      await loadReviews(1, false);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Could not delete your review.",
      );
    }
  };

  const showForm = user && (!myReview || editing);

  return (
    <section className="mt-16 pt-10 border-t border-gray-200 dark:border-[#1a1f2e]">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-6">
        Customer Reviews
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-[#4a5568]">
          Loading reviews...
        </p>
      ) : loadError ? (
        <p className="text-sm text-red-500">{loadError}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
          <div>
            {summary.count > 0 ? (
              <>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-[#f0f2f7] leading-none">
                    {summary.average}
                  </span>
                  <div className="pb-1">
                    <Stars value={summary.average} />
                    <p className="text-xs text-gray-500 dark:text-[#6b7585] mt-1">
                      {summary.count} review{summary.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const pct = Math.round(
                      (summary.breakdown[n] / summary.count) * 100,
                    );
                    return (
                      <div
                        key={n}
                        className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#6b7585]"
                      >
                        <span className="w-6">{n} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-[#1a1f2e] overflow-hidden">
                          <div
                            className="h-full bg-[#eab308]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-[#6b7585]">
                No reviews yet. Be the first to review this product.
              </p>
            )}
          </div>

          <div>
            {notice && (
              <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-semibold bg-green-50 dark:bg-[#0f2a1c] text-green-700 dark:text-[#4ade80] border border-green-200 dark:border-[#17422c]">
                {notice}
              </div>
            )}

            {checked && !user && (
              <div className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-[#1a1f2e] bg-gray-50 dark:bg-[#0e1117] text-sm text-gray-600 dark:text-[#9aa2b1]">
                <Link
                  to="/login"
                  state={{ from: `/product/${productId}` }}
                  className="text-[#4f8ef7] font-bold no-underline"
                >
                  Log in
                </Link>{" "}
                to write a review.
              </div>
            )}

            {user && myReview && !editing && (
              <div className="mb-6 p-4 rounded-xl border border-[#4f8ef7]/40 bg-[#4f8ef7]/5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-[#f0f2f7]">
                    Your review
                  </span>
                  <span className="flex gap-3 text-xs font-bold">
                    <button
                      type="button"
                      onClick={startEdit}
                      className="text-[#4f8ef7] bg-transparent border-none cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-red-500 bg-transparent border-none cursor-pointer"
                    >
                      Delete
                    </button>
                  </span>
                </div>
                <Stars value={myReview.rating} />
                {myReview.review && (
                  <p className="text-sm text-gray-600 dark:text-[#9aa2b1] mt-2 whitespace-pre-line break-words">
                    {myReview.review}
                  </p>
                )}
              </div>
            )}

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-8 p-5 rounded-xl border border-gray-200 dark:border-[#1a1f2e] bg-gray-50 dark:bg-[#0e1117]"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#f0f2f7] mb-3">
                  {myReview ? "Edit your review" : "Write a review"}
                </h3>
                <StarPicker value={rating} onChange={setRating} />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={MAX_TEXT}
                  rows={4}
                  placeholder="Share what you liked or didn't like (optional)"
                  className="w-full mt-3 p-3 rounded-lg text-sm bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7] resize-y box-border"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400 dark:text-[#4a5568]">
                  <span>
                    {text.length}/{MAX_TEXT}
                  </span>
                </div>
                {formError && (
                  <p className="text-sm text-red-500 mt-2" role="alert">
                    {formError}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#4f8ef7] hover:bg-[#3d7de6] disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-lg border-none cursor-pointer"
                  >
                    {submitting
                      ? "Saving..."
                      : myReview
                        ? "Save changes"
                        : "Submit review"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm font-bold px-5 py-2.5 rounded-lg border border-gray-200 dark:border-[#1a1f2e] bg-transparent text-gray-600 dark:text-[#9aa2b1] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {formError && !showForm && (
              <p className="text-sm text-red-500 mb-4" role="alert">
                {formError}
              </p>
            )}

            <div className="flex flex-col gap-5">
              {reviews.map((r) => (
                <article
                  key={r.review_id}
                  className="pb-5 border-b border-gray-200 dark:border-[#1a1f2e] last:border-b-0"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                    <Stars value={r.rating} size={14} />
                    <span className="text-sm font-bold text-gray-900 dark:text-[#f0f2f7]">
                      {r.name}
                    </span>
                    {r.verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-[#4ade80]">
                        <BadgeCheck size={14} />
                        Verified purchase
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-[#4a5568]">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  {r.review && (
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-[#9aa2b1] whitespace-pre-line break-words">
                      {r.review}
                    </p>
                  )}
                </article>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={showMore}
                disabled={loadingMore}
                className="mt-6 text-sm font-bold px-5 py-2.5 rounded-lg border border-gray-200 dark:border-[#1a1f2e] bg-transparent text-gray-700 dark:text-[#f0f2f7] hover:border-[#4f8ef7] cursor-pointer disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Show more reviews"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductReviews;
