import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axiosInstance";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    api
      .get("/api/admin/verify")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("fail"));
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-[#9aa2b1] text-sm">Verifying session...</p>
      </div>
    );
  }

  if (status === "fail") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
