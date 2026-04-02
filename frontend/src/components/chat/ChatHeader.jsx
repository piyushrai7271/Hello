const ChatHeader = ({ selectedChat, isTyping, isOnline, lastSeen }) => {
  if (!selectedChat) return null;

  const user = selectedChat.members[0];

  const formatLastSeen = (time) => {
    if (!time) return "Last seen recently";

    const date = new Date(time);
    const now = new Date();

    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Last seen just now";
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hrs ago`;

    return `Last seen on ${date.toLocaleDateString()}`;
  };

  return (
    <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
      
      <div className="flex items-center gap-3">

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

        {/* NAME + STATUS */}
        <div>
          <p className="font-semibold">{user?.fullName}</p>

          <p className="text-xs text-gray-500">
            {isTyping
              ? "Typing..."
              : isOnline
              ? "🟢 Online"
              : formatLastSeen(lastSeen)}
          </p>
        </div>
      </div>

      <div className="cursor-pointer text-xl">⋮</div>
    </div>
  );
};

export default ChatHeader;