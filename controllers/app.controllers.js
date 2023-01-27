const { response } = require("express");
const fs = require("fs/promises");
const messages = require("../db/data/test-data/messages.js");
const { gMapKey } = require("../key.js");
const {
  insertUser,
  checkUsernameExists,
  selectSingleUser,
  updateSingleUser,
  selectUsersWithGames,
  selectSessionsByUsername,
  insertSession,
  checkSessionIdExists,
  checkSessionWithUsersExists,
  selectMessagesBySessionId,
  checkUserInSession,
  insertMessage,
} = require("../models/app.models");
const { checkPositive, makeAddressString } = require("../utils/utils");

const userNotFound = { code: 404, msg: "user not found" };
const sessionExistsError = { code: 400, msg: "session already exists" };
const sessionNotFound = { code: 404, msg: "session not found" };
const badRequest = { code: 400, msg: "bad request" };

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
    .then((userExists) =>
      userExists ? selectUsersWithGames() : next(userNotFound)
    )
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

      const matches = usersInRange.map(({ username, distance, games }) => {
        return {
          username,
          distance,
          games: games.map((game) => {
            fields = game.split("*@");
            return { name: fields[0], category_slug: fields[1], category_id: fields[2] };
          }),
        };
      });

      response.status(200).send({ matches });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getSessionsByUsername = (request, response, next) => {
  const username = request.params.username;

  checkUsernameExists(username)
    .then((userExists) =>
      userExists ? selectSessionsByUsername(username) : next(userNotFound)
    )
    .then((sessions) => response.status(200).send({ sessions }))
    .catch((error) => {
      next(error);
    });
};
exports.postSession = (request, response, next) => {
  const user_a_name = request.body.user_a_name;
  const user_b_name = request.body.user_b_name;
  checkSessionWithUsersExists(user_a_name, user_b_name)
    .then((sessionExists) =>
      sessionExists
        ? next(sessionExistsError)
        : insertSession(user_a_name, user_b_name)
    )
    .then((session) => {
      response.status(201).send({ session });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getMessagesBySessionId = (request, response, next) => {
  const session_id = request.params.session_id;
  checkSessionIdExists(session_id)
    .then((sessionExists) =>
      sessionExists
        ? selectMessagesBySessionId(session_id)
        : next(sessionNotFound)
    )
    .then((messages) => {
      response.status(200).send({ messages });
    })
    .catch((error) => {
      next(error);
    });
};
exports.postMessage = (request, response, next) => {
  const session_id = request.params.session_id;

  if (!request.body.message_body) next(badRequest);

  checkSessionIdExists(session_id)
    .then((sessionExists) =>
      sessionExists
        ? checkUserInSession(session_id, request.body.author_name)
        : next(sessionNotFound)
    )
    .then((isInSession) =>
      isInSession ? insertMessage(session_id, request.body) : next(badRequest)
    )
    .then((message) => {
      response.status(201).send({ message });
    })
    .catch((error) => {
      next(error);
    });
};
