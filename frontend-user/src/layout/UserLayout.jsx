import Navbar from "../components/Navbar";

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f2f7] font-sans">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default UserLayout;
