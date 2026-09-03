import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, checked } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/wishlist" } });
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchWishlist();
  }, [user, checked, navigate]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/wishlist");
      setItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (wishlistId) => {
    try {
      await api.delete(`/api/wishlist/${wishlistId}`);
      setItems((prev) =>
        prev.filter((item) => item.wishlist_id !== wishlistId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post("/api/cart", { product_id: productId, quantity: 1 });
      navigate("/cart");
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear entire wishlist?")) return;
    try {
      await api.delete("/api/wishlist/clear");
      setItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0e1117] border border-[#1a1f2e] rounded-2xl aspect-square animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
            Saved
          </p>
          <h1 className="text-3xl font-extrabold text-[#f0f2f7]">Wishlist</h1>
          <p className="text-[#4a5568] text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[#f87171] text-sm font-bold bg-transparent border-none cursor-pointer hover:underline"
          >
            Clear wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart size={48} className="text-[#1a1f2e] mb-4" />
          <h3 className="text-[#f0f2f7] font-bold text-lg mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-[#4a5568] text-sm mb-6">
            Save products you love for later
          </p>
          <Link
            to="/products"
            className="bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const product = item.Product;
            const hasDiscount =
              product?.discount_price &&
              Number(product.discount_price) < Number(product.price);
            const price = Number(
              product?.discount_price || product?.price || 0,
            );
            const inStock = Number(product?.stock_quantity) > 0;

            return (
              <div
                key={item.wishlist_id}
                className="bg-[#0e1117] border border-[#1a1f2e] rounded-2xl overflow-hidden group"
              >
                <Link
                  to={`/product/${product?.product_id}`}
                  className="block relative aspect-square bg-[#080a0f]"
                >
                  {product?.cover_image ? (
                    <img
                      src={product.cover_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#2a3042] text-4xl">
                      ▦
                    </div>
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 bg-[#080a0f]/70 flex items-center justify-center">
                      <span className="text-[#f87171] font-bold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <p className="text-[10px] text-[#4f8ef7] font-bold uppercase tracking-widest mb-1">
                    {product?.Brand?.brand_name ||
                      product?.Category?.cat_name ||
                      ""}
                  </p>
                  <Link
                    to={`/product/${product?.product_id}`}
                    className="text-[13px] font-semibold text-[#f0f2f7] no-underline hover:text-[#4f8ef7] line-clamp-2 block mb-2"
                  >
                    {product?.product_name}
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[14px] font-extrabold text-[#f0f2f7]">
                      ₹{price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-[11px] text-[#4a5568] line-through">
                        ₹{Number(product.price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product?.product_id)}
                      disabled={!inStock}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#4f8ef7] text-white text-xs font-bold py-2 rounded-lg border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={13} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.wishlist_id)}
                      className="w-8 h-8 flex items-center justify-center bg-transparent border border-[#1a1f2e] rounded-lg text-[#4a5568] hover:border-[#f87171] hover:text-[#f87171] transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
