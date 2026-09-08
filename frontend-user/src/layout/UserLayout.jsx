import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#080a0f] text-gray-900 dark:text-[#f0f2f7] font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default UserLayout;
