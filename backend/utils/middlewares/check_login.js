const block_login_nr = (req, res, next) => {
  if (req.user) {
    return res.status(400).json({
      success: false,
      error: "already logged in.",
    });
  }
  next();
};

const block_login_r = (req, res, next) => {
  if (req.user) {
    res.redirect(`/`);
    return;
  }
  next();
  return;
};

const require_login_nr = (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({
      success: false,
      error: "not logged in.",
    });
  }
  next();
};

const require_login_r = (req, res, next) => {
  if (!req.user) {
    res.redirect(`/`);
    return;
  }
  next();
  return;
};

module.exports = {
  block_login_nr,
  block_login_r,

  require_login_nr,
  require_login_r,
};
