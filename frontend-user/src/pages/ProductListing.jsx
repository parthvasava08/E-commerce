/* eslint-disable react-hooks/static-components */
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal } from "lucide-react";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";

function ProductListing() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/categories"),
          api.get("/api/brands"),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
        const prices = productsRes.data.map((p) =>
          Number(p.discount_price || p.price),
        );
        const max = Math.max(...prices, 100000);
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          p.Category?.cat_name?.toLowerCase().includes(q) ||
          p.Brand?.brand_name?.toLowerCase().includes(q),
      );
    }
    if (selectedCategory)
      list = list.filter((p) => String(p.cat_id) === String(selectedCategory));
    if (selectedBrand)
      list = list.filter((p) => String(p.brand_id) === String(selectedBrand));
    list = list.filter((p) => {
      const price = Number(p.discount_price || p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (sortBy === "price_asc")
      list.sort(
        (a, b) =>
          Number(a.discount_price || a.price) -
          Number(b.discount_price || b.price),
      );
    else if (sortBy === "price_desc")
      list.sort(
        (a, b) =>
          Number(b.discount_price || b.price) -
          Number(a.discount_price || a.price),
      );
    else if (sortBy === "name_asc")
      list.sort((a, b) => a.product_name.localeCompare(b.product_name));
    else if (sortBy === "newest")
      list.sort((a, b) => b.product_id - a.product_id);
    return list;
  }, [products, search, selectedCategory, selectedBrand, sortBy, priceRange]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSortBy("default");
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters =
    search ||
    selectedCategory ||
    selectedBrand ||
    sortBy !== "default" ||
    priceRange[1] < maxPrice;

  const labelCls =
    "block text-[10.5px] font-bold text-gray-400 dark:text-[#4a5568] uppercase tracking-widest mb-2";
  const selectCls =
    "w-full bg-gray-50 dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2.5 text-[13px] text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7] cursor-pointer";

  const FilterPanel = () => (
    <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[14px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-[#4f8ef7] bg-transparent border-none cursor-pointer hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="mb-5">
        <label className={labelCls}>Search</label>
        <div className="flex items-center bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2.5 gap-2 focus-within:border-[#4f8ef7] transition-colors">
          <Search
            size={14}
            className="text-gray-400 dark:text-[#4a5568] flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-[13px] text-gray-900 dark:text-[#f0f2f7] placeholder-gray-400 dark:placeholder-[#4a5568] w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 dark:text-[#4a5568] text-xs bg-transparent border-none cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-5">
        <label className={labelCls}>Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={selectCls}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.cat_id} value={c.cat_id}>
              {c.cat_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className={labelCls}>Brand</label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className={selectCls}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.brand_id} value={b.brand_id}>
              {b.brand_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className={labelCls}>Price Range</label>
        <div className="flex items-center justify-between text-[12px] text-gray-500 dark:text-[#9aa2b1] mb-2">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={100}
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
          className="w-full accent-[#4f8ef7] cursor-pointer"
        />
      </div>

      <div>
        <label className={labelCls}>Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={selectCls}
        >
          <option value="default">Default</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
            Store
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
            All Products
          </h1>
          <p className="text-gray-400 dark:text-[#4a5568] text-sm mt-1">
            {loading
              ? "Loading..."
              : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden flex items-center gap-2 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2 text-sm font-bold text-gray-700 dark:text-[#9aa2b1] cursor-pointer"
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#4f8ef7]" />
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="lg:hidden mb-6">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-7">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl aspect-square animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-gray-900 dark:text-[#f0f2f7] font-bold text-lg mb-2">
                No products found
              </h3>
              <p className="text-gray-400 dark:text-[#4a5568] text-sm mb-5">
                Try adjusting your filters
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#4f8ef7] text-white text-sm font-bold px-6 py-2.5 rounded-lg cursor-pointer border-none hover:bg-[#3a7be8] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListing;
