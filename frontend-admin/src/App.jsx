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
import api from "./api/axiosInstance";

function App() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api
      .get("/api/admin/verify")
      .then((res) => {
        setAdmin(res.data.admin);
        setChecked(true);
      })
      .catch(() => {
        setAdmin(null);
        setChecked(true);
      });
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-[#9aa2b1] text-sm">Loading...</p>
      </div>
    );
  }

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
      </Routes>
    </AdminLayout>
  );
}

export default App;
