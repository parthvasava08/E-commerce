import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white dark:bg-[#080a0f] border-t border-gray-200 dark:border-[#1a1f2e] mt-auto">
      <div className="bg-[#4f8ef7] px-6 py-10 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">
          Ready to find your next favorite thing?
        </h2>
        <p className="text-blue-100 text-sm mb-5">
          Browse the full catalog and see what's new.
        </p>
        <Link
          to="/products"
          className="inline-block bg-white text-[#4f8ef7] font-bold px-6 py-2.5 rounded-xl no-underline hover:bg-blue-50 transition-colors text-sm"
        >
          Shop now
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold text-sm">
                K
              </div>
              <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold tracking-widest">
                KOREX
              </span>
            </Link>
            <p className="text-gray-400 dark:text-[#4a5568] text-xs leading-relaxed">
              Premium products, delivered fast.
            </p>
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-[#4a5568] uppercase tracking-widest mb-3">
              Shop
            </p>
            <div className="flex flex-col gap-2">
              {[
                { to: "/products", label: "All Products" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/cart", label: "Cart" },
                { to: "/track", label: "Track Order" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-500 dark:text-[#6b7a99] text-sm no-underline hover:text-[#4f8ef7] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-[#4a5568] uppercase tracking-widest mb-3">
              Account
            </p>
            <div className="flex flex-col gap-2">
              {[
                { to: "/login", label: "Sign In" },
                { to: "/login", label: "Register" },
                { to: "/my-orders", label: "My Orders" },
                { to: "/profile", label: "Profile" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-gray-500 dark:text-[#6b7a99] text-sm no-underline hover:text-[#4f8ef7] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-[#4a5568] uppercase tracking-widest mb-3">
              Support
            </p>
            <div className="flex flex-col gap-2">
              {[
                { to: "/contact", label: "Contact Us" },
                { to: "/track", label: "Order Tracking" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-gray-500 dark:text-[#6b7a99] text-sm no-underline hover:text-[#4f8ef7] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-100 dark:border-[#1a1f2e] gap-3">
          <p className="text-gray-400 dark:text-[#4a5568] text-xs">
            © 2026 KOREX. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              to="/policies/terms"
              className="text-gray-400 dark:text-[#4a5568] hover:text-[#4f8ef7] dark:hover:text-[#4f8ef7] text-xs no-underline transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/policies/privacy"
              className="text-gray-400 dark:text-[#4a5568] hover:text-[#4f8ef7] dark:hover:text-[#4f8ef7] text-xs no-underline transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/policies/refund"
              className="text-gray-400 dark:text-[#4a5568] hover:text-[#4f8ef7] dark:hover:text-[#4f8ef7] text-xs no-underline transition-colors"
            >
              Return &amp; Refund
            </Link>
            <Link
              to="/policies/shipping"
              className="text-gray-400 dark:text-[#4a5568] hover:text-[#4f8ef7] dark:hover:text-[#4f8ef7] text-xs no-underline transition-colors"
            >
              Shipping &amp; Delivery
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
