import { useState } from "react";
import { apiFetch } from "../../api/api";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await apiFetch("/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    if (res.success) {
      alert("Password changed successfully");
      onClose();
    } else {
      alert(res.message || "Error changing password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3">

        <h2 className="text-lg font-semibold">Change Password</h2>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleChangePassword}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;