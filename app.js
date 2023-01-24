const express = require("express");
const {
  getRoot,
  postUser,
  getSingleUser,
} = require("./controllers/app.controllers");
const {
  handle404Paths,
  handle500Error,
  handleSqlError,
  handleCustomError,
} = require("./controllers/error.controllers");

const app = express();
app.use(express.json());

app.get("/", getRoot);
app.get("/api/users/:username", getSingleUser);

app.post("/api/users", postUser);

app.get("*", handle404Paths);

app.use(handleSqlError);
app.use(handleCustomError);
app.use(handle500Error);

module.exports = app;
