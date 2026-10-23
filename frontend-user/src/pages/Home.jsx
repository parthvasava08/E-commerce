import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Truck, Wallet, ShieldCheck, PackageSearch } from "lucide-react";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const discountOf = (p) => {
  const price = Number(p.price);
  const disc = Number(p.discount_price);
  return disc && disc < price ? Math.round(((price - disc) / price) * 100) : 0;
};

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const enterCls = (active) =>
  `transition-all duration-700 motion-reduce:transition-none ${
    active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
  }`;

const TRUST = [
  { icon: Truck, title: "Free delivery", text: "On orders above ₹999" },
  { icon: Wallet, title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Secure payments", text: "Powered by Razorpay" },
  { icon: PackageSearch, title: "Track your order", text: "Live order status" },
];

function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const boxRef = useRef(null);

  const handleMove = (e) => {
    const el = boxRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      ((e.clientX - r.left) / r.width - 0.5).toFixed(3),
    );
    el.style.setProperty(
      "--my",
      ((e.clientY - r.top) / r.height - 0.5).toFixed(3),
    );
    el.style.setProperty("--px", `${e.clientX - r.left}px`);
    el.style.setProperty("--py", `${e.clientY - r.top}px`);
    el.style.setProperty("--h", "1");
  };

  const handleLeave = () => {
    setPaused(false);
    const el = boxRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
    el.style.setProperty("--h", "0");
  };

  return (
    <div
      ref={boxRef}
      className="relative overflow-hidden rounded-3xl h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, si) => {
          const active = si === index;
          const p = s.product;
          const d = p ? discountOf(p) : 0;
          const delay = (ms) => ({
            transitionDelay: active ? `${ms}ms` : "0ms",
          });
          return (
            <div
              key={s.tag}
              className={`relative min-w-full overflow-hidden bg-gradient-to-br ${s.bg} px-6 sm:px-16 py-10 sm:py-12 min-h-[240px] sm:min-h-[340px] flex items-center`}
            >
              <div
                className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-2xl transition-transform duration-300 ease-out"
                style={{
                  transform:
                    "translate(calc(var(--mx, 0) * -50px), calc(var(--my, 0) * -50px))",
                }}
              />
              <div
                className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-black/10 blur-2xl transition-transform duration-300 ease-out"
                style={{
                  transform:
                    "translate(calc(var(--mx, 0) * 60px), calc(var(--my, 0) * 60px))",
                }}
              />

              <div className="relative grid sm:grid-cols-2 items-center gap-8 w-full">
                <div>
                  <div className={enterCls(active)} style={delay(150)}>
                    <span className="inline-block bg-white/20 text-white text-[11px] font-bold tracking-widest px-3 py-1 rounded-full mb-4">
                      {s.tag}
                    </span>
                  </div>
                  <h2
                    className={`text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3 ${enterCls(active)}`}
                    style={delay(250)}
                  >
                    {s.title}
                  </h2>
                  <p
                    className={`text-white/90 text-sm sm:text-base mb-6 max-w-sm ${enterCls(active)}`}
                    style={delay(350)}
                  >
                    {s.text}
                  </p>
                  <div className={enterCls(active)} style={delay(450)}>
                    <Link
                      to={s.to}
                      className="inline-block bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-xl no-underline shadow-lg hover:scale-105 transition-transform"
                    >
                      {s.cta} →
                    </Link>
                  </div>
                </div>

                <div
                  className={`hidden sm:block transition-all duration-700 motion-reduce:transition-none ${
                    active
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-12"
                  }`}
                  style={delay(400)}
                >
                  {p ? (
                    <Link
                      to={`/product/${p.product_id}`}
                      className="group block no-underline"
                    >
                      <div className="animate-float motion-reduce:animate-none">
                        <div
                          className="bg-white rounded-3xl p-3 shadow-2xl w-64 lg:w-72 mx-auto transition-transform duration-200 ease-out"
                          style={{
                            transform:
                              "perspective(900px) rotateY(calc(var(--mx, 0) * 16deg)) rotateX(calc(var(--my, 0) * -16deg)) rotateZ(calc((1 - var(--h, 0)) * 3deg))",
                          }}
                        >
                          {p.cover_image ? (
                            <img
                              src={p.cover_image}
                              alt={p.product_name}
                              className="w-full aspect-square object-cover rounded-2xl"
                            />
                          ) : (
                            <div className="w-full aspect-square rounded-2xl bg-gray-100" />
                          )}
                          <div className="px-1.5 pt-3 pb-1">
                            <p className="text-[13px] font-semibold text-gray-900 m-0 line-clamp-1">
                              {p.product_name}
                            </p>
                            <p className="text-[15px] font-extrabold text-gray-900 m-0 mt-0.5">
                              {formatPrice(d ? p.discount_price : p.price)}
                              {d > 0 && (
                                <span className="ml-2 text-[11px] font-bold text-red-500">
                                  {d}% OFF
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex justify-center animate-float motion-reduce:animate-none">
                      <Truck
                        size={150}
                        strokeWidth={1.2}
                        className="text-white/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cursor glow */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block transition-opacity duration-300"
        style={{
          opacity: "var(--h, 0)",
          background:
            "radial-gradient(420px circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,0.18), transparent 60%)",
        }}
      />

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.tag}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full border-none cursor-pointer transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductRow({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Reveal>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-[#f0f2f7]">
            {title}
          </h2>
          <Link
            to="/products"
            className="text-[#4f8ef7] text-sm font-bold no-underline hover:underline"
          >
            View all →
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {items.map((product, i) => (
          <Reveal
            key={product.product_id}
            delay={(i % 4) * 90}
            className="h-full"
          >
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

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
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { deals, allDeals, newest, topRated, maxDiscount } = useMemo(() => {
    const dealList = products
      .filter((p) => discountOf(p) > 0)
      .sort((a, b) => discountOf(b) - discountOf(a));
    return {
      deals: dealList.slice(0, 4),
      allDeals: dealList,
      maxDiscount: dealList.length ? discountOf(dealList[0]) : 0,
      newest: [...products]
        .sort((a, b) => b.product_id - a.product_id)
        .slice(0, 8),
      topRated: products
        .filter((p) => Number(p.review_count) > 0)
        .sort(
          (a, b) =>
            Number(b.avg_rating) - Number(a.avg_rating) ||
            Number(b.review_count) - Number(a.review_count),
        )
        .slice(0, 4),
    };
  }, [products]);

  const slides = [
    ...(maxDiscount > 0
      ? [
          {
            tag: "TOP DEALS",
            title: `Up to ${maxDiscount}% off`,
            text: "Discounts on selected products, while stock lasts.",
            cta: "Shop deals",
            to: "/products",
            product: allDeals[0],
            bg: "from-[#1e3a8a] to-[#2563eb]",
          },
        ]
      : []),
    {
      tag: "NEW ARRIVALS",
      title: "Fresh in store",
      text: "Browse the latest products added to KOREX.",
      cta: "Explore",
      to: "/products",
      product: newest[1] || newest[0],
      bg: "from-[#115e59] to-[#0d9488]",
    },
    {
      tag: "FREE DELIVERY",
      title: "Free shipping above ₹999",
      text: "Pay online or choose Cash on Delivery.",
      cta: "Start shopping",
      to: "/products",
      bg: "from-[#9a3412] to-[#ea580c]",
    },
  ];

  return (
    <div className="pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <Reveal>
          <HeroCarousel slides={slides} />
        </Reveal>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="flex gap-5 overflow-x-auto [scrollbar-width:none] py-2">
            {categories.map((cat, i) => (
              <Reveal
                key={cat.cat_id}
                delay={Math.min(i, 8) * 60}
                className="shrink-0"
              >
                <Link
                  to={`/products?category=${cat.cat_id}`}
                  className="group shrink-0 w-20 flex flex-col items-center gap-2 no-underline"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.cat_name}
                      loading="lazy"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#4f8ef7] transition-all duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#4f8ef7]/10 flex items-center justify-center text-[#4f8ef7] text-xl ring-2 ring-transparent group-hover:ring-[#4f8ef7] transition-all">
                      ▤
                    </div>
                  )}
                  <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight line-clamp-2">
                    {cat.cat_name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRUST.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="h-full">
              <div className="h-full flex items-center gap-3 bg-gray-50 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-xl px-4 py-3">
                <Icon size={22} className="text-[#4f8ef7] shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-gray-900 dark:text-[#f0f2f7] m-0">
                    {title}
                  </p>
                  <p className="text-[11.5px] text-gray-500 dark:text-gray-400 m-0">
                    {text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl aspect-square animate-pulse"
              />
            ))}
          </div>
        </section>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No products yet.
        </div>
      ) : (
        <>
          <ProductRow title="Top Deals" items={deals} />
          <ProductRow title="New Arrivals" items={newest} />
          <ProductRow title="Top Rated" items={topRated} />
        </>
      )}
    </div>
  );
}

export default Home;
