import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0b0e14]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
