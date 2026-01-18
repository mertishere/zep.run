require("dotenv").config();
const jsonwebtoken = require("jsonwebtoken");

const invalid_authentication = (req, res) => {
  res.clearCookie("token");
  rendering_setter(req, res);
  return;
};

// revalidates session, if the authentication was invalid
const { getSession } = require("../../handlers/auth");
const { getUser } = require("../../handlers/user");
const validateSession = async (secret, id, userId) => {
  return await getSession({ secret, id, userId });
};

// sets default rendering data
const rendering_setter = async (req, res) => {
  let original_render = res.render;
  res.render = function (view, options, callback) {
    options = Object.assign({}, options, {
      nonce: res.locals.nonce,
      user: req.user,
      logged_in: req.user != null,
    });
    original_render.call(this, view, options, callback);
  };
};

const authenticate_cookies = async (req, res, next) => {
  let jwt = "";
  const authorization = req.headers.authorization;
  if (authorization != undefined) {
    const split = authorization.split(" ");
    if (split.length == 2) {
      const key = split[0].trim();
      if (key == "Bearer") {
        const value = split[1].trim();
        jwt = value;
      }
    }
  }

  if (jwt.length == 0) {
    const cookies = req.cookies;
    const token = cookies["token"];
    if (token == null) {
      invalid_authentication(req, res);
      next();
      return;
    }
    jwt = token;
  }

  try {
    const v = jsonwebtoken.verify(jwt, process.env.JWT);
    if (!v) {
      invalid_authentication(req, res);
      next();
      return;
    }

    const secret = v.session_secret;
    const id = v.public_session_id;
    const userId = v.public_user_id;
    const [validated, session] = await validateSession(secret, id, userId);
    if (!validated) {
      invalid_authentication(req, res);
      next();
      return;
    }

    const [user_success, user] = await getUser({
      filter: {
        id: userId,
      },
    });
    if (!user_success) {
      invalid_authentication(req, res);
      next();
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    };

    rendering_setter(req, res);
    next();
    return;
  } catch (err) {
    console.log(err);
    invalid_authentication(req, res);
    next();
    return;
  }
};

module.exports = {
  authenticate_cookies,
};
