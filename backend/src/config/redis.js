import { createClient } from "redis";

let redisClient = null;

const redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_URL
    : process.env.REDIS_LOCAL_URL;

if (redisUrl) {
  redisClient = createClient({
    url: redisUrl,

    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.log("❌ Redis retry limit reached");
          return new Error("Retry limit reached");
        }

        return 1000;
      },
    },
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redisClient.on("error", (err) => {
    console.log("⚠️ Redis Error:", err.message);
  });

  try {
    await redisClient.connect();
  } catch (error) {
    console.log("❌ Redis connection failed");
    redisClient = null;
  }
} else {
  console.log("⚠️ No Redis URL found");
}

export default redisClient;