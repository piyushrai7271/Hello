// dotenv FIRST
import "./config/env.js";

// process level crash handlers FIRST
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);

  process.exit(1);
});

import app from "./app.js";
import { createServer } from "node:http";
import connectDb from "./config/database.connection.js";
import initSocket from "./socket/index.js";

// env variables
const port = process.env.PORT || 5000;

let server;

connectDb()
  .then(() => {
    server = createServer(app);

    // initialize socket
    initSocket(server);

    server.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err.message);

    process.exit(1);
  });

// async promise rejection handler
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});