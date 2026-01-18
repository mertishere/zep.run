const crypto = require('crypto')

const nonce_generator = (req, res, next) => {
  res.locals.nonce = crypto.randomBytes(64).toString('hex')
  next()
}

module.exports = {
  nonce_generator,
}
