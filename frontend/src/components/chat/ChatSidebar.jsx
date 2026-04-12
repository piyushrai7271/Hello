import { useState } from "react";

const ChatSidebar = ({
  chats,
  onSelectChat,
  typingUsers = {},
  currentUserId,
}) => {
  const [search, setSearch] = useState("");

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return date.toLocaleDateString();
  };

  const renderTicks = (msg) => {
    if (!msg) return null;

    const senderId = msg.senderId?._id || msg.senderId;

    if (String(senderId) !== String(currentUserId)) return null;

    const isSeen = msg.seenBy?.length > 0;
    const isDelivered = msg.deliveredTo?.length > 0;

    if (isSeen)
      return <span className="text-orange-300 mr-1 shrink-0">✔✔</span>;

    if (isDelivered)
      return <span className="text-gray-400 mr-1 shrink-0">✔✔</span>;

    return <span className="text-gray-400 mr-1 shrink-0">✔</span>;
  };

  const renderLastMessage = (msg, isTyping) => {
    if (isTyping) return "Typing...";
    if (!msg) return "No messages yet";

    if (msg.messageType === "text" && msg.message) {
      return msg.message;
    }

    if (msg.messageType === "image") return "📷 Photo";
    if (msg.messageType === "video") return "🎥 Video";
    if (msg.messageType === "file") return "📎 File";
    if (msg.messageType === "audio") return "🎧 Audio";

    return "No messages yet";
  };

  // ✅ FILTERED CHATS
  const filteredChats = chats.filter((chat) => {
    const user = chat.members?.[0];
    return user?.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="hidden md:flex w-full bg-white border-r flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b font-semibold text-2xl bg-white sticky top-0 z-10">
        Chats
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="p-3 border-b bg-white sticky top-[64px] z-10">
        <div className="flex items-center bg-gray-200 rounded-full px-3 py-2">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-200 text-2xl">
            No chats found
          </div>
        ) : (
          filteredChats.map((chat) => {
            const user = chat.members?.[0];
            const lastMsg = chat.lastMessage;
            const isTyping = typingUsers[user?._id];

            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-pink-100 border-b transition"
              >
                {/* AVATAR */}
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold shrink-0">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user?.fullName || "User"}
                  </p>

                  <p
                    className={`text-sm flex items-center truncate ${
                      isTyping
                        ? "text-green-500 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {!isTyping && renderTicks(lastMsg)}

                    <span className="truncate">
                      {renderLastMessage(lastMsg, isTyping)}
                    </span>

                    {!isTyping && lastMsg?.createdAt && (
                      <span className="ml-2 text-xs text-gray-400 shrink-0">
                        • {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </p>
                </div>

                {/* UNREAD */}
                {chat.unreadCount > 0 && (
                  <div className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-2 shrink-0">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;