import { Link } from "react-router-dom";
import { Share2, Heart, MessageCircle, CreditCard } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();
  const shopLinks = [
    { label: "All Products", to: "/products" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Cart", to: "/cart" },
  ];
  const accountLinks = [
    { label: "My Orders", to: "/my-orders" },
    { label: "Profile", to: "/profile" },
    { label: "Contact", to: "/contact" },
  ];
  const socialIcons = [Share2, Heart, MessageCircle, CreditCard];

  return (
    <footer className="mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#4f8ef7] rounded-t-2xl px-8 py-10 relative overflow-hidden">
          <p className="text-white text-2xl md:text-3xl font-extrabold mb-1.5 max-w-md leading-snug">
            Ready to find your next favorite thing?
          </p>
          <p className="text-white/80 text-sm mb-5">
            Browse the full catalog and see what's new.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-[#4f8ef7] font-bold text-sm px-6 py-2.5 rounded-lg no-underline hover:bg-gray-100 transition-colors"
          >
            Shop now
          </Link>
        </div>
        <div className="bg-gray-50 dark:bg-[#0e1117] border-x border-b border-gray-200 dark:border-[#1a1f2e] rounded-b-2xl px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-7">
            <div>
              <Link
                to="/"
                className="flex items-center gap-2 no-underline mb-2.5"
              >
                <div className="w-6.5 h-6.5 rounded-lg bg-[#4f8ef7] flex items-center justify-center text-white font-extrabold text-xs">
                  K
                </div>
                <span className="text-gray-900 dark:text-[#f0f2f7] font-extrabold text-sm tracking-widest">
                  KOREX
                </span>
              </Link>
              <p className="text-gray-500 dark:text-[#6b7a99] text-xs leading-relaxed">
                Premium products, delivered fast.
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-[#4a5568] text-[11px] font-bold uppercase tracking-wide mb-2.5">
                Shop
              </p>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-500 dark:text-[#9aa2b1] text-[13px] no-underline hover:text-[#4f8ef7] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-gray-400 dark:text-[#4a5568] text-[11px] font-bold uppercase tracking-wide mb-2.5">
                Account
              </p>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-500 dark:text-[#9aa2b1] text-[13px] no-underline hover:text-[#4f8ef7] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-gray-400 dark:text-[#4a5568] text-[11px] font-bold uppercase tracking-wide mb-2.5">
                Follow
              </p>
              <div className="flex items-center gap-2.5">
                {socialIcons.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="text-gray-500 dark:text-[#9aa2b1] hover:text-[#4f8ef7] transition-colors"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-[#1a1f2e] pt-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-gray-400 dark:text-[#4a5568] text-xs">
              © {year} Korex. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-400 dark:text-[#4a5568]">
              <CreditCard size={18} />
              <span className="text-xs">Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
