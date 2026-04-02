import { apiFetch } from "../../api/api.js";
import { disconnectSocket } from "../../socket/socket.js";
import { useNavigate } from "react-router-dom";

const MiniSidebar = ({ openUsers, currentUser, openProfile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiFetch("/api/user/logout", { method: "POST" });
    disconnectSocket();
    navigate("/login");
  };

  const renderAvatar = () => {
    if (currentUser?.avatar?.url) {
      return (
        <img
          src={currentUser.avatar.url}
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
          onClick={openProfile}
        />
      );
    }

    return (
      <div
        onClick={openProfile}
        className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold cursor-pointer"
      >
        {currentUser?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="w-16 bg-[#0f172a] text-white flex flex-col items-center py-4 justify-between">

      {/* TOP */}
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl">💬</div>

        <button
          onClick={openUsers}
          className="bg-green-500 p-2 rounded-xl hover:bg-green-600 transition"
        >
          +
        </button>
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col items-center gap-4">

        <button className="p-2 rounded-lg hover:bg-white/10">
          ⚙️
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
        >
          🚪
        </button>

        {/* ✅ USER AVATAR */}
        {renderAvatar()}
      </div>
    </div>
  );
};

export default MiniSidebar;