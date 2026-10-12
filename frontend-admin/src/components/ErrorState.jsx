function ErrorState({
  message = "Something went wrong.",
  onRetry,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`bg-[#111623] border border-[#2a1f1f] rounded-2xl p-8 text-center ${className}`}
    >
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#2a1414] text-[#f87171] flex items-center justify-center text-lg font-bold">
        !
      </div>
      <p className="text-sm font-semibold text-[#e7e9ee] mb-1">
        This page could not load
      </p>
      <p className="text-xs text-[#9aa2b1] mb-4 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-[#3b6ee8] text-white px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none hover:bg-[#2d5fd4] transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
