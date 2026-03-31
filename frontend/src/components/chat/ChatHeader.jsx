const ChatHeader = ({ selectedChat }) => {
  if (!selectedChat) return null;

  return (
    <div className="p-3 border-b flex justify-between items-center">
      <div>
        <p className="font-bold">
          {selectedChat.members[0]?.fullName}
        </p>

        {/* Future: online/offline */}
        <p className="text-xs text-gray-500">
          Last seen recently
        </p>
      </div>

      {/* Future: menu (3 dots) */}
      <div className="cursor-pointer">⋮</div>
    </div>
  );
};

export default ChatHeader;