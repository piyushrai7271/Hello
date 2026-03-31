import { useRef } from "react";

const MessageInput = ({ input, setInput, onSend, socket, selectedChat }) => {
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append("message", file);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/chat/upload-message-file`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const data = await res.json();

    if (data.success) {
      socket.emit("private-message", {
        toUserId: selectedChat.members[0]._id,
        messageType: data.data.messageType,
        fileUrl: data.data.fileUrl,
      });
    }
  };

  return (
    <div className="p-3 border-t flex gap-2">
      <button onClick={() => fileRef.current.click()}>📎</button>

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFile}
      />

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border flex-1 p-2"
        placeholder="Type message..."
      />

      <button onClick={onSend} className="bg-blue-500 text-white px-4">
        Send
      </button>
    </div>
  );
};

export default MessageInput;