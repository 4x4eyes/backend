const express = require("express");
const {
  getEndpoints,
  getSingleUser,
  postUser,
  patchSingleUser,
  getMatches,
  getSessionsByUsername,
  postSession,
  getMessagesBySessionId,
} = require("./controllers/app.controllers");
const {
  handle404Paths,
  handle500Error,
  handleSqlError,
  handleCustomError,
} = require("./controllers/error.controllers");

const app = express();
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/users/:username", getSingleUser);
app.post("/api/users", postUser);
app.patch("/api/users/:username", patchSingleUser);

app.get("/api/matches/:username", getMatches);

app.get("/api/sessions/:username", getSessionsByUsername);
app.post("/api/sessions", postSession)

app.get("/api/messages/:session_id", getMessagesBySessionId);

app.get("*", handle404Paths);

app.use(handleSqlError);
app.use(handleCustomError);
app.use(handle500Error);

module.exports = app;
