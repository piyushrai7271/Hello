const rateLimitHandler = (req, res, options) => {
  return res.status(429).json({
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    message:
      options.message || "Too many requests, please try again later.",

    // safer fallback values
    retryAfter: res.getHeader("Retry-After") || null,
    limit: res.getHeader("RateLimit-Limit") || null,
    remaining: res.getHeader("RateLimit-Remaining") || 0,
    resetAt: res.getHeader("RateLimit-Reset") || null,
  });
};

export default rateLimitHandler;