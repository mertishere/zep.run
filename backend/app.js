require("module-alias/register");
require("dotenv").config();

const express = require("express");
const app = express();
const app_locals = require("./helpers/app_locals");
app.locals = app_locals;

app.set("view engine", "ejs");
app.set("views", "frontend/views");
app.use("/", express.static("frontend/public"));
app.use("/install.ps1", express.static("static/install/install.ps1"));
app.use("/install.sh", express.static("static/install/install.sh"));
app.use("/releases", express.static("static/releases"));
app.use("/download.json", express.static("static/download.json"));
app.use("/robots.txt", express.static("robots.txt"));

module.exports = {
  app,
};
