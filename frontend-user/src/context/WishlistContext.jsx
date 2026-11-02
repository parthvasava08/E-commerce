/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext({
  has: () => false,
  toggle: async () => {},
});

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  // { [product_id]: wishlist_id }
  const [map, setMap] = useState({});

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/wishlist");
      const next = {};
      res.data.forEach((item) => {
        next[item.product_id] = item.wishlist_id;
      });
      setMap(next);
    } catch {
      setMap({});
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    window.addEventListener("wishlist-updated", load);
    return () => window.removeEventListener("wishlist-updated", load);
  }, [load]);

  const has = (productId) => !!user && productId in map;

  const toggle = async (productId) => {
    if (productId in map) {
      await api.delete(`/api/wishlist/${map[productId]}`);
      setMap((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      const res = await api.post("/api/wishlist", { product_id: productId });
      setMap((prev) => ({ ...prev, [productId]: res.data.item.wishlist_id }));
    }
  };

  return (
    <WishlistContext.Provider value={{ has, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
