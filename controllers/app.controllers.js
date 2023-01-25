const e = require("express");
const {
  insertUser,
  checkUsernameExists,
  selectSingleUser,
} = require("../models/app.models");
const { checkPositive } = require("../utils/utils");

exports.getRoot = (request, response, next) => {
  response.status(200).send({ msg: "connected" });
};

exports.postUser = (request, response, next) => {
  if (!request.body.username) {
    let error = { code: 400, msg: "bad request" };
    next(error);
  }

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

exports.getSingleUser = (request, response, next) => {
  selectSingleUser(request.params.username)
    .then((user) => response.status(200).send({ user }))
    .catch((error) => {
      next(error);
    });
};
