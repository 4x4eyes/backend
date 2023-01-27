const fs = require("fs/promises");
const fetch = require("node-fetch");
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
  selectGamesByUsername,
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
    .then((userExists) => {
      if (userExists) return selectSingleUser(request.params.username);
      throw userNotFound;
    })
    .then((user) => response.status(200).send({ user }))
    .catch((error) => {
      next(error);
    });
};
exports.postUser = (request, response, next) => {
  if (
    !request.body.username ||
    !checkPositive(Number(request.body.distance_radius))
  )
    return next(badRequest);

  if (Number(request.body.username)) return next(badRequest);

  checkUsernameExists(request.body.username)
    .then((userExists) => {
      if (userExists) throw { code: 400, msg: "username already taken" };
      return insertUser(request.body);
    })
    .then((res) => {
      response.status(201).send({ newUser: res });
    })
    .catch((error) => {
      next(error);
    });
};
exports.patchSingleUser = (request, response, next) => {
  checkUsernameExists(request.params.username)
    .then((userExists) => {
      if (userExists)
        return updateSingleUser(request.params.username, request.body);
      throw userNotFound;
    })
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
    .then((userExists) => {
      if (userExists) return selectUsersWithGames();
      throw userNotFound;
    })
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

      if (usersInRange.length === 0)
        return response.status(200).send({ matches: [] });

      const matches = usersInRange.map(({ username, distance, games }) => {
        return {
          username,
          distance,
          games:
            games[0] === null
              ? []
              : games.map((game) => {
                  let properties = String(game).split("*@");
                  return {
                    name: properties[0],
                    category_slug: properties[1],
                    category_id: properties[2],
                  };
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
    .then((userExists) => {
      if (userExists) return selectSessionsByUsername(username);
      throw userNotFound;
    })
    .then((sessions) => response.status(200).send({ sessions }))
    .catch((error) => {
      next(error);
    });
};
exports.postSession = (request, response, next) => {
  const user_a_name = request.body.user_a_name;
  const user_b_name = request.body.user_b_name;
  checkSessionWithUsersExists(user_a_name, user_b_name)
    .then((sessionExists) => {
      if (sessionExists) throw sessionExistsError;
      return insertSession(user_a_name, user_b_name);
    })
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
    .then((sessionExists) => {
      if (sessionExists) return selectMessagesBySessionId(session_id);
      throw sessionNotFound;
    })
    .then((messages) => {
      response.status(200).send({ messages });
    })
    .catch((error) => {
      next(error);
    });
};
exports.postMessage = (request, response, next) => {
  const session_id = request.params.session_id;

  if (!request.body.message_body) return next(badRequest);

  checkSessionIdExists(session_id)
    .then((sessionExists) => {
      if (sessionExists)
        return checkUserInSession(session_id, request.body.author_name);
      throw sessionNotFound;
    })
    .then((isInSession) => {
      if (isInSession) return insertMessage(session_id, request.body);
      throw badRequest;
    })
    .then((message) => {
      response.status(201).send({ message });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getGamesByUsername = (request, response, next) => {
  const username = request.params.username;
  checkUsernameExists(username)
    .then((userExists) => {
      if (userExists) return selectGamesByUsername(username);
      throw userNotFound;
    })
    .then((games) => {
      response.status(200).send({ games });
    })
    .catch((error) => next(error));
};
