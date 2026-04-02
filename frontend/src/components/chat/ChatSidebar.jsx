const ChatSidebar = ({ chats, onSelectChat }) => {
  return (
    <div className="hidden md:flex w-[300px] bg-white border-r flex-col">

      {/* HEADER */}
      <div className="p-4 border-b font-semibold text-lg bg-white sticky top-0 z-10">
        Chats
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {chats.map((chat) => {
          const user = chat.members[0];

          return (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 border-b transition"
            >
              
              {/* ✅ AVATAR */}
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* TEXT */}
              <div className="flex-1">
                <p className="font-medium">
                  {user?.fullName}
                </p>

                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.message || "No messages yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;