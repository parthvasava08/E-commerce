import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#0f2a1c] flex items-center justify-center">
          <CheckCircle size={40} className="text-[#4ade80]" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-[#f0f2f7] mb-2">
        Order Confirmed!
      </h1>
      <p className="text-[#4a5568] text-sm mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {order && (
        <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-2xl p-6 text-left mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Package size={18} className="text-[#4f8ef7]" />
            <span className="text-[15px] font-extrabold text-[#f0f2f7]">
              Order Details
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#4a5568]">Order Number</span>
              <span className="text-[#f0f2f7] font-bold font-mono">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4a5568]">Status</span>
              <span className="bg-[#0d1f36] text-[#4f8ef7] text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                {order.order_status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4a5568]">Total Paid</span>
              <span className="text-[#f0f2f7] font-extrabold text-base">
                ₹{Number(order.final_amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/my-orders"
          className="flex items-center justify-center gap-2 bg-[#4f8ef7] text-white font-bold px-6 py-3 rounded-xl no-underline hover:bg-[#3a7be8] transition-colors text-sm"
        >
          View My Orders
          <ArrowRight size={15} />
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center bg-[#0e1117] border border-[#1a1f2e] text-[#f0f2f7] font-bold px-6 py-3 rounded-xl no-underline hover:border-[#4f8ef7] transition-colors text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
