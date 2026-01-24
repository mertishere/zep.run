const jsonwebtoken = require("jsonwebtoken");
const { app } = require("../app");
const {
  authUser,
  deleteSessionById,
  createVerification,
  verifyUser,
  createSession,
} = require("../handlers/auth");
const { mailer } = require("../utils/mail/mailer");
const { getUser } = require("../handlers/user");
const {
  block_login_nr,
  require_login_nr,
} = require("../utils/middlewares/check_login");

app.get("/api/v1/whoami", require_login_nr, async (req, res) => {
  res.status(200).json({
    success: true,
    error: null,
    user: req.user,
  });
});

app.post("/api/v1/login", block_login_nr, async (req, res) => {
  const e = req.body.email;
  const email = e.toLowerCase();

  const password = req.body.password;
  const [success, session, error] = await authUser({
    email,
    password,
  });
  if (!success) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error,
    });
    return;
  }

  let thirty_days_milliseconds = 30 * 24 * 60 * 60 * 1000;
  const obj = {
    public_session_id: session.id,
    session_secret: session.secret,
    email: session.user.email,
    public_user_id: session.user.id,
    username: session.user.username,
  };

  const jwt = jsonwebtoken.sign(obj, process.env.JWT);
  res.cookie("token", jwt, {
    maxAge: Date.now() + thirty_days_milliseconds,
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    success: true,
    error: null,
    jwt,
  });
});

app.post("/api/v1/register", block_login_nr, async (req, res) => {
  const e = req.body.email;
  const email = e.toLowerCase();

  const [verify_success, verify] = await createVerification({
    email,
  });
  if (!verify_success) {
    res.status(500).json({
      success: false,
      error: "Creating failed",
    });
    return;
  }

  await mailer({
    email,
    templateId: 15,
    parameters: {
      USER_NAME: req.body.username,
      CODE: verify.code,
    },
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Email transport failed.",
    });
    return;
  });

  res.status(200).json({
    success: true,
    error: null,
  });
});

app.post("/api/v1/verify", block_login_nr, async (req, res) => {
  const e = req.body.email;
  const email = e.toLowerCase();

  const code = req.body.code;
  const [verify_success, verified_user, verify_error] = await verifyUser({
    email: email,
    code: code,
  });
  if (!verify_success) {
    res.status(500).json({
      success: false,
      error: verify_error,
    });
    return;
  }

  const [session_success, session, session_error] = await createSession({
    id: verified_user.id,
  });
  if (!session_success) {
    res.status(500).json({
      success: false,
      error: session_error,
    });
    return;
  }

  let thirty_days_milliseconds = 30 * 24 * 60 * 60 * 1000;
  const obj = {
    public_session_id: session.id,
    session_secret: session.secret,
    email: session.user.email,
    public_user_id: session.user.id,
    username: session.user.username,
  };

  const jwt = jsonwebtoken.sign(obj, process.env.JWT);
  res.cookie("token", jwt, {
    maxAge: Date.now() + thirty_days_milliseconds,
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    success: false,
    error: null,
    jwt,
  });
});

app.get("/api/v1/logout", require_login_nr, async (req, res) => {
  const [success, _] = await deleteSessionById({
    id: req.user.session_id,
  });
  if (!success) {
    res.status(500).json({
      success: false,
      error: "Logging out failed.",
    });
    return;
  }

  res.clearCookie("token");
  res.status(200).json({
    success: true,
    error: null,
  });
});

app.post("/api/v1/forgot", block_login_nr, async (req, res) => {
  const e = req.body.email;
  let email = e.toLowerCase();

  const [success, _] = await getUser({
    filter: {
      email,
    },
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "No Users was found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
  });
});
