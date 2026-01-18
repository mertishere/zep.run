const err = (statuscode, message, next) => {
  let err = new Error(message)
  err.status = statuscode
  next(err)
}

module.exports = {
  err,
}
