import { useEffect, useState } from "react";
import { getSocket } from "../../socket/socket.js";
import { apiFetch } from "../../api/api.js";

import ChatSidebar from "./ChatSidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import UserModal from "./UserModal.jsx";

const ChatLayout = () => {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ NEW
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  // ======================
  // INIT SOCKET
  // ======================
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    setSocket(s);
  }, []);

  // ======================
  // GET CURRENT USER (VERY IMPORTANT)
  // ======================
  useEffect(() => {
    const getMe = async () => {
      const res = await apiFetch("/api/user/get-user-details");
      if (res.success) {
        setCurrentUserId(res.data._id);
      }
    };
    getMe();
  }, []);

  // ======================
  // FETCH CHATS
  // ======================
  const fetchChats = async () => {
    const res = await apiFetch("/api/chat/allMessages");
    if (res.success) setChats(res.data.chats);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // ======================
  // FETCH MESSAGES
  // ======================
const fetchMessages = async (chatId) => {
  const res = await apiFetch(`/api/chat/messages/${chatId}`);

  if (res.success) {
    // ✅ FORCE NORMALIZATION (FRONTEND SAFETY)
    const normalized = res.data.messages.map((msg) => ({
      messageId: msg.messageId || msg._id,
      message: msg.message,
      messageType: msg.messageType || "text",
      fileUrl: msg.fileUrl || "",
      fromUserId:
        msg.fromUserId ||
        msg.senderId?._id ||
        msg.senderId,
    }));

    // console.log("✅ NORMALIZED:", normalized); only for debug

    setMessages(normalized);

    socket?.emit("mark-as-seen", { chatId });
  }
};

  // ======================
  // SELECT CHAT
  // ======================
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  // ======================
  // SOCKET LISTENER (ONLY HERE)
  // ======================
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data.chatId === selectedChat?._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.messageId === data.messageId
          );

          if (exists) return prev;

          return [...prev, data];
        });
      }

      fetchChats(); // update last message
    };

    socket.off("receive-private-message");
    socket.on("receive-private-message", handleMessage);

    return () => {
      socket.off("receive-private-message", handleMessage);
    };
  }, [socket, selectedChat]);

  // ======================
  // UI
  // ======================
  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        onSelectChat={handleSelectChat}
        openUsers={() => setShowUsers(true)}
      />

      <ChatWindow
        socket={socket}
        selectedChat={selectedChat}
        messages={messages}
        setMessages={setMessages}
        currentUserId={currentUserId} // ✅ PASS HERE
      />

      {showUsers && (
        <UserModal
          onClose={() => setShowUsers(false)}
          refreshChats={fetchChats}
        />
      )}
    </div>
  );
};

export default ChatLayout;