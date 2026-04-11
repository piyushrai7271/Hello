import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔁 refresh token helper
const refreshToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    return data?.success;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return false;
  }
};

export const apiFetch = async (endpoint, options = {}, retry = true) => {
  try {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
      ...options,
    });

    let data;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        message: "Invalid server response",
        data: null,
      };
    }

    // 🔥 ✅ FIX: Only refresh if it's NOT login request
    if (
      res.status === 401 &&
      retry &&
      !endpoint.includes("/login")
    ) {
      const refreshed = await refreshToken();

      if (refreshed) {
        return apiFetch(endpoint, options, false);
      } else {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";

        return {
          success: false,
          message: "Session expired. Please login again.",
          data: null,
        };
      }
    }

    // ✅ SUCCESS CASE
    if (res.ok) {
      return {
        success: data?.success !== false,
        message: data?.message || "Success",
        data: data?.data || data,
      };
    }

    // ❌ ERROR CASE (like wrong password)
    return {
      success: false,
      message: data?.message || "Something went wrong",
      data: null,
    };

  } catch (error) {
    console.error("API Error:", error);

    return {
      success: false,
      message: "Network error. Please check your connection.",
      data: null,
    };
  }
};