import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  return (
    <BrowserRouter>
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
            <UserLayout>
              <Login />
            </UserLayout>
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
    </BrowserRouter>
  );
}

export default App;
