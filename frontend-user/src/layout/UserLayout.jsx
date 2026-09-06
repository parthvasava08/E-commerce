import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f2f7] font-sans flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default UserLayout;
