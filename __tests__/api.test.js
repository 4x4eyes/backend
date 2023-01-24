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
});
