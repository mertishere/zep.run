const { app } = require("../app");
const { require_login_nr } = require("../utils/middlewares/check_login");
const {
  postRelease,
  patchRelease,
  getRelease,
  getReleases,
  deleteRelease,
} = require("../handlers/release");
const { postFile, deleteFile } = require("../utils/buckets/bucket");
const multer = require("multer");
const { getPackage } = require("../handlers/package");

app.get("/api/v1/release", require_login_nr, async (req, res) => {
  const [success, release, error] = await getRelease({
    packageName: req.query.package_name,
    release: req.query.release,
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
    release,
  });
});

app.get("/api/v1/releases", async (req, res) => {
  const package_id = req.query.package_id;
  const package_name = req.query.package_name;

  const [success, releases, error] = await getReleases({
    filter: {
      userId: package_name == null ? req.user.id : null,
      packageId: package_id,
      packageName: package_name,
    },
    take: Number(req.query.take ?? 10),
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
    releases,
  });
});

app.post(
  "/api/v1/release",
  require_login_nr,
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
  }).any(),
  async (req, res) => {
    if (req.files.length < 0) {
      console.error("No File");
      res.status(400).json({
        success: false,
        error: "No File Uploaded.",
      });
      return;
    }

    const [package_success, package, package_error] = await getPackage({
      filter: {
        id: req.body.package_id,
      },
      take: Number(req.query.take ?? 10),
      skip: Number(req.query.skip ?? 0),
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

    let r = {
      release: req.body.release,
      hash: req.body.hash,
      zig_version: req.body.zig_version,
      root_file: req.body.root_file,
      url,
    };

    const [success, release, error] = await postRelease({
      userId: req.user.id,
      packageId: req.body.package_id,
      release: r,
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
      release,
    });
  },
);

app.patch("/api/v1/release", require_login_nr, async (req, res) => {
  const [success] = await patchRelease({
    id: req.body.id,
    userId: req.user.id,
    release: req.body.release,
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

app.delete("/api/v1/release", require_login_nr, async (req, res) => {
  const [success] = await deleteRelease({
    id: req.query.id,
    packageId: req.query.package_id,
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
