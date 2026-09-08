import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const hasDiscount =
    product.discount_price &&
    Number(product.discount_price) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : null;

  return (
    <Link
      to={`/product/${product.product_id}`}
      className="group bg-white dark:bg-[#0e1117] border border-gray-200 dark:border-[#1a1f2e] rounded-2xl overflow-hidden no-underline hover:border-[#4f8ef7] transition-all duration-300 block"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-[#080a0f] overflow-hidden">
        {product.cover_image ? (
          <img
            src={product.cover_image}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#2a3042] text-4xl">
            ▦
          </div>
        )}
        {discountPercent && (
          <div className="absolute top-3 left-3 bg-[#4f8ef7] text-white text-[10px] font-extrabold px-2 py-1 rounded-lg">
            -{discountPercent}%
          </div>
        )}
        {Number(product.stock_quantity) === 0 && (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#080a0f]/70 flex items-center justify-center">
            <span className="text-[#f87171] font-bold text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10.5px] text-[#4f8ef7] font-bold uppercase tracking-wider mb-1">
          {product.Brand?.brand_name || product.Category?.cat_name || ""}
        </p>
        <h3 className="text-[13.5px] font-semibold text-gray-800 dark:text-[#f0f2f7] mb-2 leading-snug line-clamp-2">
          {product.product_name}
        </h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
                ₹{Number(product.discount_price).toLocaleString()}
              </span>
              <span className="text-[12px] text-gray-400 dark:text-[#4a5568] line-through">
                ₹{Number(product.price).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-[15px] font-extrabold text-gray-900 dark:text-[#f0f2f7]">
              ₹{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
