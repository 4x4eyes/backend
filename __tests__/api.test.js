const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("GET /", () => {
  it("responds", () => {
    return request(app)
      .get("/")
      .expect(200)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("connected");
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
            user_id: 4,
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
      username: "Geoff",
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
});

describe("get single user", () => {
  it("responds status 200 and a single user object", () => {
    return request(app)
      .get("/api/users/Dave")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual(
          expect.objectContaining({
            user_id: 2,
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

describe("PATCH users/:username", () => {
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
