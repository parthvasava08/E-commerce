import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../assets/css/AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <Navbar />

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
