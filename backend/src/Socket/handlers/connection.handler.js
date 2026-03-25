import { registerPrivateChat } from "./message.handler.js";
import { onlineUsers } from "../../utils/onlineUsers.js";

const handleConnection = (io, socket) => {
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });

  const userId = socket.userId.toString();

  socket.join(userId);

  // store online user
  onlineUsers.set(userId, socket.id);

  console.log(`User ${userId} connected`);

  registerPrivateChat(io, socket);

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
};

export { handleConnection };
