const express = require("express");
const { getRoot } = require("./controllers/app.controllers");
const { handle404Paths } = require("./controllers/error.controllers");

const app = express();
app.get("/", getRoot);

app.get("*", handle404Paths);

module.exports = app;
