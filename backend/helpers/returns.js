const ok = (data = null) => [true, data, null];
const fail = (message, data = null) => [false, data, message];

module.exports = {
  ok,
  fail,
};
