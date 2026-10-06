import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import ProductReviews from "../components/ProductReviews";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
        setSelectedImage(res.data.cover_image);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl animate-pulse" />
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 dark:bg-[#0e1117] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-[#f87171] text-lg font-bold">Product not found.</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 text-[#4f8ef7] text-sm font-bold bg-transparent border-none cursor-pointer hover:underline"
        >
          ← Back to products
        </button>
      </div>
    );
  }

  const images = [
    product.cover_image,
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
  ].filter(Boolean);
  const hasDiscount =
    product.discount_price &&
    Number(product.discount_price) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : null;
  const inStock = Number(product.stock_quantity) > 0;
  const displayPrice = hasDiscount ? product.discount_price : product.price;

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await api.post("/api/cart", { product_id: product.product_id, quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await api.post("/api/wishlist", { product_id: product.product_id });
      setWishlisted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 dark:text-[#4a5568] hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors bg-transparent border-none cursor-pointer mb-8 text-sm font-semibold"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl overflow-hidden mb-3">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#2a3042] text-6xl">
                ▦
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                    selectedImage === img
                      ? "border-[#4f8ef7]"
                      : "border-gray-200 dark:border-[#1a1f2e] hover:border-[#4f8ef7]/50"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            {product.Brand?.brand_name && (
              <span className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest">
                {product.Brand.brand_name}
              </span>
            )}
            {product.Brand?.brand_name && product.Category?.cat_name && (
              <span className="text-gray-300 dark:text-[#2a3042]">·</span>
            )}
            {product.Category?.cat_name && (
              <span className="text-gray-400 dark:text-[#4a5568] text-xs font-semibold uppercase tracking-widest">
                {product.Category.cat_name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7] leading-tight mb-4">
            {product.product_name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
              ₹{Number(displayPrice).toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 dark:text-[#4a5568] line-through">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                <span className="bg-[#4f8ef7] text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span
              className={`w-2 h-2 rounded-full ${inStock ? "bg-[#4ade80]" : "bg-[#f87171]"}`}
            />
            <span
              className={`text-sm font-semibold ${inStock ? "text-[#4ade80]" : "text-[#f87171]"}`}
            >
              {inStock
                ? `In Stock (${product.stock_quantity} available)`
                : "Out of Stock"}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-500 dark:text-[#6b7a99] text-sm leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          <div className="h-px bg-gray-200 dark:bg-[#1a1f2e] mb-6" />

          {inStock && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-[#9aa2b1]">
                Quantity
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-[#f0f2f7] hover:bg-gray-200 dark:hover:bg-[#1a1f2e] transition-colors bg-transparent border-none cursor-pointer text-lg font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-900 dark:text-[#f0f2f7]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-[#f0f2f7] hover:bg-gray-200 dark:hover:bg-[#1a1f2e] transition-colors bg-transparent border-none cursor-pointer text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-colors border-none cursor-pointer ${
                inStock
                  ? addedToCart
                    ? "bg-[#4ade80] text-[#080a0f]"
                    : "bg-[#4f8ef7] text-white hover:bg-[#3a7be8]"
                  : "bg-gray-100 dark:bg-[#1a1f2e] text-gray-400 dark:text-[#4a5568] cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={16} />
              {addedToCart
                ? "Added!"
                : inStock
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>

            <button
              onClick={handleAddToWishlist}
              className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-colors cursor-pointer bg-transparent ${
                wishlisted
                  ? "border-[#f87171] text-[#f87171]"
                  : "border-gray-200 dark:border-[#1a1f2e] text-gray-400 dark:text-[#9aa2b1] hover:border-[#f87171] hover:text-[#f87171]"
              }`}
            >
              <Heart size={18} fill={wishlisted ? "#f87171" : "none"} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: <Truck size={16} />,
                title: "Free Delivery",
                sub: "On orders over ₹999",
              },
              {
                icon: <Shield size={16} />,
                title: "Secure Payment",
                sub: "100% protected",
              },
              {
                icon: <Package size={16} />,
                title: "Easy Returns",
                sub: "Terms apply",
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
              >
                <span className="text-[#4f8ef7]">{badge.icon}</span>
                <span className="text-[11px] font-bold text-gray-800 dark:text-[#f0f2f7]">
                  {badge.title}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-[#4a5568]">
                  {badge.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews productId={product.product_id} />
    </div>
  );
}

export default ProductDetail;
