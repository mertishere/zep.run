const rate_limit = require('express-rate-limit')

const custom_rate_limiter = (time_in_seconds, max_requests) => {
  return rate_limit({
    windowMs: time_in_seconds * 1000,
    max: max_requests,
    store: new rate_limit.MemoryStore(),
    message: 'Too many excessive requests... Please calm down a lil. Try again (in ~10s).',
    keyGenerator: (req) => {
      return `web_${req.ip}`
    },
  })
}

const set_security_headers = (req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('X-Frame-Options', 'DENY')
  next()
}

module.exports = {
  set_security_headers,
  custom_rate_limiter,
}
