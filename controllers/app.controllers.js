const {
  insertUser,
  checkUsernameExists,
  selectSingleUser,
  updateSingleUser,
} = require("../models/app.models");
const { checkPositive } = require("../utils/utils");

const userNotFound = { code: 404, msg: "user not found" };

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
      .then((userExists) =>
        userExists
          ? next({ code: 400, msg: "username already taken" })
          : insertUser(request.body)
      )
      .then((res) => {
        response.status(201).send({ newUser: res });
      })
      .catch((error) => {
        next(error);
      });
  }
};

exports.getSingleUser = (request, response, next) => {
  checkUsernameExists(request.params.username)
    .then((userExists) =>
      userExists
        ? selectSingleUser(request.params.username)
        : next(userNotFound)
    )
    .then((user) => response.status(200).send({ user }))
    .catch((error) => {
      next(error);
    });
};

exports.patchSingleUser = (request, response, next) => {
  checkUsernameExists(request.params.username)
    .then((userExists) =>
      userExists
        ? updateSingleUser(request.params.username, request.body)
        : next(userNotFound)
    )
    .then((newUser) => response.status(202).send({ newUser }))
    .catch((error) => {
      next(error);
    });
};
