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
    distance_radius: "1000",
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

    return request(app)
      .post("/api/users")
      .send(badDataTypeUser)
      .expect(400)
      .then(({ body: { msg } }) => expect(msg).toBe("bad request"));
  });

  it("returns 400 status when passed a user name that already exists in the database", () => {
    const postUser = {
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
      distance_radius: "10",
      email: "Geoff@geoff.geoff",
      phone_number: "01234567890",
    };

    return request(app)
      .post("/api/users")
      .send(postUser)
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
      distance_radius: "1000",
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
    const postUser = {
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
      distance_radius: "-10",
      email: "Geoff@geoff.geoff",
      phone_number: "01234567890",
    };

    return request(app)
      .post("/api/users")
      .send(postUser)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username already taken");
      });
  });
});
