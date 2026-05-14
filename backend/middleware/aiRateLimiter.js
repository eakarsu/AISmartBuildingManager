import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? 'user:' + (req.user.id || req.user.userId) : req.ip;
  },
  message: {
    error: 'AI rate limit exceeded. Max 20 requests per hour.',
  },
});
