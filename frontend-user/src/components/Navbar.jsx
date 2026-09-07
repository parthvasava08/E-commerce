import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  User,
  X,
  Heart,
  LogOut,
  Package,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import api from "../api/axiosInstance";

function Navbar() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      api
        .get("/api/cart")
        .then((res) => setCartCount(res.data.length))
        .catch(() => setCartCount(0));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartCount(0);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setCartCount(0);
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/products?search=${search}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#080a0f] backdrop-blur border-b border-gray-200 dark:border-[#1a1f2e]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold text-sm">
            K
          </div>
          <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold text-lg tracking-widest">
            KOREX
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2 gap-2 focus-within:border-[#4f8ef7] transition-colors">
            <Search
              size={15}
              className="text-gray-400 dark:text-[#4a5568] flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent outline-none text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="bg-transparent border-none cursor-pointer text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] flex items-center justify-center text-gray-500 dark:text-[#9aa2b1] no-underline hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors"
          >
            <Heart size={16} />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] flex items-center justify-center text-gray-500 dark:text-[#9aa2b1] no-underline hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors relative"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4f8ef7] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2 text-gray-900 dark:text-[#f0f2f7] hover:border-[#4f8ef7] transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#4f8ef7] flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-xs font-semibold max-w-[80px] truncate">
                  {user.username}
                </span>
                <ChevronDown
                  size={13}
                  className="text-gray-400 dark:text-[#4a5568]"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-xl overflow-hidden shadow-xl z-50">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-500 dark:text-[#9aa2b1] no-underline hover:bg-gray-50 dark:hover:bg-[#080a0f] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-500 dark:text-[#9aa2b1] no-underline hover:bg-gray-50 dark:hover:bg-[#080a0f] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
                  >
                    <Package size={14} />
                    My Orders
                  </Link>
                  <div className="h-px bg-gray-200 dark:bg-[#1a1f2e]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#f87171] bg-transparent border-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#080a0f] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-[#4f8ef7] text-white text-xs font-bold px-4 py-2 rounded-lg no-underline hover:bg-[#3a7be8] transition-colors"
            >
              <User size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
