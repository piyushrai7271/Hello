import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";
import ApiResponse from "../utils/ApiResponse.js";



// COMMON HANDLER
const rateLimitHandler = (message) => {
  return (req, res) => {
    return res.status(429).json(
      new ApiResponse(
        429,
        null,
        message,
      ),
    );
  };
};



// REDIS STORE
const createRedisStore = (prefix) => {
  // fallback to memory store if redis unavailable
  if (!redisClient) return undefined;

  return new RedisStore({
    sendCommand: (...args) =>
      redisClient.sendCommand(args),

    prefix,
  });
};



// KEY GENERATORS

// LOGIN LIMIT
// email + ip
const loginKeyGenerator = (req) => {
  const email =
    req.body?.email
      ?.trim()
      ?.toLowerCase() || "unknown";

  return `${ipKeyGenerator(req.ip)}-${email}`;
};


// AUTHENTICATED USER LIMIT
const userKeyGenerator = (req) => {
  return req.userId || ipKeyGenerator(req.ip);
};




// GLOBAL LIMITER
const globalRateLimiter = rateLimit({
  store: createRedisStore("global-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) => {
    if (req.path === "/health") {
      return true;
    }

    if (req.headers["x-internal-api"] === "true") {
      return true;
    }

    return false;
  },

  handler: rateLimitHandler(
    "Too many requests. Please try again later.",
  ),
});




// LOGIN LIMITER
const authRateLimiter = rateLimit({
  store: createRedisStore("login-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 5,

  skipSuccessfulRequests: true,

  keyGenerator: loginKeyGenerator,

  standardHeaders: true,
  legacyHeaders: false,

  handler: rateLimitHandler(
    "Too many login attempts. Please try again later.",
  ),
});




// USER LIMITER
const userRateLimiter = rateLimit({
  store: createRedisStore("user-limit:"),

  windowMs: 15 * 60 * 1000,
  max: 200,

  keyGenerator: userKeyGenerator,

  standardHeaders: true,
  legacyHeaders: false,

  handler: rateLimitHandler(
    "Too many requests. Please slow down.",
  ),
});



export {
  globalRateLimiter,
  authRateLimiter,
  userRateLimiter,
};