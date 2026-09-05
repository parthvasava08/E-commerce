import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Tag, Wallet, CreditCard, Loader2 } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [totals, setTotals] = useState(null);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [placeMsg, setPlaceMsg] = useState("");

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checked]);

  const fetchTotals = async (code) => {
    setTotalsLoading(true);
    try {
      const res = await api.get("/api/checkout/totals", {
        params: code ? { coupon_code: code } : {},
      });
      setTotals(res.data);
      if (res.data.items.length === 0) {
        navigate("/cart");
      }
    } catch (error) {
      if (error.response?.status === 400 && code) {
        setCouponMsg({ text: error.response.data.message, type: "error" });
        fetchTotals();
      }
    } finally {
      setTotalsLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponMsg({ text: "", type: "" });
    setCouponCode(couponInput.trim());
    fetchTotals(couponInput.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponMsg({ text: "", type: "" });
    fetchTotals();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () =>
    form.full_name &&
    form.mobile &&
    form.address &&
    form.city &&
    form.state &&
    form.country &&
    form.pincode;

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      setPlaceMsg("Please fill in all address fields");
      return;
    }

    setPlaceMsg("");
    setPlacing(true);

    try {
      if (paymentMethod === "cod") {
        const res = await api.post("/api/checkout/cod", {
          ...form,
          coupon_code: couponCode || undefined,
        });
        navigate("/order-confirmation", { state: { order: res.data.order } });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPlaceMsg("Failed to load payment gateway. Check your connection.");
        setPlacing(false);
        return;
      }

      const orderRes = await api.post("/api/checkout/razorpay/create-order", {
        coupon_code: couponCode || undefined,
      });

      const { razorpay_order_id, amount, currency, key_id } = orderRes.data;

      const razorpay = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        name: "Korex",
        description: "Order Payment",
        order_id: razorpay_order_id,
        prefill: {
          name: form.full_name,
          contact: form.mobile,
        },
        theme: { color: "#4f8ef7" },
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/checkout/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...form,
              coupon_code: couponCode || undefined,
            });
            navigate("/order-confirmation", {
              state: { order: verifyRes.data.order },
            });
          } catch (err) {
            setPlaceMsg(
              err.response?.data?.message || "Payment verification failed",
            );
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      razorpay.open();
    } catch (error) {
      setPlaceMsg(error.response?.data?.message || "Something went wrong");
      setPlacing(false);
    }
  };

  if (totalsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#4f8ef7]" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[#4f8ef7] text-xs font-bold uppercase tracking-widest mb-1">
          Almost there
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Shipping Address
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={form.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="col-span-2 w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="Mobile number"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                className="col-span-2 w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="col-span-2 w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="Country"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                className="w-full bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1f2e] flex items-center justify-center text-[#4f8ef7] flex-shrink-0">
                <Wallet size={16} />
              </div>
              <div className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                Payment Method
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-2.5 border rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                  paymentMethod === "cod"
                    ? "border-[#4f8ef7] bg-[#4f8ef7]/5 text-[#4f8ef7]"
                    : "border-gray-200 dark:border-[#1a1f2e] text-gray-500 dark:text-[#9aa2b1]"
                }`}
              >
                <Wallet size={16} />
                Cash on Delivery
              </button>
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex items-center gap-2.5 border rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                  paymentMethod === "online"
                    ? "border-[#4f8ef7] bg-[#4f8ef7]/5 text-[#4f8ef7]"
                    : "border-gray-200 dark:border-[#1a1f2e] text-gray-500 dark:text-[#9aa2b1]"
                }`}
              >
                <CreditCard size={16} />
                Pay Online
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl p-6 sticky top-24">
            <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7] mb-5">
              Order Summary
            </h2>

            <div className="flex flex-col gap-2.5 mb-5 max-h-48 overflow-y-auto">
              {totals?.items.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-500 dark:text-[#9aa2b1] truncate max-w-[220px]">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-[#f0f2f7] font-semibold flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5">
              {couponCode ? (
                <div className="flex items-center justify-between bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 rounded-lg px-3.5 py-2.5">
                  <span className="text-[#4f8ef7] text-xs font-bold flex items-center gap-1.5">
                    <Tag size={12} />
                    {couponCode}
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 dark:text-[#4a5568] text-xs font-semibold bg-transparent border-none cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    className="flex-1 bg-white dark:bg-[#080a0f] border border-gray-200 dark:border-[#1a1f2e] rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-[#f0f2f7] outline-none focus:border-[#4f8ef7]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-100 dark:bg-[#1a1f2e] text-gray-700 dark:text-[#f0f2f7] text-xs font-bold px-4 rounded-lg border-none cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMsg.text && (
                <p className="text-[#f87171] text-xs mt-2">{couponMsg.text}</p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 mb-5 border-t border-gray-200 dark:border-[#1a1f2e] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#6b7a99]">
                  Subtotal
                </span>
                <span className="text-gray-900 dark:text-[#f0f2f7] font-semibold">
                  ₹{totals?.total_amount.toLocaleString()}
                </span>
              </div>
              {totals?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#6b7a99]">
                    Discount
                  </span>
                  <span className="text-[#4ade80] font-semibold">
                    -₹{totals.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#6b7a99]">
                  Shipping
                </span>
                <span
                  className={
                    totals?.shipping_charge === 0
                      ? "text-[#4ade80] font-semibold"
                      : "text-gray-900 dark:text-[#f0f2f7] font-semibold"
                  }
                >
                  {totals?.shipping_charge === 0
                    ? "Free"
                    : `₹${totals?.shipping_charge}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between mb-6 border-t border-gray-200 dark:border-[#1a1f2e] pt-4">
              <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold">
                Total
              </span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                ₹{totals?.final_amount.toLocaleString()}
              </span>
            </div>

            {placeMsg && (
              <p className="text-[#f87171] text-xs font-semibold mb-3 text-center">
                {placeMsg}
              </p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-[#4f8ef7] text-white font-bold py-3.5 rounded-xl border-none cursor-pointer hover:bg-[#3a7be8] transition-colors disabled:opacity-50 text-sm"
            >
              {placing
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
