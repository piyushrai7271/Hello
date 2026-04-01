import { Server } from "socket.io";
import socketAuth from "../middlewares/socketAuth.middleware.js";
import { handleConnection } from "./handlers/connection.handler.js";
import { corsOptions } from "../config/cors.js"; // ✅ IMPORT

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: corsOptions.origin, // ✅ reuse same logic
      credentials: true,
    },
  });

  // using middleware to authenticate user
  io.use(socketAuth);

  // user connected
  io.on("connection", (socket) => {
    handleConnection(io, socket);
  });
};

export default initSocket;