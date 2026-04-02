import { useState } from "react";
import ChangePasswordModal from "../ProfilePanel/ChangePasswordModal.jsx";
import EditProfileModal from "../ProfilePanel/EditProfileModel.jsx";
import AvatarActions from "../ProfilePanel/AvatarActions.jsx";

const ProfilePanel = ({ user, closeProfile }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarActions, setShowAvatarActions] = useState(false);

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Profile</h2>
        <button onClick={closeProfile}>✕</button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center p-6 gap-4">

        {/* ✅ AVATAR WITH CLICK */}
        <div
          className="relative cursor-pointer"
          onClick={() => setShowAvatarActions(true)}
        >
          {user.avatar?.url ? (
            <img
              src={user.avatar.url}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-2xl text-white">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* EDIT ICON */}
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1 rounded-full">
            ✏️
          </div>
        </div>

        {/* NAME */}
        <h3 className="text-lg font-semibold">{user.fullName}</h3>

        {/* BIO */}
        <p className="text-sm text-gray-500 text-center">
          {user.bio || "No bio added"}
        </p>

        {/* ACTIONS */}
        <div className="w-full mt-4 flex flex-col gap-3">

          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-2 border rounded-lg hover:bg-gray-100"
          >
            Change Password
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 border rounded-lg hover:bg-gray-100"
          >
            Edit Profile
          </button>

        </div>
      </div>

      {/* ✅ AVATAR ACTIONS MODAL */}
      {showAvatarActions && (
        <AvatarActions
          user={user}
          onClose={() => setShowAvatarActions(false)}
        />
      )}

      {/* ✅ PASSWORD MODAL */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* ✅ EDIT MODAL */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePanel;