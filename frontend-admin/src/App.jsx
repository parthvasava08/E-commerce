import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import SubCategory from "./pages/SubCategory";
import Brand from "./pages/Brand";
import Product from "./pages/Product";
import Orders from "./pages/Orders";

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/category" element={<Category />} />
        <Route path="/subcategory" element={<SubCategory />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/product" element={<Product />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;
