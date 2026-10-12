// Green for success, red for a failure. Shows nothing when there is no message.
function Notice({ message, type = "success", className = "" }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`px-4 py-2.5 rounded-lg text-xs font-semibold mb-4.5 border ${
        isError
          ? "bg-[#2a1414] text-[#f87171] border-[#4a1d1d]"
          : "bg-[#0f2a1c] text-[#4ade80] border-[#17422c]"
      } ${className}`}
    >
      {message}
    </div>
  );
}

export default Notice;
