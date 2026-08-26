function Navbar() {
  return (
    <header className="flex items-center justify-between px-7 py-4 bg-[#0b0e14] border-b border-[#1e2432]">
      <div className="flex items-center gap-2.5 bg-[#111623] border border-[#1e2432] rounded-lg px-3.5 py-2 w-80">
        <span className="text-[#6b7280] text-sm">⌕</span>
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm text-[#e7e9ee] placeholder-[#565d6b] w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-[#3b6ee8] text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
          + Add Product
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#1b2436] text-[#5b8cff] flex items-center justify-center text-xs font-bold flex-shrink-0">
          A
        </div>
      </div>
    </header>
  );
}

export default Navbar;
