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

        <div className="sidebar-item">
          <span>⛁</span>
          Orders
        </div>

        <div className="sidebar-item">
          <span>◐</span>
          Payments
        </div>

        <div className="sidebar-item">
          <span>◍</span>
          Coupons
        </div>
      </div>

      <div className="sidebar-section">
        <p className="section-title">PEOPLE</p>

        <div className="sidebar-item">
          <span>◑</span>
          Users
        </div>

        <div className="sidebar-item">
          <span>★</span>
          Reviews
        </div>

        <div className="sidebar-item">
          <span>✉</span>
          Messages
        </div>
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
