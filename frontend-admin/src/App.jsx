import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import SubCategory from "./pages/SubCategory";
import Brand from "./pages/Brand";
import Product from "./pages/Product";
import Coupons from "./pages/Coupons";
import Payments from "./pages/Payments";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";
import Messages from "./pages/Messages";
import Login from "./pages/Login";

function App() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) setAdmin(JSON.parse(stored));
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!admin) {
    return <AdminLogin onLoginSuccess={setAdmin} />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/category" element={<Category />} />
        <Route path="/subcategory" element={<SubCategory />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/product" element={<Product />} />
        <Route path="/Coupons" element={<Coupons />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/Reviews" element={<Reviews />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;
