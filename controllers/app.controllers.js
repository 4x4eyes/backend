const fs = require("fs/promises");
const { gMapKey } = require("../utils/key.js");
const {
  insertUser,
  checkUsernameExists,
  selectSingleUser,
  updateSingleUser,
  selectUsers,
} = require("../models/app.models");
const { checkPositive, makeAddressString } = require("../utils/utils");

const userNotFound = { code: 404, msg: "user not found" };

exports.getEndpoints = (request, response, next) => {
  fs.readFile(__dirname + "/../endpoints.json", "utf8").then((endpoints) =>
    response.status(200).send({ endpoints: JSON.parse(endpoints) })
  );
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

exports.getMatches = (request, response, next) => {
  const username = request.params.username;

  let searchUser;
  let otherUsers;

  checkUsernameExists(username)
    .then((userExists) => (userExists ? selectUsers() : next(userNotFound)))
    .then((allUsers) => {
      searchUser = allUsers.find((user) => user.username === username);
      otherUsers = allUsers.filter((user) => user.username !== username);
      const originString = makeAddressString(searchUser);

      const mapPromises = otherUsers.map((potentialMatch) => {
        const destinationString = makeAddressString(potentialMatch);

        return fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationString}&origins=${originString}&key=${gMapKey}`
        );
      });

      return Promise.all(mapPromises);
    })
    .then((gMapResponses) => {
      const parsePromises = gMapResponses.map((gMapResponse) =>
        gMapResponse.json()
      );

      return Promise.all(parsePromises);
    })
    .then((matchDistances) => {
      for (let i = 0; i < otherUsers.length; i++) {
        otherUsers[i].distance =
          matchDistances[i].rows[0].elements[0].distance.text;
      }

      const usersInRange = otherUsers.filter(
        (otherUser) =>
          Number(otherUser.distance.slice(0, -3)) <
          otherUser.distance_radius + searchUser.distance_radius
      );

      const matches = usersInRange.map(({ username, distance }) => {
        return {
          username,
          distance,
        };
      });

      response.status(200).send({ matches });
    })
    .catch((error) => {
      next(error);
    });
};
