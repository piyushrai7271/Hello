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
  const bottomRef = useRef();

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
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
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("private-message", {
      toUserId,
      message: input,
    });

    setInput("");
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center w-2/3">
        Select a chat
      </div>
    );
  }

  return (
    <div className="w-2/3 flex flex-col">
      <ChatHeader selectedChat={selectedChat} />

      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((msg, i) => {
          // ✅ FIXED COMPARISON
          const isMe =
            String(msg.fromUserId) === String(currentUserId);

          // // ✅ DEBUG LOGS
          // console.log("🟡 Message:", msg);
          // console.log("🟢 msg.fromUserId:", msg.fromUserId);
          // console.log("🔵 currentUserId:", currentUserId);
          // console.log("👉 isMe:", isMe);

          return (
            <div
              key={msg.messageId || i}
              className={`mb-2 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded max-w-xs ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
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
                      className="w-40 rounded"
                    />
                  )}

                {/* FILE */}
                {msg.messageType === "file" &&
                  msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      className="underline text-blue-700"
                    >
                      Download File
                    </a>
                  )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      <MessageInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        socket={socket}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default ChatWindow;