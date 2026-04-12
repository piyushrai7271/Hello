import { useEffect, useState } from "react";
import { getSocket } from "../../socket/socket.js";
import { apiFetch } from "../../api/api.js";
import toast from "react-hot-toast";

import MiniSidebar from "./MiniSidebar.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import UserModal from "./UserModal.jsx";
import ProfilePanel from "./ProfilePanel.jsx";

const ChatLayout = () => {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [userStatusMap, setUserStatusMap] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    setSocket(s);
  }, []);

  useEffect(() => {
    const getMe = async () => {
      const res = await apiFetch("/api/user/get-user-details");
      if (res.success) {
        setCurrentUser(res.data);
      } else {
        toast.error(res.message || "Failed to load user ❌");
      }
    };
    getMe();
  }, []);

  const fetchChats = async () => {
    const res = await apiFetch("/api/chat/allMessages");
    if (res.success) {
      setChats(res.data.chats);
    } else {
      toast.error(res.message || "Failed to load chats ❌");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchMessages = async (chatId) => {
    toast.loading("Loading messages...");
    const res = await apiFetch(`/api/chat/messages/${chatId}`);

    if (res.success) {
      const normalized = res.data.messages.map((msg) => ({
        messageId: msg.messageId || msg._id,
        message: msg.message,
        messageType: msg.messageType || "text",
        fileUrl: msg.fileUrl || "",
        fromUserId: msg.fromUserId || msg.senderId?._id || msg.senderId,
        createdAt: msg.createdAt,
        deliveredTo: msg.deliveredTo || [],
        seenBy: msg.seenBy || [],
      }));

      setMessages(normalized);

      socket?.emit("mark-as-seen", { chatId });
      toast.dismiss();
    } else {
      toast.dismiss();
      toast.error(res.message || "Failed to load messages ❌");
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowProfile(false);

    setChats((prev) =>
      prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c)),
    );

    fetchMessages(chat._id);

    const otherUserId = chat.members[0]._id;
    socket?.emit("check-user-status", { userId: otherUserId });

    socket?.emit("mark-as-seen", { chatId: chat._id });
  };

  // =========================
  // MESSAGE + DELIVERY + SEEN
  // =========================
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (!data) return;

      if (data.chatId === selectedChat?._id) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.messageId === data.messageId);
          if (exists) return prev;
          return [...prev, data];
        });

        socket.emit("mark-as-seen", { chatId: data.chatId });
      } else {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === data.chatId
              ? {
                  ...chat,
                  unreadCount: (chat.unreadCount || 0) + 1,
                }
              : chat,
          ),
        );
      }

      fetchChats();
    };

    // ✅ DELIVERY LISTENER
    const handleDelivered = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                deliveredTo: [...(msg.deliveredTo || []), userId],
              }
            : msg,
        ),
      );
    };

    // ✅ SEEN LISTENER
    const handleSeen = ({ chatId, seenBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.chatId === chatId
            ? {
                ...msg,
                seenBy: [...(msg.seenBy || []), seenBy],
              }
            : msg,
        ),
      );
    };

    socket.on("receive-private-message", handleMessage);
    socket.on("message-delivered", handleDelivered);
    socket.on("messages-seen", handleSeen);

    return () => {
      socket.off("receive-private-message", handleMessage);
      socket.off("message-delivered", handleDelivered);
      socket.off("messages-seen", handleSeen);
    };
  }, [socket, selectedChat]);

  // STATUS
  useEffect(() => {
    if (!socket) return;

    socket.on("user-online", ({ userId }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline: true },
      }));
    });

    socket.on("user-offline", ({ userId, lastSeen }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline: false, lastSeen },
      }));
    });

    socket.on("user-status", ({ userId, isOnline, lastSeen }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline, lastSeen },
      }));
    });

    return () => {
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("user-status");
    };
  }, [socket]);

  // TYPING
  useEffect(() => {
    if (!socket) return;

    socket.on("user-typing", ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("user-stop-typing", ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <MiniSidebar
        openUsers={() => setShowUsers(true)}
        currentUser={currentUser}
        openProfile={() => setShowProfile(true)}
      />

      <div className="hidden md:flex w-[340px] border-r flex-col min-h-0">
        {showProfile ? (
          <ProfilePanel
            user={currentUser}
            setUser={setCurrentUser}
            closeProfile={() => setShowProfile(false)}
          />
        ) : (
          <ChatSidebar
            chats={chats}
            onSelectChat={handleSelectChat}
            typingUsers={typingUsers}
            currentUserId={currentUser?._id}
          />
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <ChatWindow
          socket={socket}
          selectedChat={selectedChat}
          messages={messages}
          setMessages={setMessages}
          currentUserId={currentUser?._id}
          userStatusMap={userStatusMap}
        />
      </div>

      {showUsers && (
        <UserModal
          onClose={() => setShowUsers(false)}
          refreshChats={fetchChats}
          currentUserId={currentUser?._id}
        />
      )}
    </div>
  );
};

export default ChatLayout;
