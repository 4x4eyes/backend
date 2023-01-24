const { insertUser } = require("../models/app.models");

exports.getRoot = (request, response, next) => {
  response.status(200).send({ msg: "connected" });
};

exports.postUser = (request, response, next) => {
  insertUser(request.body)
    .then((res) => {
      response.status(201).send({ newUser: res });
    })
    .catch((error) => {
      console.log(error);
    });
};
