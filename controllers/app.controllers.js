const { insertUser, checkUsernameExists } = require("../models/app.models");
const { checkPositive } = require("../utils/utils");

exports.getRoot = (request, response, next) => {
  response.status(200).send({ msg: "connected" });
};

exports.postUser = (request, response, next) => {
  if (!checkPositive(parseInt(request.body.distance_radius))) {
    let error = { code: 400, msg: "bad request" };
    next(error);
  } else {
    checkUsernameExists(request.body.username)
      .then(() => {
        return insertUser(request.body);
      })
      .then((res) => {
        response.status(201).send({ newUser: res });
      })
      .catch((error) => {
        next(error);
      });
  }
};