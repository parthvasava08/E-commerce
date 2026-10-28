/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Menu,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import api from "../api/axiosInstance";

function Navbar() {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [params] = useSearchParams();
  const activeCat = params.get("category");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const load = () =>
      api
        .get("/api/cart")
        .then((res) => setCartCount(res.data.length))
        .catch(() => setCartCount(0));
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setCartCount(0);
    navigate("/");
  };

  const runSearch = () => {
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") runSearch();
  };

  const catLinkCls = (active) =>
    `shrink-0 whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold no-underline border-b-2 transition-colors ${
      active
        ? "text-[#4f8ef7] border-[#4f8ef7]"
        : "text-gray-600 dark:text-gray-300 border-transparent hover:text-[#4f8ef7]"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#080a0f] border-b border-gray-200 dark:border-[#1a1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
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

          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="flex items-center w-full bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2 gap-2 focus-within:border-[#4f8ef7] transition-colors">
              <button
                onClick={runSearch}
                aria-label="Search"
                className="bg-transparent border-none p-0 cursor-pointer flex-shrink-0 flex items-center"
              >
                <Search
                  size={15}
                  className="text-gray-400 dark:text-[#4a5568]"
                />
              </button>
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

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />

            <Link
              to="/wishlist"
              className="hidden sm:flex w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] items-center justify-center text-gray-500 dark:text-[#9aa2b1] no-underline hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors"
            >
              <Heart size={16} />
            </Link>

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

            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2 text-gray-900 dark:text-[#f0f2f7] hover:border-[#4f8ef7] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#4f8ef7] flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden lg:block">
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
                className="hidden sm:flex items-center gap-1.5 bg-[#4f8ef7] text-white text-xs font-bold px-4 py-2 rounded-lg no-underline hover:bg-[#3a7be8] transition-colors"
              >
                <User size={13} />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] text-gray-500 dark:text-[#9aa2b1] cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile search bar (scrolls away) */}
      <div className="md:hidden px-4 py-3 bg-white dark:bg-[#080a0f]">
        <div className="flex items-center bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2 gap-2 focus-within:border-[#4f8ef7] transition-colors">
          <button
            onClick={runSearch}
            aria-label="Search"
            className="bg-transparent border-none p-0 cursor-pointer flex-shrink-0 flex items-center"
          >
            <Search size={15} className="text-gray-400 dark:text-[#4a5568]" />
          </button>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent outline-none text-sm text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] w-full"
          />
        </div>
      </div>

      {/* Category bar: sticky under the top row on desktop only */}
      <div className="md:sticky md:top-[65px] z-40 border-t border-b border-gray-200 dark:border-[#1a1f2e] bg-gray-50 dark:bg-[#0e1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto [scrollbar-width:none]">
          <Link to="/products" className={catLinkCls(!activeCat)}>
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.cat_id}
              to={`/products?category=${cat.cat_id}`}
              className={catLinkCls(String(activeCat) === String(cat.cat_id))}
            >
              {cat.cat_name}
            </Link>
          ))}
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-72 h-full bg-white dark:bg-[#0e1117] border-l border-gray-200 dark:border-[#1a1f2e] p-6 flex flex-col gap-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="self-end w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] text-gray-500 dark:text-[#9aa2b1] cursor-pointer"
            >
              <X size={18} />
            </button>
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-[#1a1f2e]">
                  <div className="w-10 h-10 rounded-full bg-[#4f8ef7] flex items-center justify-center text-white font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-[#f0f2f7]">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-[#4a5568]">
                      Logged in
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-2"
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-2"
                >
                  <Package size={16} />
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-2"
                >
                  <Heart size={16} />
                  Wishlist
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#4f8ef7] text-white font-bold px-4 py-3 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
              >
                <User size={15} />
                Sign In
              </Link>
            )}

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#1a1f2e] flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-1"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-1"
              >
                All Products
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-[#9aa2b1] no-underline text-sm font-semibold py-1"
              >
                Contact
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[#f87171] bg-transparent border-none cursor-pointer text-sm font-semibold py-1 mt-2"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
