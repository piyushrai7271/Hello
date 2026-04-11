const MessageMenu = ({
  isOpen,
  onDelete,
  onEdit,
  messageId,
  messageType = "text",   // ✅ NEW
  isDeleted = false       // ✅ NEW
}) => {
  if (!isOpen || isDeleted) return null; // ✅ prevent menu for deleted

  const canEdit = messageType === "text"; // ✅ only text editable

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {/* ✏️ Edit (ONLY TEXT) */}
      {canEdit && (
        <button
          onClick={() => onEdit(messageId)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition flex items-center gap-2"
        >
          ✏️ Edit
        </button>
      )}

      {/* 🗑️ Delete for me */}
      <button
        onClick={() => onDelete(messageId, "delete-for-me")}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition flex items-center gap-2"
      >
        🗑️ Delete for me
      </button>

      {/* ❌ Delete for everyone */}
      <button
        onClick={() => onDelete(messageId, "delete-for-everyone")}
        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-100 transition flex items-center gap-2"
      >
        🚫 Delete for everyone
      </button>
    </div>
  );
};

export default MessageMenu;