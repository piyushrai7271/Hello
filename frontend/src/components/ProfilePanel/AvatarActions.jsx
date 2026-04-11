import { useState } from "react";
import { apiFetch } from "../../api/api";
import toast from "react-hot-toast";

const AvatarActions = ({ onClose, setUser }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/api/user/deleteAvatar", {
        method: "DELETE",
      });

      if (res.success) {
        setUser((prev) => ({
          ...prev,
          avatar: { url: "", public_id: "" },
        }));

        toast.success("Avatar deleted ✅");
        setTimeout(onClose, 800);
      } else {
        toast.error(res.message || "Failed to delete avatar ❌");
      }
    } catch (error) {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

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
        setUser((prev) => ({
          ...prev,
          avatar: data.data.avatar,
        }));

        toast.success("Avatar updated 🎉");
        setTimeout(onClose, 800);
      } else {
        toast.error(data.message || "Failed to update avatar ❌");
      }
    } catch (error) {
      toast.error("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-xl w-80 flex flex-col gap-3">

        <h2 className="font-semibold text-lg">Profile Photo</h2>

        <label className="cursor-pointer p-2 border rounded text-center">
          {loading ? "Uploading..." : "Upload New"}
          <input type="file" hidden onChange={handleUpload} />
        </label>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-2 border rounded text-red-500 disabled:opacity-50"
        >
          Delete Avatar
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AvatarActions;