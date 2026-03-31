import { apiFetch } from "../../api/api.js";
import {disconnectSocket} from "../../socket/socket.js";

const ChatSidebar = ({ chats, onSelectChat, openUsers }) => {

  const handleLogout = async () => {
    await apiFetch("/api/user/logout", { method: "POST" });

    disconnectSocket(); // ✅ VERY IMPORTANT
    window.location.href = "/login";
  };

  return (
    <div className="w-1/3 border-r p-3">
      
      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <h2 className="font-bold">Chats</h2>

        <div className="flex gap-2">
          <button
            onClick={openUsers}
            className="bg-green-500 text-white px-2 py-1"
          >
            +
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CHAT LIST */}
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat)}
          className="p-2 border-b cursor-pointer hover:bg-gray-100"
        >
          <p className="font-semibold">
            {chat.members[0]?.fullName}
          </p>

          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage?.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;