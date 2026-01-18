const { app } = require("../app");
const {
  require_login_nr,
  block_login_nr,
} = require("../utils/middlewares/check_login");
const { getUser } = require("../handlers/user");
const multer = require("multer");
const {
  getPackages,
  getPackage,
  postPackage,
  deletePackage,
  checkPackageExists,
} = require("../handlers/package");
const {
  getReleases,
  postRelease,
  deleteRelease,
} = require("../handlers/release");
const {
  deleteSessionById,
  verifyUser,
  authUser,
  createSession,
} = require("../handlers/auth");
const { postFile } = require("../utils/buckets/bucket");
const jsonwebtoken = require("jsonwebtoken");

app.get("/api/whoami", require_login_nr, async (req, res) => {
  const parsedUser = {
    Id: req.user.id,
    Username: req.user.username,
    Email: req.user.email,
    CreatedAt: req.user.created_at,
  };
  const user = JSON.stringify(parsedUser);

  res.status(200).json({
    success: true,
    error: null,
    user: btoa(user),
  });
});
app.get("/api/get/name", async (req, res) => {
  const [success, user] = await getUser({
    filter: {
      username: req.query.name,
    },
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    user,
  });
});
app.get("/api/get/email", async (req, res) => {
  const [success, user] = await getUser({
    filter: {
      email: req.query.email,
    },
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    user,
  });
});
app.get("/api/get/projects", require_login_nr, async (req, res) => {
  const [success, packages] = await getPackages({
    filter: {
      userId: req.user.id,
    },
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  const modifiedPackages = packages.map((p) => {
    return {
      ID: p.id,
      UserID: p.userId,
      Name: p.name,
      Description: p.description,
      Docs: p.docs,
      Tags: p.tags,
      CreatedAt: p.created_at,
    };
  });

  res.status(200).json({
    success: true,
    error: null,
    projects: btoa(JSON.stringify(modifiedPackages)),
  });
});
app.get("/api/get/project", async (req, res) => {
  const [exists] = await checkPackageExists({
    name: req.query.name,
  });
  if (!exists) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  const [success, releases] = await getReleases({
    filter: {
      packageName: req.query.name,
    },
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  const modifiedReleases = releases.map((r) => {
    return {
      ID: r.id,
      UserID: r.userId,
      PackageID: r.packageId,
      Url: r.url,
      Release: r.release,
      ZigVersion: r.zig_version,
      Hash: r.hash,
      RootFile: r.root_file,
      CreatedAt: r.created_at,
      UpdatedAt: r.updated_at,
    };
  });

  res.status(200).json({
    success: true,
    error: null,
    releases: btoa(JSON.stringify(modifiedReleases)),
  });
});
app.post("/api/post/project", require_login_nr, async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const payload = JSON.parse(body);
    const [success, package] = await postPackage({
      userId: req.user.id,
      package: payload,
    });

    if (!success) {
      res.status(404).json({
        success: false,
        error: "Creating Failed.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      error: null,
      package,
    });
    return;
  });

  req.on("error", () => {
    res.status(500).json({
      success: false,
      error: "Creating Failed.",
    });
  });
});
app.post(
  "/api/post/release",
  require_login_nr,
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
  }).any(),
  async (req, res) => {
    const packageId = req.body.project_id;
    const [package_success, package, package_error] = await getPackage({
      filter: {
        id: packageId,
      },
    });

    if (!package_success) {
      res.status(404).json({
        success: false,
        error: "Creating failed.",
      });
      return;
    }

    const file = req.files[0];
    const url = await postFile({
      buffer: file.buffer,
      folderName: `packages/${req.user.id}`,
      fileName: `${package.name}-${req.body.release}.tar.zstd`,
    });

    const [success, release] = await postRelease({
      userId: req.user.id,
      packageId,
      release: {
        release: req.body.release,
        hash: req.body.hash,
        zig_version: req.body.zig_version,
        root_file: req.body.root_file,
        url,
      },
    });

    if (!success) {
      res.status(404).json({
        success: false,
        error: "Creating failed Found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      error: null,
      release,
    });
  },
);
app.delete("/api/delete/project", require_login_nr, async (req, res) => {
  const [success, _] = await deletePackage({
    id: req.query.id,
    userId: req.user.id,
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
  });
});
app.delete("/api/delete/release", require_login_nr, async (req, res) => {
  const [success, _] = await deleteRelease({
    id: req.query.id,
    packageId: req.query.project_id,
    userId: req.user.id,
  });

  if (!success) {
    res.status(404).json({
      success: false,
      error: "Not Found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
  });
});
app.get("/api/auth/logout", require_login_nr, async (req, res) => {
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

  res.status(200).json({
    success: true,
    error: null,
  });
});
app.get("/api/auth/verify", require_login_nr, async (req, res) => {
  const email = req.body.email;
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

  const obj = {
    public_session_id: session.id,
    session_secret: session.secret,
    email: session.user.email,
    public_user_id: session.user.id,
    username: session.user.username,
  };

  const jwt = jsonwebtoken.sign(obj, JWT_SECRET);
  res.status(200).json({
    success: false,
    error: null,
    jwt,
  });
});
app.post("/api/auth/login", block_login_nr, async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const payload = JSON.parse(body);
    const email = payload.email;
    const password = payload.password;
    const [success, session, error] = await authUser({
      email,
      password,
    });
    if (!success) {
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
    return;
  });

  req.on("error", () => {
    res.status(500).json({
      success: false,
      error: "Authenticating Failed.",
    });
  });
});
app.post("/api/auth/register", block_login_nr, async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const payload = JSON.parse(body);
    const [verify_success] = await createVerification({
      email: payload.email,
    });
    if (!verify_success) {
      res.status(500).json({
        success: false,
        error: "Creating failed",
      });
      return;
    }

    await mailer({
      email: payload.email,
      templateId: 15,
      parameters: {
        USER_NAME: payload.username,
        CODE: c.code,
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
    return;
  });

  req.on("error", () => {
    res.status(500).json({
      success: false,
      error: "Registering Failed.",
    });
  });
});
