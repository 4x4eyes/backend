const db = require("../db/connection");
const fs = require("fs/promises");

const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const { time } = require("console");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("GET /api", () => {
  it("responds with the contents of endpoints.json", () => {
    const appPromise = request(app).get("/api").expect(200);
    const filePromise = fs.readFile(__dirname + "/../endpoints.json", "utf8");

    return Promise.all([appPromise, filePromise]).then(
      ({ endpoints }, file) => {
        expect(endpoints).toEqual(file);
      }
    );
  });

  it("responds with an object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(typeof endpoints).toBe("object");
      });
  });
});

describe("handles 404", () => {
  it("returns 404 when requested endpoint is not found", () => {
    return request(app)
      .get("/splorgle/cheese")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("path not found");
      });
  });
});

describe("GET /api/users/:username", () => {
  it("responds status 200 and a single user object", () => {
    return request(app)
      .get("/api/users/Dave")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual(
          expect.objectContaining({
            username: "Dave",
            avatar_url: "",
            first_name: "Dave",
            last_name: "Dave",
            dob: "1980-01-01",
            street_address: "3 New Street",
            city: "Neston",
            postcode: "CH640TF",
            county: "Cheshire",
            country: "UK",
            distance_radius: 10,
            email: "Dave@dave.dave",
            phone_number: "01234567890",
          })
        );
      });
  });

  it("returns 404 when given a username not in the database", () => {
    return request(app)
      .get("/api/users/Geraldine")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });

  it("returns 404 when given a username that is a number", () => {
    return request(app)
      .get("/api/users/20")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });
});
describe("POST /api/users", () => {
  const postUser = {
    username: "Nathan",
    avatar_url: "",
    first_name: "Nathan",
    last_name: "Rowan",
    dob: "1998-05-23",
    street_address: "38 Artillery Place",
    city: "London",
    postcode: "SE184EP",
    county: "Greater London",
    country: "UK",
    distance_radius: 1000,
    email: "Nathan@nathan.nathaniel",
    phone_number: "75328075809",
  };

  it("returns a status 201: created", () => {
    return request(app).post("/api/users").send(postUser).expect(201);
  });

  it("returns the newly created object", () => {
    return request(app)
      .post("/api/users")
      .send(postUser)
      .expect(201)
      .then(({ body: { newUser } }) => {
        expect(newUser).toEqual(
          expect.objectContaining({
            username: "Nathan",
            avatar_url: "",
            first_name: "Nathan",
            last_name: "Rowan",
            dob: "1998-05-23",
            street_address: "38 Artillery Place",
            city: "London",
            postcode: "SE184EP",
            county: "Greater London",
            country: "UK",
            distance_radius: 1000,
            email: "Nathan@nathan.nathaniel",
            phone_number: "75328075809",
          })
        );
      });
  });

  it("returns 400 status when passed an object with missing data", () => {
    const missingDataPostUser = {
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: "1000",
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(missingDataPostUser)
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe("bad request"));
  });

  it("returns 400 status when passed nothing", () => {
    return request(app)
      .post("/api/users")
      .send()
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe("bad request"));
  });

  it("returns 400 status when passed an object with a bad data type", () => {
    const badDataTypeUser = {
      username: "Nathan",
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: "loads",
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app).post("/api/users").send(badDataTypeUser).expect(400);
  });

  it("returns 400 status when passed a user name that already exists in the database", () => {
    const duplicateUser = {
      username: "geoff",
      avatar_url: "",
      first_name: "Geoff",
      last_name: "Geoff",
      dob: "1980-01-01",
      street_address: "250 Heath Road",
      city: "Bebington",
      postcode: "CH632HQ",
      county: "Merseyside",
      country: "UK",
      distance_radius: 10,
      email: "Geoff@geoff.geoff",
      phone_number: "01234567890",
    };

    return request(app)
      .post("/api/users")
      .send(duplicateUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username already taken");
      });
  });

  it("returns 400 when passed an object with a bad key", () => {
    const badKeyUser = {
      username: "Nathan",
      avatar_url: "",
      first_name: "Nathan",
      last_rame: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: 1000,
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(badKeyUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("returns 400 when passed a distance radius with a negative number", () => {
    const negativeUser = {
      username: "Nathan",
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: -1000,
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(negativeUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("returns 400 when passed a distance radius of infinity", () => {
    const infiniteUser = {
      username: "Nathan",
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: Infinity,
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(infiniteUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("returns 400 when given a username that is a number", () => {
    const numUser = {
      username: "20",
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Rowan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: 1000,
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(numUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
describe("PATCH /api/users/:username", () => {
  it("allows a user to change their avatar URL", () => {
    const avatarUpdate = {
      avatar_url:
        "https://static.wikia.nocookie.net/yogscast/images/b/b8/Filfy_Geoff.jpg/revision/latest/scale-to-width-down/250?cb=20160512134600",
    };
    return request(app)
      .patch("/api/users/Geoff")
      .send(avatarUpdate)
      .expect(202)
      .then(({ body: { newUser } }) => {
        expect(newUser.avatar_url).toBe(avatarUpdate.avatar_url);
      });
  });

  it("allows a user to change their street address", () => {
    const streetUpdate = {
      street_address: "7 Hill Rise",
    };
    return request(app)
      .patch("/api/users/Geoff")
      .send(streetUpdate)
      .expect(202)
      .then(({ body: { newUser } }) => {
        expect(newUser.street_address).toBe(streetUpdate.street_address);
      });
  });

  it("does not allow a user to change their username", () => {
    const usernameUpdate = {
      username: "superGeofff123",
    };

    return request(app)
      .patch("/api/users/Geoff")
      .send(usernameUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("doest not allow a user to change their dob", () => {
    const dobUpdate = {
      dob: "1900-01-01",
    };

    return request(app)
      .patch("/api/users/Geoff")
      .send(dobUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("can update multiple rows in the user table", () => {
    const mutliUpdate = {
      street_address: "7 Hill Rise",
      city: "Heathfield",
      postcode: "TN218LU",
      county: "",
    };
    return request(app)
      .patch("/api/users/Geoff")
      .send(mutliUpdate)
      .expect(202)
      .then(({ body: { newUser } }) => {
        expect(newUser).toEqual(
          expect.objectContaining({
            username: "Geoff",
            avatar_url: "",
            first_name: "Geoff",
            last_name: "Geoff",
            dob: "1980-01-01",
            street_address: "7 Hill Rise",
            city: "Heathfield",
            postcode: "TN218LU",
            county: "",
            country: "UK",
            distance_radius: 10,
            email: "Geoff@geoff.geoff",
            phone_number: "01234567890",
          })
        );
      });
  });

  it("rejects non changeable fields when passed mutliple updates", () => {
    const mutliUpdate = {
      username: "superGeoff",
      potato: "yes",
      street_address: "7 Hill Rise",
      city: "Heathfield",
      postcode: "TN218LU",
      county: "",
    };

    return request(app)
      .patch("/api/users/Geoff")
      .send(mutliUpdate)
      .expect(202)
      .then(({ body: { newUser } }) => {
        expect(newUser).toEqual(
          expect.objectContaining({
            username: "Geoff",
            avatar_url: "",
            first_name: "Geoff",
            last_name: "Geoff",
            dob: "1980-01-01",
            street_address: "7 Hill Rise",
            city: "Heathfield",
            postcode: "TN218LU",
            county: "",
            country: "UK",
            distance_radius: 10,
            email: "Geoff@geoff.geoff",
            phone_number: "01234567890",
          })
        );
      });
  });

  it("returns 404 when passed a user not in the database", () => {
    const mutliUpdate = {
      street_address: "7 Hill Rise",
      city: "Heathfield",
      postcode: "TN218LU",
      county: "",
    };
    return request(app)
      .patch("/api/users/geoffrey")
      .send(mutliUpdate)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });
});

describe.skip("GET /api/match/:username", () => {
  it("responds with a list of users", () => {
    return request(app)
      .get("/api/matches/Dave")
      .expect(200)
      .then(({ body: { matches } }) => {
        expect(matches).toBeInstanceOf(Array);
      });
  });

  it("only responds with users that are reachable within the distance radius", () => {
    return request(app)
      .get("/api/matches/Dave")
      .expect(200)
      .then(({ body: { matches } }) => {
        expect(matches.length).toBe(1);
      });
  });

  it("responds with a list of desired games for each matched user", () => {
    return request(app)
      .get("/api/matches/Geoff")
      .expect(200)
      .then(({ body: { matches } }) => {
        expect(matches[0].games.length).toBe(3);
        matches[0].games.forEach((game) =>
          expect(game).toEqual(
            expect.objectContaining({
              name: expect.any(String),
              category_slug: expect.any(String),
              category_id: expect.any(String),
            })
          )
        );
      });
  });

  it("responds with an empty array if no other users are in that users catchment area", () => {
    return request(app)
      .get("/api/matches/Jennifer")
      .expect(200)
      .then(({ body: { matches } }) => {
        expect(matches.length).toBe(0);
      });
  });

  it("responds with a 404 if the user does not exist", () => {
    return request(app)
      .get("/api/matches/wiggleWilmur")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });

  it("responds with 0 results if there is noone within the max distance", () => {
    const newUser = {
      username: "Nathan",
      avatar_url: "",
      first_name: "Nathan",
      last_name: "Nathan",
      dob: "1998-05-23",
      street_address: "38 Artillery Place",
      city: "London",
      postcode: "SE184EP",
      county: "Greater London",
      country: "UK",
      distance_radius: 1,
      email: "Nathan@nathan.nathaniel",
      phone_number: "75328075809",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .then(({ body: { newUser } }) => {
        expect(newUser).toBeInstanceOf(Object);
      })
      .then(() => {
        return request(app).get("/api/matches/Nathan").expect(200);
      })
      .then(({ body: { matches } }) => {
        expect(matches).toBeInstanceOf(Array);
        expect(matches.length).toBe(0);
      });
  });
});

describe("GET /api/sessions/:username", () => {
  it("returns the users sessions when passed a valid username", () => {
    return request(app)
      .get("/api/sessions/Dave")
      .expect(200)
      .then(({ body: { sessions } }) => {
        expect(sessions).toBeInstanceOf(Array);
        expect(sessions.length).toBe(1);
      });
  });

  it("returns the users sessions when the valid user has 2 sessions", () => {
    return request(app)
      .get("/api/sessions/Geoff")
      .expect(200)
      .then(({ body: { sessions } }) => {
        expect(sessions.length).toBe(2);
        sessions.forEach((session) => {
          session_id: expect.any(Number);
          user_a_name: expect.any(String);
          user_b_name: expect.any(String);
        });
      });
  });

  it("returns a 404 when passed a bad username", () => {
    return request(app)
      .get("/api/sessions/Potato")
      .expect(404)
      .expect(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });
});
describe("POST /api/sessions", () => {
  it("returns the new session object", () => {
    return request(app)
      .post("/api/sessions")
      .send({
        user_a_name: "Dave",
        user_b_name: "Jennifer",
      })
      .expect(201)
      .then(({ body: { session } }) => {
        expect(session).toEqual({
          session_id: 3,
          user_a_name: "Dave",
          user_b_name: "Jennifer",
        });
      });
  });
  it("returns a 400 if a session already exists", () => {
    return request(app)
      .post("/api/sessions")
      .send({
        user_a_name: "Geoff",
        user_b_name: "Dave",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("session already exists");
      });
  });
  it("returns a 400 if the users do not exist", () => {
    return request(app)
      .post("/api/sessions")
      .send({
        user_a_name: "bjorkl",
        user_b_name: "J3nn1f3r",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  it("returns a 400 if either key is undefined", () => {
    return request(app)
      .post("/api/sessions")
      .send({
        user_b_name: "Dave",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/messages/:session_id", () => {
  it("responds with a list of all messages in the session", () => {
    return request(app)
      .get("/api/messages/1")
      .expect(200)
      .then(({ body: { messages } }) => {
        expect(messages).toBeInstanceOf(Array);
        expect(messages.length).toBe(2);
      });
  });
  it("responds with messages in chronological order", () => {
    return request(app)
      .get("/api/messages/1")
      .expect(200)
      .then(({ body: { messages } }) => {
        expect(messages).toBeSortedBy("message_id", {
          descending: false,
        });
      });
  });
  it("responds with a 404 if the session key does not exist", () => {
    return request(app)
      .get("/api/messages/1000000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("session not found");
      });
  });
  it("responds with a 400 if the session key is invalid", () => {
    return request(app)
      .get("/api/messages/chicken_nuggets")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
describe("POST /api/messages/:session_id", () => {
  it("returns 201 and the posted message", () => {
    const newMessage = {
      author_name: "Geoff",
      message_body: "Sorry I was ignoring you",
    };

    return request(app)
      .post("/api/messages/2")
      .send(newMessage)
      .expect(201)
      .then(({ body: { message } }) => {
        expect(message).toEqual(
          expect.objectContaining({
            session_id: 2,
            author_name: "Geoff",
            message_body: "Sorry I was ignoring you",
            created_at: expect.any(String),
          })
        );
      });
  });

  it("returns 400 when a user posts a message to a session they are not contained in", () => {
    const newMessage = {
      author_name: "Dave",
      message_body: "Hello Geoff?",
    };

    return request(app)
      .post("/api/messages/1")
      .send(newMessage)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("responds 400 when a user posts an empty message_body", () => {
    const newMessage = {
      author_name: "Geoff",
      message_body: "",
    };

    return request(app)
      .post("/api/messages/1")
      .send(newMessage)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  it("responds 404 when a user posts to a non-existent session", () => {
    const newMessage = { author_name: "Dave", message_body: "Hello Geoff?" };

    return request(app)
      .post("/api/messages/5")
      .send(newMessage)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("session not found");
      });
  });
});

describe.only("GET /api/users/:username/games", () => {
  it("returns 200 and an array of games", () => {
    return request(app)
      .get("/api/users/Geoff/games")
      .expect(200)
      .then(({ body: { games } }) => {
        expect(games.length).toBe(4);
        games.forEach((game) => {
          expect.objectContaining({
            game_name: expect.any(String),
            category_id: expect.stringMatching(/^d*$/),
            category_name: expect.any(String),
          });
        });
      });
  });

  it("returns 404 when given a username that does not exist", () => {
    return request(app)
      .get("/api/users/gertrude/games")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("user not found");
      });
  });

  it("returns 200 and an empty array when the user has no games", () => {
    const newUser = {
      username: "nogames",
      avatar_url: "",
      first_name: "no",
      last_name: "games",
      dob: "1990-10-10",
      street_address: "123 nogames",
      city: "sennen",
      postcode: "TR197AW",
      county: "",
      country: "UK",
      distance_radius: "0.1",
      email: "no@games.none",
      phone_number: "01234567890",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .then(({ body: { newUser } }) => {
        expect(newUser).toBeInstanceOf(Object);
      })
      .then(() => {
        return request(app).get("/api/users/nogames/games").expect(200);
      })
      .then(({ body: { games } }) => {
        expect(games).toBeInstanceOf(Array);
        expect(games.length).toBe(0);
      });
  });
});
