const { insertUser, checkUsernameExists } = require("../models/app.models");

exports.getRoot = (request, response, next) => {
  response.status(200).send({ msg: "connected" });
};

exports.postUser = (request, response, next) => {
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
};
