/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCartItems(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/api/cart/${cartId}`, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await api.delete(`/api/cart/${cartId}`);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await api.delete("/api/cart/clear");
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(
      item.Product?.discount_price || item.Product?.price || 0,
    );
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
            Shopping
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
            Your Cart
          </h1>
          <p className="text-gray-400 dark:text-[#4a5568] text-sm mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[#f87171] text-sm font-bold bg-transparent border-none cursor-pointer hover:underline"
          >
            Clear cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag
            size={48}
            className="text-gray-200 dark:text-[#1a1f2e] mb-4"
          />
          <h3 className="text-gray-900 dark:text-[#f0f2f7] font-bold text-lg mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-400 dark:text-[#4a5568] text-sm mb-6">
            Add some products to get started
          </p>
          <Link
            to="/products"
            className="bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col gap-3">
            {cartItems.map((item) => {
              const product = item.Product;
              const price = Number(
                product?.discount_price || product?.price || 0,
              );
              const hasDiscount =
                product?.discount_price &&
                Number(product.discount_price) < Number(product.price);

              return (
                <div
                  key={item.cart_id}
                  className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-4 flex gap-4"
                >
                  <Link
                    to={`/product/${product?.product_id}`}
                    className="flex-shrink-0"
                  >
                    {product?.cover_image ? (
                      <img
                        src={product.cover_image}
                        alt={product.product_name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white dark:bg-[#080a0f] flex items-center justify-center text-gray-300 dark:text-[#2a3042] text-2xl">
                        ▦
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#4f8ef7] font-bold uppercase tracking-widest mb-0.5">
                      {product?.Brand?.brand_name ||
                        product?.Category?.cat_name ||
                        ""}
                    </p>
                    <Link
                      to={`/product/${product?.product_id}`}
                      className="text-[13.5px] font-semibold text-gray-900 dark:text-[#f0f2f7] no-underline hover:text-[#4f8ef7] transition-colors line-clamp-1"
                    >
                      {product?.product_name}
                    </Link>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[14px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                        ₹{price.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-[12px] text-gray-400 dark:text-[#4a5568] line-through">
                          ₹{Number(product.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => handleRemove(item.cart_id)}
                      className="text-gray-400 dark:text-[#4a5568] hover:text-[#f87171] transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="flex items-center bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.cart_id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-900 dark:text-[#f0f2f7] hover:bg-gray-100 dark:hover:bg-[#1a1f2e] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-[#f0f2f7]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.cart_id, item.quantity + 1)
                        }
                        disabled={item.quantity >= product?.stock_quantity}
                        className="w-8 h-8 flex items-center justify-center text-gray-900 dark:text-[#f0f2f7] hover:bg-gray-100 dark:hover:bg-[#1a1f2e] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="text-[13px] font-bold text-gray-900 dark:text-[#f0f2f7]">
                      ₹{(price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6 sticky top-24">
              <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-5">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#6b7a99]">
                    Subtotal
                  </span>
                  <span className="text-gray-900 dark:text-[#f0f2f7] font-semibold">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#6b7a99]">
                    Shipping
                  </span>
                  <span
                    className={
                      shipping === 0
                        ? "text-[#4ade80] font-semibold"
                        : "text-gray-900 dark:text-[#f0f2f7] font-semibold"
                    }
                  >
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-gray-400 dark:text-[#4a5568]">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free
                    shipping
                  </p>
                )}
              </div>

              <div className="h-px bg-gray-200 dark:bg-[#1a1f2e] mb-5" />

              <div className="flex justify-between mb-6">
                <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold">
                  Total
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                  ₹{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-[#4f8ef7] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#3a7be8] transition-colors border-none cursor-pointer text-sm"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>

              <Link
                to="/products"
                className="block text-center text-gray-400 dark:text-[#4a5568] text-xs font-semibold mt-4 no-underline hover:text-gray-900 dark:hover:text-[#f0f2f7] transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
