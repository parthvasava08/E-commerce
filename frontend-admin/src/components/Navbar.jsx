import "../assets/css/Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="search-box">
        <span>⌕</span>
        <input type="text" placeholder="Search anything..." />
      </div>

      <div className="navbar-right">
        <button className="add-product-btn">+ Add Product</button>

        <div className="navbar-avatar">A</div>
      </div>
    </header>
  );
}

export default Navbar;
