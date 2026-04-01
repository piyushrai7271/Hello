import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";

const ChatWindow = ({
  socket,
  selectedChat,
  messages = [],
  setMessages,
  currentUserId,
}) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef();

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // ✅ USER STATUS
  // =========================
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const userId = selectedChat.members[0]._id;

    socket.emit("check-user-status", { userId });

    socket.on("user-status", ({ userId: id, isOnline, lastSeen }) => {
      if (id === userId) {
        setIsOnline(isOnline);
        setLastSeen(lastSeen);
      }
    });

    socket.on("user-online", ({ userId: id }) => {
      if (id === userId) setIsOnline(true);
    });

    socket.on("user-offline", ({ userId: id, lastSeen }) => {
      if (id === userId) {
        setIsOnline(false);
        setLastSeen(lastSeen);
      }
    });

    return () => {
      socket.off("user-status");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [socket, selectedChat]);

  // =========================
  // ✅ TYPING EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    socket.on("user-typing", () => setIsTyping(true));
    socket.on("user-stop-typing", () => setIsTyping(false));

    return () => {
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [socket]);

  // =========================
  // ✅ DELIVERY + SEEN EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    // ✔✔ delivered
    socket.on("message-delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    });

    // ✔✔ blue seen
    socket.on("messages-seen", ({ chatId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.fromUserId) === String(currentUserId)
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    return () => {
      socket.off("message-delivered");
      socket.off("messages-seen");
    };
  }, [socket, currentUserId, setMessages]);

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSend = () => {
    if (!input.trim() || !selectedChat || !socket) return;

    if (typeof setMessages !== "function") {
      console.error("❌ setMessages is not passed properly");
      return;
    }

    const toUserId = selectedChat.members[0]._id;

    const tempMsg = {
      messageId: Date.now().toString(),
      message: input,
      messageType: "text",
      fromUserId: currentUserId,
      status: "sent", // ✅ NEW
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("private-message", {
      toUserId,
      message: input,
    });

    socket.emit("typing-stop", { toUserId });

    setInput("");
  };

  // =========================
  // HANDLE TYPING
  // =========================
  const handleTyping = (value) => {
    setInput(value);

    if (!socket || !selectedChat) return;

    const toUserId = selectedChat.members[0]._id;

    socket.emit("typing-start", { toUserId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { toUserId });
    }, 1500);
  };

  // =========================
  // TICK UI
  // =========================
  const renderTicks = (status) => {
    if (status === "sent") return "✔";
    if (status === "delivered") return "✔✔";
    if (status === "seen") return <span className="text-blue-300">✔✔</span>;
    return null;
  };

  // EMPTY STATE
  if (!selectedChat) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-lg">💬</p>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-0">

      {/* HEADER */}
      <ChatHeader
        selectedChat={selectedChat}
        isTyping={isTyping}
        isOnline={isOnline}
        lastSeen={lastSeen}
      />

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9] min-h-0">
        {messages.map((msg, i) => {
          const isMe =
            String(msg.fromUserId) === String(currentUserId);

          return (
            <div
              key={msg.messageId || i}
              className={`mb-3 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-xs break-words shadow-sm ${
                  isMe
                    ? "bg-blue-500 text-white rounded-2xl rounded-br-none"
                    : "bg-white text-black rounded-2xl rounded-bl-none"
                }`}
              >
                {/* TEXT */}
                {msg.messageType === "text" &&
                  msg.message &&
                  msg.message}

                {/* IMAGE */}
                {msg.messageType === "image" &&
                  msg.fileUrl && (
                    <img
                      src={msg.fileUrl}
                      className="w-40 rounded mt-1"
                    />
                  )}

                {/* FILE */}
                {msg.messageType === "file" &&
                  msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      className="underline text-blue-200"
                    >
                      Download File
                    </a>
                  )}

                {/* ✅ TICKS */}
                {isMe && (
                  <div className="text-xs text-right mt-1 opacity-80">
                    {renderTicks(msg.status)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <MessageInput
        input={input}
        setInput={handleTyping}
        onSend={handleSend}
        socket={socket}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default ChatWindow;