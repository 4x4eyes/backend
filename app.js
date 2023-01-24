const express = require("express");
const { getRoot, postUser } = require("./controllers/app.controllers");
const {
  handle404Paths,
  handle500Error,
} = require("./controllers/error.controllers");

const app = express();
app.use(express.json());

app.get("/", getRoot);

app.post("/api/users", postUser);

app.get("*", handle404Paths);

app.use(handle500Error);

module.exports = app;
