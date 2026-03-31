import { io } from "socket.io-client";

let socket = null;

// ✅ CONNECT SOCKET (ONLY ONCE)
export const connectSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
    });
  }

  return socket;
};

// ✅ GET EXISTING SOCKET
export const getSocket = () => socket;

// ✅ DISCONNECT SOCKET (ON LOGOUT)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};