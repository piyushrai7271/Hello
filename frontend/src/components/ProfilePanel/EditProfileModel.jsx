import { useState } from "react";
import { apiFetch } from "../../api/api";

const EditProfileModal = ({ user, onClose }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || "");

  const handleSave = async () => {
    const res = await apiFetch("/api/user/update-profile", {
      method: "PUT",
      body: JSON.stringify({ fullName, bio }),
    });

    if (res.success) {
      alert("Profile updated");
      onClose();
      window.location.reload(); // quick sync
    } else {
      alert("Error updating profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3">

        <h2 className="text-lg font-semibold">Edit Profile</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;