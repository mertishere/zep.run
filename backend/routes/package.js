const { app } = require("../app");
const { require_login_nr } = require("../utils/middlewares/check_login");
const {
  postPackage,
  patchPackage,
  getPackage,
  getPackages,
  deletePackage,
  checkPackageExists,
} = require("../handlers/package");

app.get("/api/v1/package", async (req, res) => {
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

  const [success, package, error] = await getPackage({
    filter: {
      name: req.query.name,
      id: req.query.id,
    },
  });
  if (!success) {
    res.status(500).json({
      success: false,
      error: error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    package,
  });
});

app.get("/api/v1/packages", async (req, res) => {
  const query = req.query.query;
  if (query == undefined && req.user == undefined) {
    res.status(401).json({
      success: false,
      error: "Not Authenticated.",
    });
    return;
  }

  const [success, packages, error] = await getPackages({
    filter: {
      userId: query == undefined ? req.user?.id : undefined,
      query: query == undefined ? null : query,
    },
    take: Number(req.query.take ?? 30),
    skip: Number(req.query.skip ?? 0),
  });

  if (!success) {
    res.status(500).json({
      success: false,
      error: error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    packages,
  });
});

app.post("/api/v1/package", require_login_nr, async (req, res) => {
  const [success, package, error] = await postPackage({
    userId: req.user.id,
    package: req.body.package,
  });
  if (!success) {
    res.status(500).json({
      success: false,
      error: error,
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
    package,
  });
});

app.patch("/api/v1/package", require_login_nr, async (req, res) => {
  const [success] = await patchPackage({
    id: req.body.id,
    userId: req.user.id,
    package: req.body.package,
  });
  if (!success) {
    res.status(500).json({
      success: false,
      error: "Updating failed",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
  });
});

app.delete("/api/v1/package", require_login_nr, async (req, res) => {
  const [success] = await deletePackage({
    id: req.query.id,
    userId: req.user.id,
  });
  if (!success) {
    res.status(500).json({
      success: false,
      error: "Deleting failed",
    });
    return;
  }

  res.status(200).json({
    success: true,
    error: null,
  });
});
