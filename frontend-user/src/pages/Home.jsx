import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/categories"),
        ]);
        setProducts(productsRes.data.slice(0, 8));
        setCategories(categoriesRes.data.slice(0, 6));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden bg-white dark:bg-[#080a0f]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4f8ef7]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#c9a84c]/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7] animate-pulse" />
              <span className="text-[#4f8ef7] text-xs font-bold tracking-wider">
                NEW ARRIVALS 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-[#f0f2f7] leading-tight tracking-tight mb-6">
              <span className="block text-[#4f8ef7]">Delivered Fast</span>
            </h1>

            <p className="text-gray-500 dark:text-[#6b7a99] text-lg leading-relaxed mb-8 max-w-lg">
              Discover our curated collection of premium products. Quality you
              can trust, prices you'll love.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/products"
                className="bg-[#4f8ef7] text-white font-bold px-8 py-3.5 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
              >
                Shop Now →
              </Link>
              <Link
                to="/products"
                className="text-gray-700 dark:text-[#f0f2f7] font-semibold text-sm no-underline hover:text-[#4f8ef7] transition-colors"
              >
                View All Products
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-[#1a1f2e]">
              {[
                { value: "500+", label: "Products" },
                { value: "50+", label: "Brands" },
                { value: "10K+", label: "Customers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-[#4a5568] font-semibold mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
                Browse
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/products"
              className="text-[#4f8ef7] text-sm font-bold no-underline hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.cat_id}
                to={`/products?category=${cat.cat_id}`}
                className="group bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-4 flex flex-col items-center gap-3 no-underline hover:border-[#4f8ef7] transition-all duration-300"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.cat_name}
                    className="w-12 h-12 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#4f8ef7]/10 flex items-center justify-center text-[#4f8ef7] text-xl">
                    ▤
                  </div>
                )}
                <span className="text-[11px] font-bold text-gray-500 dark:text-[#9aa2b1] group-hover:text-gray-900 dark:group-hover:text-[#f0f2f7] text-center transition-colors leading-tight">
                  {cat.cat_name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
              Featured
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
              Top Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-[#4f8ef7] text-sm font-bold no-underline hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl aspect-square animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-[#4a5568]">
            No products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
