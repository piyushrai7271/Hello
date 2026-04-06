import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

const registerEditMessage = (io, socket) => {
  socket.on("edit-message", async ({ messageId, newMessage }) => {
    if (!messageId || !newMessage?.trim()) return;

    try {
      const message = await Message.findById(messageId);

      if (!message) return;

      // 🔐 Only sender can edit
      if (message.senderId.toString() !== socket.userId.toString()) {
        return;
      }

      // ❌ Don't allow editing deleted messages
      if (message.isDeleted) return;

      // ✅ Update message
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        {
          message: newMessage,
          isEdited: true,
        },
        { returnDocument: "after" } // ✅ FIXED warning also
      );

      // 🔥 Send to all users in chat
      const chat = await Chat.findById(message.chatId);

      const payload = {
        messageId: updatedMessage._id.toString(),
        newMessage: updatedMessage.message,
        isEdited: updatedMessage.isEdited,
      };

      chat.members.forEach((memberId) => {
        io.to(memberId.toString()).emit("message-edited", payload);
      });

    } catch (error) {
      console.error("Edit message error:", error);
    }
  });
};

export { registerEditMessage };