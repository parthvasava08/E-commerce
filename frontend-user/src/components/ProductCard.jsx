import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const stock = Number(product.stock_quantity);
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 5;
  const hasDiscount =
    product.discount_price &&
    Number(product.discount_price) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : null;
  const hasRating = Number(product.review_count) > 0;

  const goLogin = () =>
    navigate("/login", { state: { from: window.location.pathname } });

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return goLogin();
    try {
      await api.post("/api/cart", {
        product_id: product.product_id,
        quantity: 1,
      });
      window.dispatchEvent(new Event("cart-updated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return goLogin();
    try {
      await api.post("/api/wishlist", { product_id: product.product_id });
      setWishlisted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link
      to={`/product/${product.product_id}`}
      className="group relative flex h-full flex-col bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#4f8ef7]"
    >
      <div className="relative aspect-square bg-white overflow-hidden">
        {product.cover_image ? (
          <img
            src={product.cover_image}
            alt={product.product_name}
            loading="lazy"
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#2a3042] text-4xl">
            ▦
          </div>
        )}

        {discountPercent && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-2 py-1 rounded-lg">
            {discountPercent}% OFF
          </div>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-[#0e1117]/90 border-none cursor-pointer flex items-center justify-center shadow transition-transform hover:scale-110"
        >
          <Heart
            size={16}
            className={wishlisted ? "text-red-500" : "text-gray-500"}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>

        {outOfStock ? (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#080a0f]/70 flex items-center justify-center">
            <span className="text-red-500 font-bold text-sm">Out of Stock</span>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 py-2.5 border-none cursor-pointer text-[13px] font-bold text-white bg-[#4f8ef7] hover:bg-[#3b7ae0] transition-transform duration-300 translate-y-0 md:translate-y-full md:group-hover:translate-y-0"
          >
            {added ? <Check size={15} /> : <ShoppingCart size={15} />}
            {added ? "Added" : "Add to Cart"}
          </button>
        )}
      </div>

      <div className="flex-1 p-4">
        <p className="text-[11.5px] text-[#4f8ef7] font-bold uppercase tracking-wider mb-1">
          {product.Brand?.brand_name || product.Category?.cat_name || ""}
        </p>
        <h3 className="text-[15px] font-semibold text-gray-800 dark:text-[#f0f2f7] mb-2 leading-snug line-clamp-2">
          {product.product_name}
        </h3>

        {hasRating && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              {Number(product.avg_rating).toFixed(1)}
              <Star size={10} fill="currentColor" />
            </span>
            <span className="text-[12px] text-gray-500 dark:text-gray-400">
              ({product.review_count})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
            {formatPrice(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {lowStock && (
          <p className="text-[11.5px] font-semibold text-orange-600 mt-2 mb-0">
            Only {stock} left
          </p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
