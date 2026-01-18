require("dotenv").config();
const helmet = require("helmet");

const csp_middleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    frameAncestors: ["'self'"],

    // ! dont even trust yourself -- nonce ftw
    scriptSrc: [
      /* "'self'", */ (req, res) => `'nonce-${res.locals.nonce}'`,
      "https://eu-assets.i.posthog.com",
    ],
    scriptSrcAttr: ["'self'", "'unsafe-inline'"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://www.gstatic.com",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: [
      "'self'",
      "https://eu-assets.i.posthog.com",
      "https://eu.i.posthog.com",
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'"],
    workerSrc: ["'self'", "'unsafe-inline'"],
    childSrc: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
});

module.exports = {
  csp_middleware,
};
