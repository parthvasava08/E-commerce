export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#1b2232] ${className}`}
    />
  );
}

export function SkeletonRows({ rows = 6, cols = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="border-b border-[#1e2432]" aria-hidden="true">
      {Array.from({ length: cols }).map((_, c) => (
        <td key={c} className="py-3.5 px-2.5">
          <Skeleton
            className={`h-3.5 ${c === 0 ? "w-24" : "w-full max-w-[140px]"}`}
          />
        </td>
      ))}
    </tr>
  ));
}

export function TableSkeleton({ rows = 6, cols = 5, label = "Loading..." }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="bg-[#111623] border border-[#1e2432] rounded-2xl p-4 sm:p-6"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} className="pb-3.5 px-2.5 border-b border-[#1e2432]">
                  <Skeleton className="h-2.5 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonRows rows={rows} cols={cols} />
          </tbody>
        </table>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex gap-3.5 mb-6" aria-hidden="true">
      <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-${count} gap-4 mb-5`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#111623] border border-[#1e2432] rounded-xl p-4.5"
        >
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-6 w-28" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
