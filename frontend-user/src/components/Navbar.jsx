import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [search, setSearch] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-[#080a0f]/95 backdrop-blur border-b border-[#1a1f2e]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 no-underline flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold text-sm">
            K
          </div>
          <span className="text-[#f0f2f7] font-extrabold text-lg tracking-widest">
            KOREX
          </span>
        </Link>

        <div className="flex-1 max-w-xl">
          <div className="flex items-center bg-[#0e1117] border border-[#1a1f2e] rounded-lg px-3.5 py-2 gap-2 focus-within:border-[#4f8ef7] transition-colors">
            <span className="text-[#4a5568] text-base">⌕</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-[#f0f2f7] placeholder-[#4a5568] w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/cart"
            className="w-9 h-9 rounded-lg bg-[#0e1117] border border-[#1a1f2e] flex items-center justify-center text-[#f0f2f7] no-underline hover:border-[#4f8ef7] transition-colors relative"
          >
            🛒
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4f8ef7] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              0
            </span>
          </Link>

          <Link
            to="/login"
            className="bg-[#4f8ef7] text-white text-xs font-bold px-4 py-2 rounded-lg no-underline hover:bg-[#3a7be8] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
