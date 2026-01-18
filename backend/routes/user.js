const { app } = require("../app");
const { getUser } = require("../handlers/user");
const { require_login_nr } = require("../utils/middlewares/check_login");

app.get("/api/v1/user", require_login_nr, async (req, res) => {
  const [user_success, user, user_error] = await getUser({
    filter: {
      id: req.query.id,
      username: req.query.username,
      email: req.query.email,
    },
  });

  if (!user_success) {
    res.status(404).json({
      success: false,
      error: "User not found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    user,
  });
});
