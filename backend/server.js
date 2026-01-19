require("module-alias/register");

const cors = require("cors");
const express = require("express");
const { app } = require("./app.js");

const cookie_parser = require("cookie-parser");
const compression = require("compression");

app.set("trust proxy", true);
app.use(
  express.urlencoded({ limit: "25mb", extended: true, parameterLimit: 1000 }),
);
app.use(express.json());
app.use(compression({ level: 9 }));
app.use(cookie_parser());

// security middlewares
const {
  set_security_headers,
  custom_rate_limiter,
} = require("./security/basic");
app.use(set_security_headers);
app.use(custom_rate_limiter(30, 60));

const { nonce_generator } = require("./security/nonce");
app.use(nonce_generator);

const allowed_origins = ["http://localhost:5000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowed_origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const { csp_middleware } = require("./security/csp");
app.use(csp_middleware);

const {
  getPackages,
  getPackage,
  countPackages,
  getLocalPackages,
  getLocalPackage,
} = require("./handlers/package.js");
const { countUsers } = require("./handlers/user.js");

const { authenticate_cookies } = require("./utils/middlewares/authentication");
app.use(authenticate_cookies);

require("./routes/legacy.js");
require("./routes/auth.js");
require("./routes/package.js");
require("./routes/release.js");
require("./routes/user.js");

app.get("/health", async (req, res) => {
  res.status(200).json({
    success: true,
    error: null,
  });
});

app.get("/", async (req, res) => {
  const [p_success, packages_count] = await countPackages();
  const [u_success, users_count] = await countUsers();
  res.render("pages/index.ejs", {
    users_count,
    packages_count,
  });
});

app.get("/packages", async (req, res) => {
  let query = req.query.query;
  if (query?.length == 0) query = null;
  const [success, packages] = await getPackages({
    filter: {
      query: query,
    },
  });

  const [_, localPackages] = await getLocalPackages({});

  res.render("pages/packages.ejs", {
    packages,
    localPackages,
    query,
  });
});

const fs = require("fs");
app.get("/packages/:id", async (req, res) => {
  const name = req.params.id;
  if (name == undefined) {
    res.status(400).json({
      success: false,
      error: "invalid name.",
    });
    return;
  }

  if (name.includes("../")) {
    res.status(400).json({
      success: false,
      error: null,
    });
    return;
  }

  if (name.endsWith(".json")) {
    fs.readFile(`static/packages/${name}`, "utf8", (err, jsonString) => {
      const static_package = JSON.parse(jsonString);
      res.json(static_package);
    });
    return;
  }

  const [success, _package] = await getPackage({
    filter: {
      name,
    },
  });

  res.render("pages/package.ejs", {
    package: _package,
  });
});

app.get("/packages/s/:id", async (req, res) => {
  const [success, _package] = await getLocalPackage({
    name: req.params.id,
  });

  res.render("pages/localPackage.ejs", {
    package: _package,
  });
});

console.log("listening on port 8080");
app.listen(8080);
