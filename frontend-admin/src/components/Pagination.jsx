const PAGE_SIZES = [10, 25, 50];

const pageWindow = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const wanted = [1, totalPages, page - 1, page, page + 1].filter(
    (p) => p >= 1 && p <= totalPages,
  );
  const sorted = [...new Set(wanted)].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push({ gap: p });
    out.push(p);
  });
  return out;
};

const btn =
  "min-w-8 h-8 px-2.5 rounded-lg text-[12.5px] font-semibold border cursor-pointer transition-colors";
const btnIdle =
  "bg-[#111623] text-[#9aa2b1] border-[#1e2432] hover:border-[#3b6ee8] hover:text-[#e7e9ee]";
const btnActive = "bg-[#1b2436] text-[#5b8cff] border-[#2c3a55]";
const btnOff = "opacity-35 cursor-not-allowed";

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className = "",
}) {
  // Nothing to page through
  if (!total || total <= PAGE_SIZES[0]) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#1e2432] ${className}`}
    >
      <div className="flex items-center gap-3 text-xs text-[#8a92a3]">
        <span>
          Showing {from}–{to} of {total}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#0b0e14] border border-[#262c3a] rounded-lg px-2 py-1 text-xs text-[#e7e9ee] outline-none cursor-pointer"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`${btn} ${btnIdle} ${page <= 1 ? btnOff : ""}`}
        >
          ← Prev
        </button>

        <span className="sm:hidden text-xs text-[#9aa2b1] px-2">
          Page {page} of {totalPages}
        </span>

        <div className="hidden sm:flex items-center gap-1.5">
          {pageWindow(page, totalPages).map((p) =>
            typeof p === "object" ? (
              <span key={`gap-${p.gap}`} className="px-1 text-[#565d6b]">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`${btn} ${p === page ? btnActive : btnIdle}`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${btn} ${btnIdle} ${page >= totalPages ? btnOff : ""}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;
