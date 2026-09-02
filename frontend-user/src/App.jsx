import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import ContactUs from "./pages/ContactUs";

function App() {
  const { checked, user } = useAuth();

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <p className="text-[#4a5568] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />
      <Route
        path="/products"
        element={
          <UserLayout>
            <ProductListing />
          </UserLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <UserLayout>
            <ProductDetail />
          </UserLayout>
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <UserLayout>
              <Login />
            </UserLayout>
          )
        }
      />
      <Route
        path="/cart"
        element={
          <UserLayout>
            <Cart />
          </UserLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <UserLayout>
            <Checkout />
          </UserLayout>
        }
      />
      <Route
        path="/order-confirmation"
        element={
          <UserLayout>
            <OrderConfirmation />
          </UserLayout>
        }
      />
      <Route
        path="/my-orders"
        element={
          <UserLayout>
            <MyOrders />
          </UserLayout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <UserLayout>
            <Wishlist />
          </UserLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <UserLayout>
            <Profile />
          </UserLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <UserLayout>
            <ContactUs />
          </UserLayout>
        }
      />
    </Routes>
  );
}

export default App;
