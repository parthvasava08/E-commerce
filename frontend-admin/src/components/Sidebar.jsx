import "../assets/css/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">S</div>

        <div className="brand-name">
          ADMIN
          <span>DASHBOARD</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="section-title">OVERVIEW</p>

        <Link to="/" className="sidebar-item active">
          <span>◆</span>
          Dashboard
        </Link>
      </div>

      <div className="sidebar-section">
        <p className="section-title">CATALOG</p>

        <Link to="/category" className="sidebar-item">
          <span>▤</span>
          Categories
        </Link>

        <Link to="/subcategory" className="sidebar-item">
          <span>▥</span>
          Subcategories
        </Link>

        <Link to="/brand" className="sidebar-item">
          <span>◈</span>
          Brands
        </Link>

        <Link to="/product" className="sidebar-item">
          <span>▦</span>
          Products
        </Link>
      </div>

      <div className="sidebar-section">
        <p className="section-title">SALES</p>

        <Link to="/Orders" className="sidebar-item">
          <span>⛁</span>
          Orders
        </Link>

        <Link to="Payments" className="sidebar-item">
          <span>◐</span>
          Payments
        </Link>

        <Link to="/Coupons" className="sidebar-item">
          <span>◍</span>
          Coupons
        </Link>
      </div>

      <div className="sidebar-section">
        <p className="section-title">PEOPLE</p>

        <Link to="/Users" className="sidebar-item">
          <span>◑</span>
          Users
        </Link>

        <Link to="/Reviews" className="sidebar-item">
          <span>★</span>
          Reviews
        </Link>

        <Link to="/Messages" className="sidebar-item">
          <span>✉</span>
          Messages
        </Link>
      </div>

      <div className="sidebar-bottom">
        <div className="admin-avatar">A</div>

        <div>
          <p>Admin</p>
          <span>Store owner</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
