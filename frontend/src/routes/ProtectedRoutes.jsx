import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../api/api";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await apiFetch("/api/user/get-user-details");

      if (res.success) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ LOADING STATE
  if (isAuth === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
