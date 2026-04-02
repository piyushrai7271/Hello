import { useState } from "react";
import { apiFetch } from "../../api/api";

const AvatarActions = ({ user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ DELETE AVATAR
  const handleDelete = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await apiFetch("/api/user/deleteAvatar", {
        method: "DELETE",
      });

      if (res.success) {
        setMessage("✅ Avatar deleted successfully");
        setTimeout(() => {
          onClose();
          window.location.reload(); // you can remove later with state update
        }, 1000);
      } else {
        setMessage("❌ Failed to delete avatar");
      }
    } catch (error) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPLOAD / UPDATE AVATAR
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/updateAvatar`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Avatar updated successfully");

        setTimeout(() => {
          onClose();
          window.location.reload(); // later we can remove this
        }, 1000);
      } else {
        setMessage("❌ Upload failed");
      }
    } catch (error) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      
      <div className="bg-white p-5 rounded-xl w-80 flex flex-col gap-3">

        <h2 className="font-semibold text-lg">Profile Photo</h2>

        {/* ✅ UPLOAD BUTTON */}
        <label
          className={`cursor-pointer p-2 border rounded text-center transition ${
            loading ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          {loading ? "Uploading..." : "Upload New"}
          <input
            type="file"
            hidden
            disabled={loading}
            onChange={handleUpload}
          />
        </label>

        {/* ✅ DELETE BUTTON */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`p-2 border rounded transition ${
            loading
              ? "bg-gray-200 cursor-not-allowed"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          {loading ? "Processing..." : "Delete Avatar"}
        </button>

        {/* ✅ MESSAGE */}
        {message && (
          <p className="text-sm text-center text-gray-600">
            {message}
          </p>
        )}

        {/* CANCEL */}
        <button
          onClick={onClose}
          disabled={loading}
          className="mt-2 text-sm text-gray-500 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AvatarActions;