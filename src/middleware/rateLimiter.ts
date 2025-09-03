import rateLimit from "express-rate-limit";

const windowMin = process.env.RATE_LIMIT_WINDOW_MIN
  ? Number(process.env.RATE_LIMIT_WINDOW_MIN)
  : 60;
const freeMax = process.env.RATE_LIMIT_MAX_FREE
  ? Number(process.env.RATE_LIMIT_MAX_FREE)
  : 20;

export const captionRateLimiter = rateLimit({
  windowMs: windowMin * 60 * 1000,
  max: freeMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please upgrade to Pro or try again later.",
  },
});
